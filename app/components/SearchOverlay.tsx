'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const TMDB_API_KEY = 'dc99eb22bc79c3e511d871e1864c4408';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w200';

// Added onMovieSelect to the props interface
export default function SearchOverlay({ 
  isOpen, 
  onClose, 
  onMovieSelect 
}: { 
  isOpen: boolean, 
  onClose: () => void,
  onMovieSelect?: (movie: any) => void 
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const searchMovies = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${query}`);
      const data = await res.json();
      setResults(data.results?.slice(0, 6) || []);
    };

    const timeoutId = setTimeout(searchMovies, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  if (!isOpen) return null;

  // Helper to handle clicks
  const handleItemClick = (movie: any) => {
    if (onMovieSelect) {
      // If we are in "Vault Mode" (on the profile), run the selection logic
      onMovieSelect(movie);
      setQuery(''); // Clear search for next time
    } else {
      // Otherwise, just go to the movie page
      router.push(`/movie/${movie.id}`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-6">
      <div className="absolute inset-0 bg-[#0F0E0E]/95 backdrop-blur-xl" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-[#1C1616] border border-white/10 rounded-[3rem] shadow-[0_0_150px_rgba(0,0,0,1)] overflow-hidden transition-all animate-in fade-in zoom-in duration-300">
        <div className="p-10 border-b border-white/5 flex items-center gap-8">
          <span className="text-3xl text-[#CD8E6D] font-black italic">#</span>
          <input
            autoFocus
            type="text"
            placeholder={onMovieSelect ? "VAULT A SELECTION..." : "ACCESS CINEDEX ARCHIVE..."}
            className="w-full bg-transparent text-2xl font-black uppercase tracking-tighter text-white outline-none placeholder:text-white/5"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={onClose} className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-[#CD8E6D] transition">Close</button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {results.length > 0 ? (
            <div className="space-y-4">
              {results.map((movie: any) => (
                <button 
                  key={movie.id} 
                  onClick={() => handleItemClick(movie)}
                  className="w-full flex items-center gap-8 p-4 rounded-[2rem] hover:bg-white/5 transition-all group border border-transparent hover:border-white/5 text-left"
                >
                  <div className="w-16 h-24 rounded-2xl overflow-hidden shrink-0 border border-white/5 shadow-2xl">
                    <img 
                      src={movie.poster_path ? `${IMAGE_BASE}${movie.poster_path}` : 'https://via.placeholder.com/200x300'} 
                      className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500" 
                      alt={movie.title}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xl font-black uppercase tracking-tighter text-white group-hover:text-[#CD8E6D] transition-colors">{movie.title}</p>
                    <div className="flex items-center gap-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#8C7461]">{movie.release_date?.split('-')[0]}</p>
                        <div className="w-1 h-1 rounded-full bg-white/10" />
                        <p className="text-[10px] font-black text-[#3C7F8C] tracking-widest">{Math.round(movie.vote_average * 10)}% MATCH</p>
                    </div>
                  </div>
                  <div className="ml-auto pr-6 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      <span className="text-[#CD8E6D] text-[10px] font-black uppercase tracking-widest italic">
                        {onMovieSelect ? '+ VAULT' : 'VIEW →'}
                      </span>
                  </div>
                </button>
              ))}
            </div>
          ) : query.length > 1 ? (
            <div className="p-20 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.8em] text-white/10 italic">Indexing Fail: No matches found</p>
            </div>
          ) : (
            <div className="p-20 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.8em] text-white/5 italic">Awaiting Input...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}