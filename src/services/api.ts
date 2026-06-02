/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Deal, Store, ActiveFilters } from '../types';

const BASE_URL = 'https://www.cheapshark.com/api/1.0';

/**
 * Fetch all available stores from CheapShark to display logos and titles.
 */
export async function fetchStores(): Promise<Store[]> {
  try {
    const response = await fetch(`${BASE_URL}/stores`);
    if (!response.ok) {
      throw new Error(`Failed to fetch stores: ${response.statusText}`);
    }
    const data: Store[] = await response.json();
    // Cache active stores
    return data.filter(store => store.isActive === 1);
  } catch (error) {
    console.error('Error fetching stores:', error);
    // Return standard fallback stores if API fails or blocks CORS
    return getFallbackStores();
  }
}

/**
 * Fetch gaming deals based on active filters and search query.
 * Handles parameters for stores, pricing, page number, sorting, and discount percentages (1% to 100%).
 */
export async function fetchDeals(filters: ActiveFilters, page: number = 0, pageSize: number = 50): Promise<Deal[]> {
  try {
    const params = new URLSearchParams();
    
    // Search query
    if (filters.searchQuery.trim()) {
      params.append('title', filters.searchQuery.trim());
    }
    
    // Store IDs filtering
    if (filters.storeIDs.length > 0) {
      params.append('storeID', filters.storeIDs.join(','));
    }
    
 // Price range filters
if (filters.minPrice > 0) {
  params.append('lowerPrice', filters.minPrice.toString());
}
if (filters.maxPrice < 100) {
  params.append('upperPrice', filters.maxPrice.toString());
}
    
    // Sorting parameters
    // CheapShark sorting keys: Deal Rating, Title, Savings, Price
    let cheapSharkSort = 'Savings';
    if (filters.sortBy === 'price') {
      cheapSharkSort = 'Price';
    } else if (filters.sortBy === 'title') {
      cheapSharkSort = 'Title';
    } else if (filters.sortBy === 'rating') {
      cheapSharkSort = 'Deal Rating';
    }
    params.append('sortBy', cheapSharkSort);
    params.append('desc', filters.desc ? '1' : '0');
    
    // Pagination
    params.append('pageNumber', page.toString());
    params.append('pageSize', pageSize.toString());
    
    // Ensure onSale is 1 to retrieve actual discounted deals (or free list) unless search query is active
    if (!filters.searchQuery.trim()) {
      params.append('onSale', '1');
    }

    const url = `${BASE_URL}/deals?${params.toString()}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch deals: ${response.statusText}`);
    }
    
    let deals: Deal[] = await response.json();
    
    // Client-side filter for exact discount percentage (1% to 100%)
    // "أضف خصم من 1% إلى غاية 100% في كل المنصات"
    deals = deals.filter(deal => {
      const savings = parseFloat(deal.savings);
      const salePrice = parseFloat(deal.salePrice);
      const isFree = salePrice === 0 || deal.savings === "100.000000";
      
      // If the game is free, keep it. Otherwise, filter by the input discount range.
      if (isFree) return true;
      return savings >= filters.minDiscount && savings <= filters.maxDiscount;
    });

    return deals;
  } catch (error) {
    console.error('Error fetching deals:', error);
    return [];
  }
}

/**
 * Fetch free games exclusively across all platforms.
 * Uses the CheapShark API deals endpoint with upperPrice=0.
 */
export async function fetchFreeGames(): Promise<Deal[]> {
  try {
    const url = `${BASE_URL}/deals?upperPrice=0&pageSize=502&sortBy=Savings`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch free games: ${response.statusText}`);
    }
    const deals: Deal[] = await response.json();
    
    // Ensure they are actually free or 100% discount
    return deals.filter(deal => parseFloat(deal.salePrice) === 0);
  } catch (error) {
    console.error('Error fetching free games:', error);
    return [];
  }
}

/**
 * Fallback static stores data in case CheapShark API is unresponsive or rate-limited.
 */
function getFallbackStores(): Store[] {
  return [
    { storeID: "1", storeName: "Steam", isActive: 1, images: { banner: "", logo: "", icon: "" } },
    { storeID: "2", storeName: "GamersGate", isActive: 1, images: { banner: "", logo: "", icon: "" } },
    { storeID: "3", storeName: "GreenManGaming", isActive: 1, images: { banner: "", logo: "", icon: "" } },
    { storeID: "7", storeName: "GOG", isActive: 1, images: { banner: "", logo: "", icon: "" } },
    { storeID: "11", storeName: "Humble Store", isActive: 1, images: { banner: "", logo: "", icon: "" } },
    { storeID: "21", storeName: "Origin", isActive: 1, images: { banner: "", logo: "", icon: "" } },
    { storeID: "25", storeName: "Epic Games Store", isActive: 1, images: { banner: "", logo: "", icon: "" } },
    { storeID: "31", storeName: "Blizzard Shop", isActive: 1, images: { banner: "", logo: "", icon: "" } },
  ];
}
