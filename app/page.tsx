'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SearchOverlay from './components/SearchOverlay';

const TMDB_API_KEY = 'dc99eb22bc79c3e511d871e1864c4408';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

const COLORS = {
  bg: '#0F0E0E',         
  bgCard: '#1C1616',     
  acc1: '#CD8E6D',      
  acc2: '#9B5B3E',      
  acc3: '#3C7F8C',      
  rankText: '#D9C5B2',  
  textMain: '#D9C5B2',  
  textMuted: '#8C7461',  
};

export default function LandingPage() {
  const [trending, setTrending] = useState([]);
  const [mostLiked, setMostLiked] = useState([]);
  const [showAllTrending, setShowAllTrending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/') { e.preventDefault(); setIsSearchOpen(true); }
      if (e.key === 'Escape') setIsSearchOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        const [tRes, lRes] = await Promise.all([
            fetch(`${BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}`),
            fetch(`${BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&language=en-US&page=1`)
        ]);
        const tData = await tRes.json();
        const lData = await lRes.json();
        setTrending(tData.results || []);
        setMostLiked(lData.results?.slice(0, 10) || []);
        setLoading(false);
      } catch (e) { setLoading(false); }
    };
    fetchMovieData();
  }, []);

  if (loading) return (
    <div style={{ backgroundColor: COLORS.bg }} className="min-h-screen flex items-center justify-center">
      <div style={{ borderTopColor: COLORS.acc1 }} className="animate-spin rounded-full h-12 w-12 border-4 border-b-transparent"></div>
    </div>
  );

  return (
    <div style={{ backgroundColor: COLORS.bg, color: COLORS.textMain }} className="min-h-screen font-sans selection:bg-[#3C7F8C]/30 overflow-x-hidden">
      
      <nav style={{ backgroundColor: `${COLORS.bg}CC`, borderColor: '#302626' }} className="h-24 backdrop-blur-xl border-b flex items-center justify-between px-14 sticky top-0 z-50">
        <div className="flex items-center gap-2">
           <div style={{ backgroundColor: COLORS.acc1 }} className="w-4 h-8 rounded" />
           <h1 style={{ color: COLORS.acc1 }} className="text-3xl font-black tracking-tighter uppercase cursor-pointer hover:opacity-80 transition">Cinedex</h1>
        </div>
        
        <div className="flex items-center gap-12">
          {/* SEARCH BAR */}
          <div onClick={() => setIsSearchOpen(true)} className="group flex items-center gap-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 px-6 py-2.5 rounded-full cursor-pointer transition-all w-64">
            <span style={{ color: COLORS.acc1 }} className="text-sm font-black italic opacity-60">#</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30 group-hover:text-white/50 transition-colors">Search Archive</span>
            <span className="ml-auto text-[10px] font-black text-white/10 group-hover:text-white/20">/</span>
          </div>

          <div style={{ color: COLORS.textMuted }} className="flex items-center gap-10 text-xs font-black uppercase tracking-[0.25em]">
            <span className="hover:text-white cursor-pointer transition">Lists</span>
            <Link href="/dex">
              <div style={{ borderColor: '#302626', background: `linear-gradient(to top right, ${COLORS.acc2}, ${COLORS.acc1})` }} 
                   className="w-10 h-10 rounded-full border-4 cursor-pointer hover:scale-110 transition shadow-2xl" />
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto py-20 px-10">
        <section className="mb-40">
          <div className="flex justify-between items-baseline mb-20">
            <h2 className="text-4xl font-black uppercase tracking-[0.15em] text-white">Trending Now</h2>
            <button onClick={() => setShowAllTrending(!showAllTrending)}
                    style={{ color: COLORS.acc1, borderColor: '#302626', backgroundColor: COLORS.bgCard }}
                    className="text-[10px] font-black uppercase tracking-widest px-8 py-3 rounded-xl transition-all border shadow-2xl hover:scale-105 active:scale-95">
              {showAllTrending ? "← Less" : "Full Archive →"}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-x-12 gap-y-20">
            {(showAllTrending ? trending.slice(0, 20) : trending.slice(0, 10)).map((movie, idx) => (
              <Link href={`/movie/${movie.id}`} key={movie.id} className="group relative block">
                <div style={{ backgroundColor: COLORS.bgCard, borderColor: '#302626' }} 
                     className="relative z-10 aspect-[2/3] overflow-hidden rounded-[2.5rem] transition-all duration-700 group-hover:-translate-y-4 group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.9)] border group-hover:border-[#9B5B3E]/50">
                  <img src={`${IMAGE_BASE}${movie.poster_path}`} alt={movie.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                  {!showAllTrending && (
                    <div className="absolute bottom-5 left-5 z-20 flex items-center gap-1.5">
                      <div className="bg-black/60 backdrop-blur-xl border border-white/10 px-3 py-1 rounded-lg flex items-center gap-1 shadow-2xl">
                        <span style={{ color: COLORS.acc1 }} className="text-[10px] font-black italic">#</span>
                        <span style={{ color: COLORS.rankText }} className="text-xl font-black italic tracking-tighter">{idx + 1}</span>
                      </div>
                    </div>
                  )}
                  <div style={{ borderColor: `${COLORS.acc3}33`, color: COLORS.acc3 }} className="absolute bottom-5 right-5 bg-black/60 backdrop-blur-xl px-3 py-1.5 rounded-lg text-[12px] font-black border shadow-2xl z-20">{Math.round(movie.vote_average * 10)}%</div>
                </div>
                <div className="mt-8 pl-4">
                  <h3 className="text-base font-bold leading-tight text-white group-hover:text-[#CD8E6D] transition line-clamp-1">{movie.title}</h3>
                  <p style={{ color: COLORS.textMuted }} className="text-[11px] font-bold uppercase tracking-widest mt-2">{movie.release_date?.split('-')[0]}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-6 mb-20">
            <div style={{ backgroundColor: COLORS.acc3 }} className="h-12 w-2 rounded-full" />
            <h2 className="text-4xl font-black uppercase tracking-[0.15em] text-white">Cinedex Favorites</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16">
            {mostLiked.map((movie) => (
              <Link href={`/movie/${movie.id}`} key={movie.id} className="group relative flex flex-col items-start pl-10 border-l-2 border-[#302626] hover:border-[#9B5B3E] transition-all duration-500">
                <div style={{ borderColor: '#302626' }} className="relative z-10 w-full aspect-[2/3] rounded-[2.5rem] overflow-hidden border shadow-2xl transition-all duration-700 group-hover:scale-[1.03] group-hover:shadow-[0_40px_90px_rgba(0,0,0,0.9)]">
                  <img src={`${IMAGE_BASE}${movie.poster_path}`} className="w-full h-full object-cover" alt={movie.title} />
                </div>
                <h3 style={{ color: COLORS.textMain }} className="relative z-10 mt-10 text-left text-[12px] font-black uppercase tracking-[0.25em] group-hover:text-white transition drop-shadow-xl line-clamp-2 pr-4">{movie.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <footer style={{ borderColor: '#302626' }} className="py-32 flex flex-col items-center border-t mt-40">
        <p style={{ color: COLORS.textMuted }} className="text-[12px] font-black uppercase tracking-[0.6em]">Powered by TMDB • Cinedex 2026</p>
      </footer>
    </div>
  );
}