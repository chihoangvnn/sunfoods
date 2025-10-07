import Papa from 'papaparse';
import { z } from 'zod';

// CSV Row Schema
export const csvMediaRowSchema = z.object({
  url: z.string().url({ message: 'Invalid URL format' }),
  filename: z.string().min(1, { message: 'Filename is required' }),
  altText: z.string().optional(),
  caption: z.string().optional(),
  tags: z.string().optional(), // Comma-separated tags
  category: z.string().optional(),
});

export type CSVMediaRow = z.infer<typeof csvMediaRowSchema>;

export interface ParsedCSVResult {
  success: boolean;
  data: CSVMediaRow[];
  errors: Array<{
    row: number;
    field?: string;
    message: string;
    value?: any;
  }>;
  totalRows: number;
  validRows: number;
  invalidRows: number;
}

export interface CSVParseOptions {
  skipEmptyLines?: boolean;
  maxRows?: number;
}

/**
 * Parse CSV string and validate media upload data
 */
export function parseMediaCSV(
  csvContent: string,
  options: CSVParseOptions = {}
): ParsedCSVResult {
  const {
    skipEmptyLines = true,
    maxRows = 1000,
  } = options;

  const result: ParsedCSVResult = {
    success: true,
    data: [],
    errors: [],
    totalRows: 0,
    validRows: 0,
    invalidRows: 0,
  };

  // Parse CSV
  const parsed = Papa.parse<Record<string, any>>(csvContent, {
    header: true,
    skipEmptyLines,
    transformHeader: (header) => header.trim(),
  });

  if (parsed.errors && parsed.errors.length > 0) {
    result.success = false;
    result.errors = parsed.errors.map((err: any, idx: number) => ({
      row: err.row || idx,
      message: err.message,
    }));
    return result;
  }

  const dataRows = parsed.data || [];
  result.totalRows = dataRows.length;

  // Check max rows limit
  if (result.totalRows > maxRows) {
    result.success = false;
    result.errors.push({
      row: 0,
      message: `CSV exceeds maximum allowed rows (${maxRows}). Found ${result.totalRows} rows.`,
    });
    return result;
  }

  // Validate each row
  dataRows.forEach((row: any, index: number) => {
      const rowNumber = index + 2; // +2 to account for header row (spreadsheet line numbers)

      // Skip completely empty rows
      if (!row || Object.keys(row).length === 0) {
        return;
      }

      // Validate row against schema
      const validation = csvMediaRowSchema.safeParse(row);

      if (!validation.success) {
        result.invalidRows++;
        result.success = false;

        // Extract validation errors
        validation.error.errors.forEach((err) => {
          result.errors.push({
            row: rowNumber,
            field: err.path.join('.'),
            message: err.message,
            value: row[err.path[0] as string],
          });
        });
      } else {
        result.validRows++;
        result.data.push(validation.data);
      }
    });

  return result;
}

/**
 * Convert CSV row tags string to array
 */
export function parseTagsFromCSV(tagsString?: string): string[] {
  if (!tagsString) return [];
  return tagsString
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);
}

/**
 * Validate CSV headers
 */
export function validateCSVHeaders(csvContent: string): {
  valid: boolean;
  missing: string[];
  extra: string[];
} {
  const requiredHeaders = ['url', 'filename'];
  const optionalHeaders = ['altText', 'caption', 'tags', 'category'];
  const allValidHeaders = [...requiredHeaders, ...optionalHeaders];

  // Parse just the headers
  const parsed = Papa.parse(csvContent, {
    header: true,
    preview: 1,
  });

  const headers = parsed.meta.fields || [];
  const trimmedHeaders = headers.map(h => h.trim());

  const missing = requiredHeaders.filter(h => !trimmedHeaders.includes(h));
  const extra = trimmedHeaders.filter(h => !allValidHeaders.includes(h));

  return {
    valid: missing.length === 0,
    missing,
    extra,
  };
}

/**
 * Generate CSV template
 */
export function generateCSVTemplate(): string {
  const headers = ['url', 'filename', 'altText', 'caption', 'tags', 'category'];
  const exampleRow = [
    'https://example.com/image.jpg',
    'my-image.jpg',
    'Description of image',
    'This is a great photo!',
    'food,restaurant,delicious',
    'Marketing'
  ];

  return Papa.unparse({
    fields: headers,
    data: [exampleRow],
  });
}
