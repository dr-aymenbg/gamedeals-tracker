/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Deal, Language, Translations } from '../types';
import { Eye, ExternalLink, Flame, ShieldAlert } from 'lucide-react';

interface GameCardProps {
  key?: React.Key;
  deal: Deal;
  language: Language;
  t: Translations;
  storeName?: string;
  storeIcon?: string;
}

export default function GameCard({ deal, language, t, storeName, storeIcon }: GameCardProps) {
  const isArabic = language === 'ar';
  
  // Parse numeric values safely
  const salePriceNum = parseFloat(deal.salePrice);
  const normalPriceNum = parseFloat(deal.normalPrice);
  const savingsNum = Math.round(parseFloat(deal.savings));
  const isFree = salePriceNum === 0 || savingsNum >= 100;

  // CheapShark redirects to the live deal page
  const dealUrl = `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`;
  
  // SteamDB information URL (Direct app link if steamAppID exists, fallback search link for Steam/free games)
  const steamDbUrl = deal.steamAppID 
    ? `https://steamdb.info/app/${deal.steamAppID}/` 
    : (deal.storeID === "1" || isFree)
      ? `https://steamdb.info/search/?a=app&q=${encodeURIComponent(deal.title)}`
      : null;

  // Formatting currency beautifully
  const formatPrice = (price: number) => {
    if (price === 0) return t.free;
    return `$${price.toFixed(2)}`;
  };

  // Determine neon accent colors based on discount
  let discountColor = 'bg-emerald-500/15 border-emerald-500/35 text-emerald-400';
  let discountGlow = 'glow-emerald';
  
  if (savingsNum >= 75) {
    discountColor = 'bg-purple-500/15 border-purple-500/35 text-purple-400 font-bold animate-pulse';
    discountGlow = 'glow-purple';
  } else if (savingsNum < 30) {
    // Normal discount styling
    discountColor = 'bg-blue-500/15 border-blue-500/35 text-blue-400';
    discountGlow = '';
  }

  return (
    <motion.div
      id={`game-card-${deal.dealID}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="relative flex flex-col h-full bg-[#111726]/90 border border-slate-800/80 rounded-xl overflow-hidden shadow-lg transition-colors duration-300 hover:border-purple-500/50 hover:bg-[#131b30]"
    >
      {/* Discount Badge */}
      {savingsNum > 0 && (
        <div 
          id={`discount-badge-${deal.dealID}`}
          className={`absolute top-3 left-3 z-10 px-2.5 py-1 text-xs font-semibold font-mono rounded-md border border-solid shadow-md ${discountColor} ${discountGlow}`}
          dir="ltr"
        >
          -{savingsNum}%
        </div>
      )}

      {/* Free Game Fire Banner */}
      {isFree && (
        <div 
          id={`free-badge-${deal.dealID}`}
          className="absolute top-3 right-3 z-10 px-2.5 py-1 text-xs font-bold rounded-md bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white flex items-center gap-1 shadow-md animate-bounce"
        >
          <Flame size={14} className="animate-pulse" />
          <span>{t.free}</span>
        </div>
      )}

      {/* Game Capsule Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-900 group">
        <img
          id={`game-image-${deal.dealID}`}
          src={deal.thumb || 'https://via.placeholder.com/300x150?text=No+Capsule+Cover'}
          alt={deal.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=400';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111726] via-transparent to-transparent opacity-90" />
        
        {/* Dynamic Store Badges */}
        {storeName && (
          <div className="absolute bottom-2.5 right-2.5 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
            {storeIcon && (
              <img 
                src={storeIcon} 
                alt={storeName} 
                className="w-4 h-4 rounded-sm object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <span className="text-[10px] font-medium text-slate-300 font-mono">{storeName}</span>
          </div>
        )}
      </div>

      {/* Content details */}
      <div className="p-4 flex flex-col flex-grow justify-between gap-4">
        {/* Title */}
        <div className="space-y-1">
          <h3 
            id={`game-title-${deal.dealID}`}
            className="text-white font-medium text-base tracking-tight leading-tight line-clamp-2 hover:text-purple-400 transition-colors"
            title={deal.title}
          >
            {deal.title}
          </h3>
          
          {/* Metacritic & Ratings info if available */}
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            {deal.metacriticScore && deal.metacriticScore !== '0' && (
              <span className="flex items-center gap-1">
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1 rounded font-bold">MC</span>
                <span className="text-slate-300 font-bold">{deal.metacriticScore}</span>
              </span>
            )}
            {deal.steamRatingPercent && deal.steamRatingPercent !== '0' && (
              <span className="flex items-center gap-1">
                <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1 rounded font-bold">Steam</span>
                <span className="text-slate-300 font-bold">{deal.steamRatingPercent}%</span>
              </span>
            )}
          </div>
        </div>

        {/* Pricing Layout */}
        <div className="flex items-end justify-between border-t border-slate-800/50 pt-3">
          {/* Prices */}
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
              {t.originalPrice}
            </span>
            <span className="text-slate-400 text-xs line-through font-mono">
              {formatPrice(normalPriceNum)}
            </span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] text-purple-400 uppercase tracking-wider font-mono font-semibold">
              {t.currentPrice}
            </span>
            <span className={`text-base font-bold font-mono ${isFree ? 'text-emerald-400 animate-pulse' : 'text-white'}`}>
              {formatPrice(salePriceNum)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-1.5 mt-2">
          {/* View Deal on Store */}
          <a
            id={`deal-link-${deal.dealID}`}
            href={dealUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-lg shadow-lg shadow-purple-900/20 hover:shadow-purple-500/10 transition-all duration-300 cursor-pointer text-center group border-t border-purple-400"
          >
            <span>{t.viewOnStore}</span>
            <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
          </a>

          {/* SteamDB Button - Especially displayed and promoted to follow instructions:
              "وفي قائمة ستيم أضف steamdb للألعاب المجانية" (In the Steam items list, add steamdb for free games)
          */}
          {steamDbUrl ? (
            <a
              id={`steamdb-link-${deal.dealID}`}
              href={steamDbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-1.5 w-full px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-300 cursor-pointer ${
                isFree 
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40 hover:bg-emerald-900/50 hover:border-emerald-400' 
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700/80 hover:bg-slate-800/40'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span>{t.steamDBLink}</span>
              {isFree && (
                <span className="text-[9px] bg-emerald-400 text-slate-950 px-1 rounded-sm uppercase font-bold text-[8px] animate-pulse">
                  {t.free}
                </span>
              )}
            </a>
          ) : (
            // Fallback empty height placeholder for cards alignment
            <div className="h-[29px]" />
          )}
        </div>
      </div>
    </motion.div>
  );
}
