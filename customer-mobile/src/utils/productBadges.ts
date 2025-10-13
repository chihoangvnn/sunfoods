import { BadgeType } from '@/components/OrganicBadges';

interface Product {
  id: string;
  name: string;
  category_id?: string;
  isOrganic?: boolean;
  isFresh?: boolean;
  isVietGAP?: boolean;
  isSafeFarming?: boolean;
  farmOrigin?: 'dalat' | 'sapa' | 'mekong';
  countryOrigin?: 'usa' | 'australia' | 'thailand' | 'newzealand' | 'japan' | 'korea';
  deliveryTime?: number; // hours
  harvestDate?: string | Date;
  createdAt?: string | Date;
}

/**
 * Determines which badges to display for a product
 * Priority: Certification > Freshness > Farm/Country Origin
 * Max 3 badges displayed
 */
export function getProductBadges(product: Product): BadgeType[] {
  const badges: BadgeType[] = [];

  // 1. Certification badges (highest priority)
  if (product.isOrganic) {
    badges.push('organic');
  }
  if (product.isVietGAP) {
    badges.push('vietgap');
  }
  if (product.isSafeFarming) {
    badges.push('safe-farming');
  }

  // 2. Freshness badges (medium priority)
  // Check if harvested today
  if (product.harvestDate) {
    const harvestDate = new Date(product.harvestDate);
    const today = new Date();
    const isToday = harvestDate.toDateString() === today.toDateString();
    
    if (isToday) {
      badges.push('fresh-today');
    }
  }

  // Check if newly harvested (within 2 days)
  if (product.harvestDate && !badges.includes('fresh-today')) {
    const harvestDate = new Date(product.harvestDate);
    const daysSinceHarvest = Math.floor((Date.now() - harvestDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceHarvest <= 2) {
      badges.push('new-harvest');
    }
  }

  // Fast delivery
  if (product.deliveryTime && product.deliveryTime <= 2) {
    badges.push('fast-delivery');
  }

  // 3. Origin badges (lower priority)
  // Farm origin
  if (product.farmOrigin) {
    const farmBadgeMap: Record<string, BadgeType> = {
      'dalat': 'farm-dalat',
      'sapa': 'farm-sapa',
      'mekong': 'farm-mekong'
    };
    const farmBadge = farmBadgeMap[product.farmOrigin];
    if (farmBadge) {
      badges.push(farmBadge);
    }
  }

  // Country origin (for imported products)
  if (product.countryOrigin) {
    const countryBadgeMap: Record<string, BadgeType> = {
      'usa': 'usa',
      'australia': 'australia',
      'thailand': 'thailand',
      'newzealand': 'newzealand',
      'japan': 'japan',
      'korea': 'korea'
    };
    const countryBadge = countryBadgeMap[product.countryOrigin];
    if (countryBadge) {
      badges.push(countryBadge);
    }
  }

  // Return max 3 badges (highest priority first)
  return badges.slice(0, 3);
}

/**
 * Auto-detect product properties from name and description
 * Fallback when explicit properties are not set
 */
export function detectProductBadges(product: Product): BadgeType[] {
  const badges: BadgeType[] = [];
  const searchText = `${product.name} ${product.category_id || ''}`.toLowerCase();

  // Detect organic
  if (searchText.includes('organic') || searchText.includes('hữu cơ')) {
    badges.push('organic');
  }

  // Detect fresh
  if (searchText.includes('tươi') || searchText.includes('fresh')) {
    badges.push('fresh-today');
  }

  // Detect farm origin
  if (searchText.includes('đà lạt') || searchText.includes('dalat')) {
    badges.push('farm-dalat');
  }
  if (searchText.includes('sapa') || searchText.includes('sa pa')) {
    badges.push('farm-sapa');
  }
  if (searchText.includes('mekong') || searchText.includes('mê kông') || searchText.includes('cần thơ')) {
    badges.push('farm-mekong');
  }

  // Detect country origin
  if (searchText.includes('usa') || searchText.includes('mỹ') || searchText.includes('hoa kỳ')) {
    badges.push('usa');
  }
  if (searchText.includes('úc') || searchText.includes('australia')) {
    badges.push('australia');
  }
  if (searchText.includes('thái lan') || searchText.includes('thailand')) {
    badges.push('thailand');
  }
  if (searchText.includes('new zealand') || searchText.includes('nz')) {
    badges.push('newzealand');
  }
  if (searchText.includes('nhật') || searchText.includes('japan')) {
    badges.push('japan');
  }
  if (searchText.includes('hàn') || searchText.includes('korea')) {
    badges.push('korea');
  }

  return badges.slice(0, 3);
}
