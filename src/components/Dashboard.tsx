/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Deal, Store, ActiveFilters, Language } from '../types';
import { translations } from '../translations';
import { fetchStores, fetchDeals, fetchFreeGames } from '../services/api';
import GameCard from './GameCard';
import FilterSidebar from './FilterSidebar';
import LanguageSelector from './LanguageSelector';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, Gamepad2, AlertTriangle, ChevronRight, 
  ChevronLeft, Sparkles, HelpCircle 
} from 'lucide-react';

export default function Dashboard() {
  const [language, setLanguage] = useState<Language>('en');
  const t = translations[language];
  const isArabic = language === 'ar';

  // API states
  const [deals, setDeals] = useState<Deal[]>([]);
  const [freeGames, setFreeGames] = useState<Deal[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filtering state
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [filters, setFilters] = useState<ActiveFilters>({
    searchQuery: '',
    storeIDs: [],
    minPrice: 0,
    maxPrice: 100,
    minDiscount: 0, // Default matching instructions: "أضف خصم من 1% إلى غاية 100% في كل المنصات"
    maxDiscount: 100,
    sortBy: 'savings',
    desc: true
  });

  // On mount: Fetch general dynamic stores and free games initial block
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        const [storesList, freeList] = await Promise.all([
          fetchStores(),
          fetchFreeGames()
        ]);
        setStores(storesList);
        setFreeGames(freeList);
        
        // Fetch initially matching deals based on default filters
        const dealsList = await fetchDeals(filters, 0);
        setDeals(dealsList);
        setError(null);
      } catch (err) {
        setError(t.error);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, [language]); // Reload translated error strings if language switches

  // When filters or pages change, query the deals API
  useEffect(() => {
    let active = true;
    async function loadDeals() {
      try {
        if (page === 0) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        
        const freshDeals = await fetchDeals(filters, page);
        
        if (active) {
          if (page === 0) {
            setDeals(freshDeals);
          } else {
            setDeals(prev => [...prev, ...freshDeals]);
          }
          // If returned deals are less than expected pageSize (50), we reached the end
          setHasMore(freshDeals.length === 50);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(t.error);
        }
      } finally {
        if (active) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    }
    
    // Wait slightly on text search typing to avoid rapid API call flooding
    const delayDebounce = setTimeout(() => {
      loadDeals();
    }, 400);

    return () => {
      active = false;
      clearTimeout(delayDebounce);
    };
  }, [filters, page]);

  // When filters are modified, reset page sequence
  const handleFiltersChange = (newFilters: ActiveFilters) => {
    setFilters(newFilters);
    setPage(0);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  // Helper matching store names & icons for card renders
  const getStoreDetails = (storeID: string) => {
    const store = stores.find(s => s.storeID === storeID);
    if (store) {
      const iconUrl = storeID === "1" 
        ? 'https://www.cheapshark.com/img/stores/icons/0.png' 
        : `https://www.cheapshark.com/img/stores/icons/${parseInt(storeID) - 1}.png`;
      return { name: store.storeName, icon: iconUrl };
    }
    return { name: storeID === "1" ? "Steam" : "Game Store", icon: undefined };
  };

  return (
    <div 
      className="min-h-screen bg-[#070b13] text-[#e2e8f0] pb-20 selection:bg-purple-600 selection:text-white"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {/* 1. Futuristic Header Bar */}
      <header className="sticky top-0 z-50 bg-[#0b0f19]/80 backdrop-blur-md border-b border-slate-800 px-4 py-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center glow-purple border border-purple-400">
              <Gamepad2 className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold bg-gradient-to-r from-white via-slate-100 to-purple-400 bg-clip-text text-transparent uppercase tracking-wider">
                {t.appTitle}
              </h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-normal">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Interactive Language Toggle */}
          <LanguageSelector currentLang={language} onLanguageChange={setLanguage} />
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-8 space-y-12">
        
        {/* 2. Free Games Right Now Section - Highlighted Hero Row */}
        <section id="free-games-hero-section" className="space-y-4">
          <div className="flex items-center justify-between border-b border-purple-500/10 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-6 rounded bg-emerald-500" />
              <div>
                <h2 className="text-lg md:text-xl font-display font-semibold text-white tracking-tight flex items-center gap-2">
                  <span>{t.freeGamesHeader}</span>
                  <Sparkles size={16} className="text-yellow-400 animate-pulse" />
                </h2>
                <p className="text-xs text-slate-400">{t.freeGamesSubtitle}</p>
              </div>
            </div>
          </div>

          {freeGames.length > 0 ? (
            <div 
              id="free-games-slider"
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
            >
              {/* Prominent SteamDB Free Games Portal Card requested by the user */}
              <motion.div
                id="steamdb-free-promo-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="relative flex flex-col justify-between h-full min-h-[340px] bg-gradient-to-b from-[#12182d] to-[#0c0f1b] border border-dashed border-purple-500/40 hover:border-purple-500 rounded-xl p-5 overflow-hidden shadow-2xl hover:shadow-[0_0_20px_rgba(168,85,247,0.25)] transition-all duration-300 group"
              >
                {/* Ambient graphic glow effects */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-600/10 rounded-full blur-2xl group-hover:bg-purple-600/20 transition-all duration-500" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-blue-500/5 rounded-full blur-xl" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] bg-purple-600/25 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider font-mono">
                      SteamDB LIVE
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[9px] text-slate-500 font-mono tracking-wider">SECURE</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-center text-purple-400 group-hover:text-purple-300 group-hover:border-purple-500/50 transition-colors">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.42 3.593 9.99 8.547 11.455l1.096-3.14a3.84 3.84 0 011.666-1.503l.035-.015a3.843 3.843 0 013.313.15c.033.02.062.031.095.05.776.43 1.34 1.157 1.54 2.01l.004.015.719 2.505a12.001 12.001 0 007.411-11.527c0-6.627-5.373-12-12-12zm-3.037 17.51a1.213 1.213 0 01-1.213-1.213c0-.67.543-1.213 1.213-1.213a1.215 1.215 0 011.213 1.213 1.215 1.215 0 01-1.213 1.213zm4.5 1.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm4.512-4.512a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                      </svg>
                    </div>
                    <span className="font-display font-semibold text-slate-200 tracking-tight text-sm">
                      SteamDB Portal
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <h3 className="text-white font-medium text-base tracking-tight leading-tight group-hover:text-purple-300 transition-colors">
                      {t.steamDBWidgetTitle}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {t.steamDBWidgetSubtitle}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-800/60 mt-4">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>SteamDB.info</span>
                    <span className="text-emerald-400 font-bold">{t.free} 100%</span>
                  </div>

                  <a
                    id="steamdb-widget-btn"
                    href="https://steamdb.info/upcoming/free/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-xs font-bold text-slate-200 bg-slate-900/85 hover:bg-purple-600 hover:text-white border border-slate-800 hover:border-purple-400 rounded-lg shadow-lg shadow-purple-900/10 hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer text-center group"
                  >
                    <span>{t.steamDBWidgetBtn}</span>
                    {isArabic ? (
                      <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    ) : (
                      <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    )}
                  </a>
                </div>
              </motion.div>

              {freeGames.map((game) => {
                const storeInfo = getStoreDetails(game.storeID);
                return (
                  <GameCard
                    key={`free-${game.dealID}`}
                    deal={game}
                    language={language}
                    t={t}
                    storeName={storeInfo.name}
                    storeIcon={storeInfo.icon}
                  />
                );
              })}
            </div>
          ) : (
            <div className="bg-[#111726]/40 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs font-mono">
              {t.noFreeGames}
            </div>
          )}
        </section>

        {/* 3. Deal Search and Main Content Layout Grid */}
        <section className="space-y-4" id="all-deals-section">
          {/* Section banner */}
          <div className="flex items-center gap-2 border-b border-purple-500/10 pb-3 mb-6">
            <div className="w-2.5 h-6 rounded bg-purple-600" />
            <div>
              <h2 className="text-lg md:text-xl font-display font-semibold text-white tracking-tight">
                {t.dealsHeader}
              </h2>
              <p className="text-xs text-slate-400">{t.dealsSubtitle}</p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Sidebar (Full control filters & sorting) */}
            <FilterSidebar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              stores={stores}
              language={language}
              t={t}
            />

            {/* List Results Grid */}
            <div className="flex-1 space-y-6">
              
              {/* Filter Counter Banner */}
              <div className="flex justify-between items-center text-xs font-mono text-slate-400 bg-[#131a30]/30 border border-slate-800/60 rounded-lg p-3">
                <span>
                  {t.showingResults.replace('{count}', deals.length.toString())}
                </span>
                <span className="text-purple-400 flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Feeds
                </span>
              </div>

              {/* Status Handler: Loading */}
              {loading && deals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4" id="state-loading">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-purple-600/25 border-t-purple-500 rounded-full animate-spin glow-purple" />
                    <Gamepad2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-400" size={16} />
                  </div>
                  <span className="text-xs text-slate-400 font-mono animate-pulse">{t.loading}</span>
                </div>
              ) : error ? (
                /* Status Handler: Error */
                <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-8 text-center text-red-400 text-xs font-mono space-y-3 flex flex-col items-center justify-center max-w-md mx-auto" id="state-error">
                  <AlertTriangle className="text-red-400 animate-bounce" size={24} />
                  <span>{error}</span>
                </div>
              ) : deals.length === 0 ? (
                /* Status Handler: No matches */
                <div className="bg-[#111726]/40 border border-slate-800 rounded-xl p-16 text-center text-slate-400 text-xs font-mono space-y-2 flex flex-col items-center justify-center" id="state-empty">
                  <HelpCircle size={24} className="text-slate-500" />
                  <span>{t.noDealsFound}</span>
                </div>
              ) : (
                /* Deals list grid */
                <div className="space-y-8">
                  <motion.div 
                    id="deals-catalog-grid"
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                  >
                    <AnimatePresence mode="popLayout">
                      {deals.map((deal) => {
                        const storeInfo = getStoreDetails(deal.storeID);
                        return (
                          <GameCard
                            key={`deal-${deal.dealID}`}
                            deal={deal}
                            language={language}
                            t={t}
                            storeName={storeInfo.name}
                            storeIcon={storeInfo.icon}
                          />
                        );
                      })}
                    </AnimatePresence>
                  </motion.div>

                  {/* Load More Trigger */}
                  {hasMore && (
                    <div className="flex justify-center pt-4">
                      <button
                        id="btn-load-more"
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="px-6 py-3 text-xs font-semibold rounded-lg bg-slate-900 border border-slate-800 hover:border-purple-500/40 hover:bg-[#131b30] text-slate-300 hover:text-white transition duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[150px] justify-center"
                      >
                        {loadingMore ? (
                          <span className="w-4 h-4 border-2 border-slate-400/20 border-t-purple-400 rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>{isArabic ? 'المزيد من العروض' : 'Load More Deals'}</span>
                            {isArabic ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Cyber Footer */}
      <footer className="mt-20 border-t border-slate-900 bg-[#070b13] py-8 text-center text-xs text-slate-600 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 {t.appTitle}. Powered by CheapShark API & SteamDB. No rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-purple-400 cursor-pointer">API Status: Operational</span>
            <span className="text-slate-800">|</span>
            <span className="hover:text-emerald-400 cursor-pointer">v1.2.0-Alpha</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
