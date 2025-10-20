// @ts-nocheck
import { db } from '../db';
import { contentLibrary } from '@shared/schema';
import { eq, ne, sql, and } from 'drizzle-orm';

interface DuplicateMatch {
  id: string;
  title: string;
  baseContent: string;
  similarity: number;
  createdAt: Date;
}

interface DuplicateCheckResult {
  isDuplicate: boolean;
  exactMatch: boolean;
  matches: DuplicateMatch[];
  highestSimilarity: number;
}

export class DuplicateDetectionService {
  private readonly EXACT_MATCH_THRESHOLD = 0.95;
  private readonly SIMILAR_MATCH_THRESHOLD = 0.75;

  generateFingerprint(text: string): string {
    const normalized = this.normalizeText(text);
    
    const words = normalized.split(/\s+/).filter(w => w.length > 2);
    const wordFreq = new Map<string, number>();
    
    words.forEach(word => {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    });
    
    const sortedWords = Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word]) => word)
      .join('|');
    
    return sortedWords;
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\sÀ-ỹ]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  calculateSimilarity(text1: string, text2: string): number {
    const normalized1 = this.normalizeText(text1);
    const normalized2 = this.normalizeText(text2);

    if (normalized1 === normalized2) return 1.0;

    const words1 = new Set(normalized1.split(/\s+/));
    const words2 = new Set(normalized2.split(/\s+/));
    
    const intersection = new Set(Array.from(words1).filter(x => words2.has(x)));
    const union = new Set([...Array.from(words1), ...Array.from(words2)]);
    
    const jaccardSimilarity = intersection.size / union.size;

    const levenshteinScore = 1 - (this.levenshteinDistance(normalized1, normalized2) / Math.max(normalized1.length, normalized2.length));
    
    return (jaccardSimilarity * 0.6 + levenshteinScore * 0.4);
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  async checkForDuplicates(
    text: string,
    excludeId?: string
  ): Promise<DuplicateCheckResult> {
    const fingerprint = this.generateFingerprint(text);
    
    const queryConditions = [
      ne(contentLibrary.status, 'archived')
    ];
    
    if (excludeId) {
      queryConditions.push(ne(contentLibrary.id, excludeId));
    }

    let candidates = await db
      .select()
      .from(contentLibrary)
      .where(
        and(
          ...queryConditions,
          eq(contentLibrary.contentFingerprint, fingerprint)
        )
      );

    if (candidates.length === 0) {
      candidates = await db
        .select()
        .from(contentLibrary)
        .where(and(...queryConditions))
        .limit(100);
    }

    const matches: DuplicateMatch[] = [];
    let highestSimilarity = 0;
    let exactMatch = false;

    for (const content of candidates) {
      const similarity = this.calculateSimilarity(text, content.baseContent);
      
      if (similarity >= this.SIMILAR_MATCH_THRESHOLD) {
        matches.push({
          id: content.id,
          title: content.title,
          baseContent: content.baseContent,
          similarity: Math.round(similarity * 100) / 100,
          createdAt: content.createdAt!
        });
        
        if (similarity > highestSimilarity) {
          highestSimilarity = similarity;
        }
        
        if (similarity >= this.EXACT_MATCH_THRESHOLD) {
          exactMatch = true;
        }
      }
    }

    matches.sort((a, b) => b.similarity - a.similarity);

    return {
      isDuplicate: matches.length > 0,
      exactMatch,
      matches: matches.slice(0, 5),
      highestSimilarity: Math.round(highestSimilarity * 100) / 100
    };
  }

  async updateContentFingerprint(contentId: string, text: string): Promise<void> {
    const fingerprint = this.generateFingerprint(text);
    
    await db
      .update(contentLibrary)
      .set({ 
        contentFingerprint: fingerprint,
        updatedAt: new Date()
      })
      .where(eq(contentLibrary.id, contentId));
  }
}

export const duplicateDetectionService = new DuplicateDetectionService();
