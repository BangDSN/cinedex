'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
// Fixed Import: This goes up two levels (../../) to reach the app folder, then into components
import SearchOverlay from '../../components/SearchOverlay';
import { useParams, useRouter } from 'next/navigation';

// --- CONFIGURATION ---
const TMDB_API_KEY = 'dc99eb22bc79c3e511d871e1864c4408';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_ORIGINAL = 'https://image.tmdb.org/t/p/original';
const IMAGE_BASE_W500 = 'https://image.tmdb.org/t/p/w500';

const COLORS = {
  bg: '#0F0E0E',
  bgCard: '#1C1616',
  acc1: '#CD8E6D',      // Terracotta
  acc2: '#9B5B3E',      // Rust
  acc3: '#3C7F8C',      // Slate Blue
  textMain: '#D9C5B2',
  textMuted: '#8C7461',
};

export default function MovieDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState<any>(null);
  const [cast, setCast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Keyboard shortcut to open search (/)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') setIsSearchOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        const [movieRes, creditsRes] = await Promise.all([
          fetch(`${BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&language=en-US`),
          fetch(`${BASE_URL}/movie/${id}/credits?api_key=${TMDB_API_KEY}`)
        ]);
        
        const movieData = await movieRes.json();
        const creditsData = await creditsRes.json();

        setMovie(movieData);
        setCast(creditsData.cast?.slice(0, 9) || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching movie details:", error);
        setLoading(false);
      }
    };

    if (id) fetchMovieData();
  }, [id]);

  if (loading) return (
    <div style={{ backgroundColor: COLORS.bg }} className="min-h-screen flex items-center justify-center">
      <div style={{ borderTopColor: COLORS.acc1 }} className="animate-spin rounded-full h-12 w-12 border-4 border-b-transparent"></div>
    </div>
  );

  if (!movie) return <div className="min-h-screen bg-[#0F0E0E] text-white p-10">Movie not found.</div>;

  return (
    <div style={{ backgroundColor: COLORS.bg, color: COLORS.textMain }} className="min-h-screen font-sans overflow-x-hidden selection:bg-[#3C7F8C]/30">
      
      {/* --- HERO SECTION --- */}
      <div className="relative h-[65vh] w-full">
        <div className="absolute inset-0 z-0">
          <img 
            src={`${IMAGE_BASE_ORIGINAL}${movie.backdrop_path}`} 
            className="w-full h-full object-cover opacity-30 grayscale-[20%]"
            alt="backdrop"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0E0E] via-[#0F0E0E]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F0E0E] via-transparent to-transparent opacity-60" />
        </div>

        {/* Top Navigation */}
        <div className="absolute top-0 left-0 right-0 p-10 flex justify-between items-center z-50">
          <button 
            onClick={() => router.back()}
            className="group flex items-center gap-3 bg-black/40 backdrop-blur-xl border border-white/10 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#CD8E6D] hover:text-black transition-all"
          >
            {/* UPDATED: LABEL TO "Return to Dex" */}
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Return to Dex
          </button>
          
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-[#CD8E6D] transition"
            >
              {/* UPDATED: LABEL TO "Search Dex" */}
              Search Dex (/)
            </button>
            {/* UPDATED: BRANDING TO LESS BOLD AND ITALIC */}
            <div style={{ color: COLORS.acc1 }} className="text-2xl font-medium tracking-tighter uppercase italic opacity-40">Cinedex</div>
          </div>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-20 left-10 right-10 max-w-7xl mx-auto px-10 z-10">
            <div className="flex items-center gap-4 mb-6">
                <div style={{ backgroundColor: COLORS.acc3 }} className="px-3 py-1 rounded-md text-[10px] font-black text-white uppercase tracking-widest shadow-lg">
                    {movie.release_date?.split('-')[0]}
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <span className="text-xs font-bold uppercase tracking-widest text-white/60">{movie.runtime}m</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-white drop-shadow-2xl leading-[0.85]">
                {movie.title}
            </h1>
        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      <main className="max-w-7xl mx-auto px-10 grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-20 -mt-16 relative z-20">
        
        <div className="flex flex-col gap-10">
          <div style={{ borderColor: '#302626' }} className="rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)] border-4">
            <img src={`${IMAGE_BASE_W500}${movie.poster_path}`} className="w-full" alt="poster" />
          </div>

          <div className="flex flex-col gap-4">
              <button style={{ backgroundColor: COLORS.acc1 }} className="w-full py-5 rounded-2xl font-black uppercase tracking-widest text-black text-xs hover:scale-[1.03] active:scale-95 transition-all shadow-xl">
                Add to Collection
              </button>
          </div>

          <div style={{ backgroundColor: COLORS.bgCard, borderColor: '#302626' }} className="p-8 rounded-[2rem] border grid grid-cols-2 gap-8 shadow-2xl">
             <div>
                <p style={{ color: COLORS.textMuted }} className="text-[10px] font-black uppercase tracking-widest mb-2">Cinedex Score</p>
                <p style={{ color: COLORS.acc3 }} className="text-3xl font-black italic tracking-tighter">
                    {Math.round(movie.vote_average * 10)}%
                </p>
             </div>
             <div>
                <p style={{ color: COLORS.textMuted }} className="text-[10px] font-black uppercase tracking-widest mb-2">Revenue</p>
                <p className="text-xl font-bold text-white tracking-tighter">
                    ${(movie.revenue / 1000000).toFixed(1)}M
                </p>
             </div>
          </div>
        </div>

        <div className="pt-20 lg:pt-32 space-y-20">
          <div className="space-y-8">
            <h2 style={{ color: COLORS.acc1 }} className="text-[10px] font-black uppercase tracking-[0.5em] flex items-center gap-4">
                <span className="w-8 h-px bg-[#CD8E6D]/30" /> The Synopsis
            </h2>
            <p className="text-2xl leading-relaxed text-white/90 font-medium italic opacity-80 border-l-4 border-[#3C7F8C] pl-8 py-2">
              "{movie.tagline || 'A story worth experiencing.'}"
            </p>
            <p className="text-xl leading-relaxed text-slate-400 font-light max-w-3xl">
              {movie.overview}
            </p>
          </div>

          <div className="space-y-10 pb-20">
            {/* UPDATED: LABEL TO "Top Cast" */}
            <h2 style={{ color: COLORS.acc1 }} className="text-[10px] font-black uppercase tracking-[0.5em] flex items-center gap-4">
                <span className="w-8 h-px bg-[#CD8E6D]/30" /> Top Cast
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-10 gap-x-6">
              {cast.map((person: any) => (
                <div key={person.id} className="flex items-center gap-5 group cursor-pointer">
                  <div className="w-20 h-20 shrink-0 rounded-full overflow-hidden border-2 border-white/5 group-hover:border-[#CD8E6D] transition-all duration-500 shadow-2xl">
                    <img 
                      src={person.profile_path ? `https://image.tmdb.org/t/p/w200${person.profile_path}` : 'https://via.placeholder.com/200'} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                      alt={person.name}
                    />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm font-bold text-white group-hover:text-[#CD8E6D] transition-colors">{person.name}</p>
                    <p style={{ color: COLORS.textMuted }} className="text-[10px] font-black uppercase tracking-wider mt-1">{person.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      
      {/* Search Overlay enabled on this page too */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <footer style={{ borderColor: '#302626' }} className="py-20 border-t flex justify-center">
         <p style={{ color: COLORS.textMuted }} className="text-[10px] font-black uppercase tracking-[0.5em]">Cinedex Metadata Protocol 2026</p>
      </footer>
    </div>
  );
}