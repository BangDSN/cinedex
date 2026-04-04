'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SearchOverlay from '../components/SearchOverlay';

const TMDB_API_KEY = 'dc99eb22bc79c3e511d871e1864c4408';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

const COLORS = {
  bg: '#0F0E0E',
  bgCard: '#1C1616',
  acc1: '#CD8E6D',
  acc2: '#9B5B3E',
  acc3: '#3C7F8C',
  textMain: '#D9C5B2',
  textMuted: '#8C7461',
};

// --- DATA STRUCTURES ---
const TOP_10_IDS = [27205, 157336, 603, 414906, 11324, 299536, 155, 671, 120, 550];
const RECENT_LOG_DATA = [
  { id: 414906, score: '9.5', time: '2H AGO' },
  { id: 268, score: '10.0', time: '1D AGO' },
  { id: 930564, score: 'P-W', time: '15H AGO' },
  { id: 823464, score: '8.5', time: '2D AGO' }
];

export default function TheDex() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [top10Movies, setTop10Movies] = useState<any[]>([]);
  const [recentMovies, setRecentMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const hoursWatched = 4268.5;
  const progressPercent = (hoursWatched / 5000) * 100;

  useEffect(() => {
    const fetchDexData = async () => {
      try {
        setLoading(true);
        
        // Fetch Top 10 Details
        const top10Promises = TOP_10_IDS.map(id => 
          fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}`).then(res => res.json())
        );
        
        // Fetch Recent Logs Details
        const recentPromises = RECENT_LOG_DATA.map(log => 
          fetch(`https://api.themoviedb.org/3/movie/${log.id}?api_key=${TMDB_API_KEY}`).then(res => res.json())
        );

        const top10Results = await Promise.all(top10Promises);
        const recentResults = await Promise.all(recentPromises);

        setTop10Movies(top10Results);
        setRecentMovies(recentResults);
        setLoading(false);
      } catch (error) {
        console.error("Dex Fetch Error:", error);
        setLoading(false);
      }
    };

    fetchDexData();
  }, []);

  if (loading) return (
    <div style={{ backgroundColor: COLORS.bg }} className="min-h-screen flex items-center justify-center">
      <div style={{ borderTopColor: COLORS.acc1 }} className="animate-spin rounded-full h-12 w-12 border-4 border-b-transparent"></div>
    </div>
  );

  return (
    <div style={{ backgroundColor: COLORS.bg, color: COLORS.textMain }} className="min-h-screen font-sans selection:bg-[#3C7F8C]/30 overflow-x-hidden pb-40">
      
      <nav className="h-24 flex items-center justify-between px-14 sticky top-0 bg-[#0F0E0E]/80 backdrop-blur-xl z-[60]">
        <Link href="/" className="flex items-center gap-2">
           <div style={{ backgroundColor: COLORS.acc1 }} className="w-4 h-8 rounded-sm" />
           {/* LOGO: Bold and Non-Italic */}
           <h1 style={{ color: COLORS.acc1 }} className="text-3xl font-black tracking-tighter uppercase">Cinedex</h1>
        </Link>
        {/* UPDATED: LABEL TO "Search Dex" */}
        <button onClick={() => setIsSearchOpen(true)} className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-[#CD8E6D] transition">Search Dex (/)</button>
      </nav>

      <main className="max-w-[1500px] mx-auto px-10 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12 mt-12">
        
        {/* SIDEBAR */}
        <div className="space-y-8">
          <div style={{ borderColor: '#302626', background: `linear-gradient(to top right, ${COLORS.acc2}, ${COLORS.acc1})` }} 
               className="w-full aspect-square rounded-[2.5rem] border-[8px] shadow-2xl" />
          
          <div className="space-y-4">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-white">OtakuWatcher1</h2>
            <p style={{ color: COLORS.textMuted }} className="text-xs font-bold leading-relaxed italic opacity-80">
              "Neuro-Link rating system active. Scanning library for 9.5+ matches."
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2">
              {[
                { label: 'Actor', val: 'Cillian Murphy' },
                { label: 'Director', val: 'Christopher Nolan' },
                { label: 'Studio', val: 'A24 / Mappa' },
                { label: 'Genre', val: 'Sci-Fi Noir' }
              ].map((pref, i) => (
                <div key={i} className="bg-[#1C1616] p-4 rounded-2xl border border-white/5 flex flex-col gap-1 hover:border-[#CD8E6D]/30 transition group">
                   <span style={{ color: COLORS.acc3 }} className="text-[8px] font-black uppercase tracking-[0.4em]">{pref.label}</span>
                   <span className="text-[11px] font-bold text-white/80 group-hover:text-white">{pref.val}</span>
                </div>
              ))}
          </div>
        </div>

        {/* CONTENT */}
        <div className="space-y-12">
          
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6">
            <div className="bg-[#1C1616] p-8 rounded-[2.5rem] border border-white/5 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30">Watch Protocol</p>
                    <p style={{ color: COLORS.acc1 }} className="text-xl font-black italic">{hoursWatched.toLocaleString()} <span className="text-[10px] opacity-40">HRS</span></p>
                </div>
                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <div style={{ width: `${progressPercent}%`, background: `linear-gradient(to right, ${COLORS.acc2}, ${COLORS.acc1})` }} 
                         className="h-full rounded-full transition-all duration-1000" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-[#1C1616] p-6 rounded-[2rem] border border-white/5 text-center">
                  <p style={{ color: COLORS.acc3 }} className="text-2xl font-black italic">7.5</p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mt-1">Mean Score</p>
               </div>
               <div className="bg-[#1C1616] p-6 rounded-[2rem] border border-white/5 text-center">
                  <p style={{ color: COLORS.acc3 }} className="text-2xl font-black italic">685</p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mt-1">Movies</p>
               </div>
            </div>
          </div>

          {/* DISTRIBUTION */}
          <div className="bg-[#1C1616] p-8 rounded-[2.5rem] border border-white/5">
             <h3 className="text-[9px] font-black uppercase tracking-[0.6em] text-white/30 mb-8 px-2">Score Distribution</h3>
             <div className="flex items-end justify-between h-24 gap-2 px-2">
                {[5, 12, 8, 22, 45, 88, 120, 150, 95, 40].map((count, i) => (
                    <div key={i} className="flex-grow flex flex-col items-center gap-2 group">
                        <div style={{ height: `${(count/150)*100}%`, backgroundColor: i >= 7 ? COLORS.acc1 : COLORS.acc3 }} 
                             className="w-full rounded-t-sm opacity-40 group-hover:opacity-100 transition-all" />
                        <span className="text-[8px] font-black text-white/10">{i+1}</span>
                    </div>
                ))}
             </div>
          </div>

          {/* TOP 10 LIVE POSTERS */}
          <section>
             <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40 mb-8 px-4 flex items-center gap-4">
                <div className="w-8 h-px bg-[#CD8E6D]/40" /> Top 10 Selection
             </h3>
             <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {top10Movies.map((m, idx) => (
                    <Link href={`/movie/${m.id}`} key={idx} className="group relative">
                        <div className="aspect-[2/3] rounded-[1.5rem] overflow-hidden border border-white/5 grayscale group-hover:grayscale-0 transition-all duration-700 hover:scale-[1.05] shadow-xl hover:border-[#CD8E6D]/30">
                            <img src={`${IMAGE_BASE}${m.poster_path}`} className="w-full h-full object-cover" alt={m.title} />
                            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                                <span style={{ color: COLORS.acc1 }} className="text-[10px] font-black italic">{idx + 1}</span>
                            </div>
                        </div>
                    </Link>
                ))}
             </div>
          </section>

          {/* RECENTLY LOGGED LIVE POSTERS */}
          <section>
             <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40 mb-8 px-4 flex items-center gap-4">
                <div className="w-8 h-px bg-[#3C7F8C]/40" /> Recently Logged
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentMovies.map((m, i) => (
                    <Link href={`/movie/${m.id}`} key={i} className="bg-[#1C1616]/60 p-4 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-[#3C7F8C]/30 transition">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-14 rounded-lg overflow-hidden shrink-0 border border-white/5">
                                <img src={`${IMAGE_BASE}${m.poster_path}`} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition" alt={m.title} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-[#8C7461] tracking-widest uppercase">{RECENT_LOG_DATA[i].time}</span>
                                <span className="text-sm font-bold text-white/90 group-hover:text-white transition">{m.title}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end pr-2">
                            <span style={{ color: COLORS.acc1 }} className="text-xl font-black italic tracking-tighter">{RECENT_LOG_DATA[i].score}</span>
                            <span className="text-[8px] font-black text-white/10 uppercase">Rating</span>
                        </div>
                    </Link>
                ))}
             </div>
          </section>

        </div>
      </main>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}