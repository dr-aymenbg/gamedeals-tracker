/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Deal {
  dealID: string;
  title: string;
  storeID: string;
  gameID: string;
  salePrice: string;
  normalPrice: string;
  isOnSale: string;
  savings: string;
  metacriticScore: string;
  steamRatingText: string | null;
  steamRatingPercent: string;
  steamRatingCount: string;
  steamAppID: string | null;
  releaseDate: number;
  lastChange: number;
  dealRating: string;
  thumb: string;
}

export interface Store {
  storeID: string;
  storeName: string;
  isActive: number;
  images: {
    banner: string;
    logo: string;
    icon: string;
  };
}

export interface ActiveFilters {
  searchQuery: string;
  storeIDs: string[];
  minPrice: number;
  maxPrice: number;
  minDiscount: number;
  maxDiscount: number;
  sortBy: string;
  desc: boolean;
}

export type Language = 'en' | 'ar' | 'fr';

export interface Translations {
  appTitle: string;
  appSubtitle: string;
  freeGamesHeader: string;
  freeGamesSubtitle: string;
  noFreeGames: string;
  dealsHeader: string;
  dealsSubtitle: string;
  searchPlaceholder: string;
  filterTitle: string;
  storeFilter: string;
  priceFilter: string;
  discountFilter: string;
  sortByLabel: string;
  sortBySavings: string;
  sortByPrice: string;
  sortByTitle: string;
  sortByRating: string;
  discountPercentage: string;
  originalPrice: string;
  currentPrice: string;
  free: string;
  viewOnStore: string;
  steamDBLink: string;
  steamDBWidgetTitle: string;
  steamDBWidgetSubtitle: string;
  steamDBWidgetBtn: string;
  loading: string;
  error: string;
  noDealsFound: string;
  allStores: string;
  minLabel: string;
  maxLabel: string;
  showingResults: string;
}
