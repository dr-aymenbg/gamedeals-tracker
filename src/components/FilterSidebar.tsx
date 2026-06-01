/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ActiveFilters, Store, Language, Translations } from '../types';
import { 
  SlidersHorizontal, Check, Search, DollarSign, Percent, 
  RotateCcw, SortAsc, SortDesc, ChevronDown, ChevronUp 
} from 'lucide-react';

interface FilterSidebarProps {
  filters: ActiveFilters;
  onFiltersChange: (newFilters: ActiveFilters) => void;
  stores: Store[];
  language: Language;
  t: Translations;
}

export default function FilterSidebar({ filters, onFiltersChange, stores, language, t }: FilterSidebarProps) {
  const isArabic = language === 'ar';
  
  // Collapsed state on mobile of various panels
  const [collapsedStores, setCollapsedStores] = useState(false);
  const [collapsedSliders, setCollapsedSliders] = useState(false);

  // Popular stores we want to prioritize on top
  const popularStoreIDs = ["1", "25", "7", "11"]; // Steam, Epic, GOG, Humble

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, searchQuery: e.target.value });
  };

  const handleStoreToggle = (storeID: string) => {
    const freshStoreIDs = filters.storeIDs.includes(storeID)
      ? filters.storeIDs.filter(id => id !== storeID)
      : [...filters.storeIDs, storeID];
    onFiltersChange({ ...filters, storeIDs: freshStoreIDs });
  };

  const handleToggleAllStores = () => {
    onFiltersChange({ ...filters, storeIDs: [] });
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onFiltersChange({ ...filters, maxPrice: isNaN(val) ? 80 : val });
  };

  const handleMinDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    onFiltersChange({ ...filters, minDiscount: isNaN(val) ? 1 : val });
  };

  const handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, sortBy: e.target.value });
  };

  const handleToggleDesc = () => {
    onFiltersChange({ ...filters, desc: !filters.desc });
  };

  const handleResetFilters = () => {
    onFiltersChange({
      searchQuery: '',
      storeIDs: [],
      minPrice: 0,
      maxPrice: 80,
      minDiscount: 1,
      maxDiscount: 100,
      sortBy: 'savings',
      desc: true
    });
  };

  return (
    <div 
      id="filter-sidebar" 
      className="w-full lg:w-72 bg-[#131a30]/80 border border-slate-800 rounded-xl p-5 sticky top-24 backdrop-blur-md self-start"
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-purple-400" />
          <h2 className="text-white font-display font-semibold text-base">{t.filterTitle}</h2>
        </div>
        
        <button
          id="btn-reset-filters"
          onClick={handleResetFilters}
          className="p-1 px-2.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition duration-200 text-xs flex items-center gap-1.5 cursor-pointer font-mono"
        >
          <RotateCcw size={12} />
          <span>{isArabic ? 'إعادة تعيين' : 'Reset'}</span>
        </button>
      </div>

      {/* 1. Search Box (Live Querying) */}
      <div className="mb-5 relative" id="sidebar-search-container">
        <label className="text-xs text-slate-400 uppercase tracking-widest font-mono font-medium block mb-2">
          {isArabic ? 'بحث باسم اللعبة' : 'Game Search'}
        </label>
        <div className="relative">
          <input
            id="sidebar-search-input"
            type="text"
            value={filters.searchQuery}
            onChange={handleSearchChange}
            placeholder={t.searchPlaceholder}
            className="w-full bg-[#0d1321]/90 border border-slate-800/80 rounded-lg py-2.5 pl-3.5 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/40 transition duration-300"
          />
          <Search size={15} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isArabic ? 'left-3' : 'right-3'}`} />
        </div>
      </div>

      {/* 2. Sorting Controls */}
      <div className="mb-5" id="sidebar-sorting-container">
        <label className="text-xs text-slate-400 uppercase tracking-widest font-mono font-medium block mb-2">
          {t.sortByLabel}
        </label>
        <div className="flex gap-1.5">
          <select
            id="sort-select"
            value={filters.sortBy}
            onChange={handleSortByChange}
            className="flex-grow bg-[#0d1321] border border-slate-800/80 rounded-lg px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-purple-500 transition duration-300"
          >
            <option value="savings">{t.sortBySavings}</option>
            <option value="price">{t.sortByPrice}</option>
            <option value="title">{t.sortByTitle}</option>
            <option value="rating">{t.sortByRating}</option>
          </select>
          <button
            id="btn-toggle-sort-order"
            onClick={handleToggleDesc}
            className="p-2 border border-slate-800 hover:border-slate-700 bg-[#0d1321] text-slate-300 hover:text-white rounded-lg transition duration-200 cursor-pointer flex items-center justify-center aspect-square"
            title={filters.desc ? 'Descending' : 'Ascending'}
          >
            {filters.desc ? <SortDesc size={16} /> : <SortAsc size={16} />}
          </button>
        </div>
      </div>

      {/* 3. Sliders Section */}
      <div className="mb-5 border-t border-slate-800/50 pt-4" id="sidebar-sliders">
        <button
          onClick={() => setCollapsedSliders(!collapsedSliders)}
          className="flex items-center justify-between w-full text-left cursor-pointer hover:text-purple-400 transition duration-150"
        >
          <span className="text-xs text-slate-300 uppercase tracking-widest font-bold font-mono">
            {isArabic ? 'حدود الميزانية والخصم' : 'Budget & Discounts'}
          </span>
          {collapsedSliders ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>

        {!collapsedSliders && (
          <div className="space-y-5 mt-4">
            {/* Price Cap */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <DollarSign size={13} className="text-purple-400" />
                  <span>{t.priceFilter}</span>
                </span>
                <span className="text-purple-400 font-bold">
                  {filters.maxPrice >= 80 ? '∞' : `$${filters.maxPrice.toFixed(2)}`}
                </span>
              </div>
              <input
                id="price-range-slider"
                type="range"
                min="0"
                max="80"
                step="2"
                value={filters.maxPrice}
                onChange={handleMaxPriceChange}
                className="w-full accent-purple-600 cursor-pointer bg-slate-900 rounded-lg appearance-none h-1.5 focus:outline-none"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>$0</span>
                <span>$40</span>
                <span>{t.maxLabel} ($80+)</span>
              </div>
            </div>

            {/* Discount Percentage %: 1% to 100% as requested */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <Percent size={13} className="text-purple-400" />
                  <span>{t.discountFilter}</span>
                </span>
                <span className="text-purple-400 font-bold">
                  {filters.minDiscount}% - 100%
                </span>
              </div>
              <input
                id="discount-range-slider"
                type="range"
                min="1"
                max="100"
                value={filters.minDiscount}
                onChange={handleMinDiscountChange}
                className="w-full accent-purple-600 cursor-pointer bg-slate-900 rounded-lg appearance-none h-1.5 focus:outline-none"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>1% {isArabic ? 'خصم كحد أدنى' : 'Min'}</span>
                <span>50%</span>
                <span>100% ({t.free})</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Storefront Filters */}
      <div className="mb-2 border-t border-slate-800/50 pt-4" id="sidebar-stores">
        <button
          onClick={() => setCollapsedStores(!collapsedStores)}
          className="flex items-center justify-between w-full text-left cursor-pointer hover:text-purple-400 transition duration-150 mb-3"
        >
          <span className="text-xs text-slate-300 uppercase tracking-widest font-bold font-mono">
            {t.storeFilter}
          </span>
          {collapsedStores ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>

        {!collapsedStores && (
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {/* "All Stores" option */}
            <button
              id="store-btn-all"
              onClick={handleToggleAllStores}
              className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition ${
                filters.storeIDs.length === 0
                  ? 'bg-slate-800 text-purple-400 border border-purple-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <span>{t.allStores}</span>
              {filters.storeIDs.length === 0 && <Check size={14} />}
            </button>

            {/* Dynamic Store List fetched from CheapShark */}
            {stores.map((store) => {
              const isSelected = filters.storeIDs.includes(store.storeID);
              const isPopular = popularStoreIDs.includes(store.storeID);
              const storeImageUrl = store.storeID === "1" 
                ? 'https://www.cheapshark.com/img/stores/icons/0.png' 
                : `https://www.cheapshark.com/img/stores/icons/${parseInt(store.storeID) - 1}.png`;

              return (
                <button
                  key={store.storeID}
                  id={`store-btn-${store.storeID}`}
                  onClick={() => handleStoreToggle(store.storeID)}
                  className={`flex items-center justify-between w-full px-2.5 py-2.5 rounded-lg text-xs font-medium cursor-pointer transition ${
                    isSelected
                      ? 'bg-purple-950/40 text-purple-400 border border-purple-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#111728]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <img 
                      src={storeImageUrl} 
                      alt={store.storeName} 
                      className="w-4 h-4 rounded-sm object-contain"
                      onError={(e) => {
                        // Hide image if broken or error loading
                        (e.target as HTMLImageElement).style.visibility = 'hidden';
                      }}
                    />
                    <span className={isPopular ? 'font-semibold text-slate-200' : ''}>
                      {store.storeName}
                    </span>
                  </div>
                  {isSelected && <Check size={14} className="text-purple-400" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
