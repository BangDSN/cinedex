'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SearchOverlay from '../components/SearchOverlay';

const TMDB_API_KEY = 'dc99eb22bc79c3e511d871e1864c4408';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

const GENRES = [
  { id: 28, name: 'Action' }, { id: 12, name: 'Adventure' }, { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' }, { id: 80, name: 'Crime' }, { id: 18, name: 'Drama' },
  { id: 14, name: 'Fantasy' }, { id: 27, name: 'Horror' }, { id: 878, name: 'Sci-Fi' }
];

const COLORS = {
  bg: '#0F0E0E',
  acc1: '#CD8E6D',
  acc3: '#3C7F8C',
};

export default function FullArchive() {
  const [movies, setMovies] = useState<any[]>([]);
  const [selectedGenre, setSelectedGenre] = useState(12); // Default: Adventure
  const [sortBy, setSortBy] = useState('vote_average.desc');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFilteredMovies = async () => {
      setLoading(true);
      const res = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${selectedGenre}&sort_by=${sortBy}&vote_count.gte=100`
      );
      const data = await res.json();
      setMovies(data.results || []);
      setLoading(false);
    };
    fetchFilteredMovies();
  }, [selectedGenre, sortBy]);

  return (
    <div className="min-h-screen bg-[#0F0E0E] text-[#D9C5B2] font-sans pb-20 selection:bg-[#3C7F8C]/30">
      {/* BRANDED NAVIGATION */}
      <nav className="h-24 flex items-center justify-between px-14 sticky top-0 bg-[#0F0E0E]/90 backdrop-blur-xl z-50 border-b border-white/5">
        <Link href="/" className="text-[10px] font-black uppercase tracking-[0.5em] text-[#CD8E6D] hover:opacity-70 transition">
          ← Return to Dex
        </Link>
        
        {/* LOGO: Bold and consistent with Landing Page */}
        <h1 className="text-2xl font-black uppercase tracking-tighter text-[#CD8E6D]">Cinedex Archive</h1>
        
        <button onClick={() => setIsSearchOpen(true)} className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-[#CD8E6D] transition">
          Search Dex (/)
        </button>
      </nav>

      <div className="max-w-[1600px] mx-auto px-10 mt-12 grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-16">
        
        {/* SIDEBAR: GENRES */}
        <aside className="space-y-10">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-8">Category</h3>
            <div className="flex flex-col gap-3">
              {GENRES.map((g) => (
                <button 
                  key={g.id}
                  onClick={() => setSelectedGenre(g.id)}
                  className={`text-left text-sm font-bold uppercase tracking-widest py-2 transition-all ${selectedGenre === g.id ? 'text-[#CD8E6D] pl-4 border-l-2 border-[#CD8E6D]' : 'text-white/40 hover:text-white'}`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* MAIN: GRID & FILTERS */}
        <section className="space-y-12">
          <div className="flex justify-between items-center bg-[#1C1616] p-6 rounded-2xl border border-white/5 shadow-2xl">
            <h2 className="text-xl font-black uppercase tracking-tight text-white">
              {GENRES.find(g => g.id === selectedGenre)?.name} Collection
            </h2>
            
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#0F0E0E] p-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-[#CD8E6D] outline-none cursor-pointer border border-white/5"
            >
              <option value="vote_average.desc">Rating: High to Low</option>
              <option value="vote_average.asc">Rating: Low to High</option>
              <option value="primary_release_date.desc">Year: Newest</option>
              <option value="primary_release_date.asc">Year: Oldest</option>
            </select>
          </div>

          {loading ? (
            <div className="h-96 flex items-center justify-center">
               <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#CD8E6D] border-b-transparent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-8">
              {movies.map((m) => (
                <Link href={`/movie/${m.id}`} key={m.id} className="group block">
                  <div className="aspect-[2/3] rounded-[2rem] overflow-hidden border border-white/5 relative mb-4 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                    <img 
                      src={m.poster_path ? `${IMAGE_BASE}${m.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster'} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                      alt={m.title}
                    />
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 text-[10px] font-black text-[#3C7F8C]">
                      {Math.round(m.vote_average * 10)}%
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-white/80 group-hover:text-[#CD8E6D] transition-colors line-clamp-1 uppercase tracking-tight">
                    {m.title}
                  </h4>
                  <p className="text-[10px] font-black text-white/20 mt-1 uppercase tracking-widest">
                    {m.release_date?.split('-')[0] || 'N/A'}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}