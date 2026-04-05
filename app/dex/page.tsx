'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TheDex() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]); // NEW: Holds movie logs
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [top10Movies, setTop10Movies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Editing State
  const [editing, setEditing] = useState(false);
  const [editedFullName, setEditedFullName] = useState('');
  const [editedBio, setEditedBio] = useState('');
  const [editedActor, setEditedActor] = useState('');
  const [editedDirector, setEditedDirector] = useState('');
  const [editedStudio, setEditedStudio] = useState('');
  const [editedGenre, setEditedGenre] = useState('');

  // CALCULATED STATS
  const stats = {
    hoursWatched: logs.reduce((acc, log) => acc + (log.runtime / 60), 0).toFixed(1),
    meanScore: logs.length > 0 
      ? (logs.reduce((acc, log) => acc + log.rating, 0) / logs.length).toFixed(1) 
      : "0.0",
    moviesLogged: logs.length
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.replace('/login');
        return;
      }

      setUser(session.user);
      
      // Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      // Fetch Movie Logs
      const { data: logData } = await supabase
        .from('movie_logs')
        .select('*')
        .eq('user_id', session.user.id)
        .order('logged_at', { ascending: false });

      if (logData) setLogs(logData);

      if (profileData) {
        setProfile(profileData);
        setEditedFullName(profileData.full_name || '');
        setEditedBio(profileData.bio || '');
        setEditedActor(profileData.favorite_actor || '');
        setEditedDirector(profileData.favorite_director || '');
        setEditedStudio(profileData.favorite_studio || '');
        setEditedGenre(profileData.favorite_genre || '');

        const top10Ids = profileData.top_10_ids || [];
        const tmdbPromises = top10Ids.map((id: any) => 
          fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}`).then(res => res.json())
        );
        const tmdbResults = await Promise.all(tmdbPromises);
        setTop10Movies(tmdbResults.filter(m => m.id));
      }
      setLoading(false);
    };

    fetchData();
  }, [router]);

  const handleUpdateProfile = async () => {
    setLoading(true);
    const updates = {
      id: user.id,
      full_name: editedFullName,
      bio: editedBio,
      favorite_actor: editedActor,
      favorite_director: editedDirector,
      favorite_studio: editedStudio,
      favorite_genre: editedGenre,
      updated_at: new Date(),
    };

    const { error } = await supabase.from('profiles').upsert(updates);

    if (error) {
      alert(`Error updating: ${error.message}`);
    } else {
      setProfile({ ...profile, ...updates });
      setEditing(false);
      setMessage('Profile Updated');
      setTimeout(() => setMessage(''), 3000);
    }
    setLoading(false);
  };

  const logMovie = async (movie: any, userRating: number) => {
    setLoading(true);
    // Fetch details to get runtime
    const detailRes = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${TMDB_API_KEY}`);
    const details = await detailRes.json();

    const newLog = {
      user_id: user.id,
      movie_id: movie.id,
      movie_title: movie.title,
      poster_path: movie.poster_path,
      runtime: details.runtime || 120,
      rating: userRating,
    };

    const { error } = await supabase.from('movie_logs').insert(newLog);

    if (!error) {
      setLogs([newLog, ...logs]);
      setMessage(`${movie.title} Logged`);
      setTimeout(() => setMessage(''), 3000);
    }
    setLoading(false);
  };

  const addToVault = async (movie: any) => {
    const currentIds = profile?.top_10_ids || [];
    if (currentIds.includes(movie.id)) {
      setMessage('Already Vaulted');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    if (currentIds.length >= 10) {
      alert("Vault Full: Remove a selection before adding new data.");
      return;
    }
    const updatedIds = [...currentIds, movie.id];
    const { error } = await supabase.from('profiles').update({ top_10_ids: updatedIds }).eq('id', user.id);
    if (!error) {
      setProfile({ ...profile, top_10_ids: updatedIds });
      setTop10Movies([...top10Movies, movie]);
      setMessage(`${movie.title} Vaulted`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const removeFromVault = async (movieId: number) => {
    const updatedIds = profile.top_10_ids.filter((id: number) => id !== movieId);
    const { error } = await supabase.from('profiles').update({ top_10_ids: updatedIds }).eq('id', user.id);
    if (!error) {
      setProfile({ ...profile, top_10_ids: updatedIds });
      setTop10Movies(top10Movies.filter(m => m.id !== movieId));
      setMessage('Removed from Vault');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    const file = event.target.files?.[0];
    if (!file) return;
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;
    const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file);
    if (!uploadError) {
      const { data } = supabase.storage.from('media').getPublicUrl(filePath);
      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', user.id);
      if (!updateError) setProfile({ ...profile, avatar_url: data.publicUrl });
    }
    setLoading(false);
  };

  if (loading && !profile) return (
    <div style={{ backgroundColor: COLORS.bg }} className="min-h-screen flex items-center justify-center">
      <div style={{ borderTopColor: COLORS.acc1 }} className="animate-spin rounded-full h-12 w-12 border-4 border-b-transparent"></div>
    </div>
  );

  return (
    <div style={{ backgroundColor: COLORS.bg, color: COLORS.textMain }} className="min-h-screen font-sans selection:bg-[#3C7F8C]/30 overflow-x-hidden pb-40">
      
      <nav className="h-24 flex items-center justify-between px-14 sticky top-0 bg-[#0F0E0E]/80 backdrop-blur-xl z-[60]">
        <Link href="/" className="flex items-center gap-2 group">
           <div style={{ backgroundColor: COLORS.acc1 }} className="w-4 h-8 rounded-sm group-hover:scale-110 transition" />
           <h1 style={{ color: COLORS.acc1 }} className="text-3xl font-black tracking-tighter uppercase transition group-hover:opacity-70">Cinedex</h1>
        </Link>
        <div className="flex items-center gap-6 relative">
          {message && <span className="text-[10px] font-black uppercase text-[#3C7F8C] animate-pulse absolute -left-40">{message}</span>}
          <button onClick={() => setIsSearchOpen(true)} className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-[#CD8E6D] transition">Terminal Search (/)</button>
          
          <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className="w-8 h-8 rounded-full border-2 border-white/10 flex items-center justify-center hover:border-[#CD8E6D] transition group">
            <span style={{ color: COLORS.acc1 }} className="text-sm font-black group-hover:scale-110">⚙︎</span>
          </button>
          {isSettingsOpen && (
            <div className="absolute top-12 right-0 w-48 bg-[#1C1616] border border-white/5 p-4 rounded-xl shadow-2xl space-y-3 z-50">
              <button onClick={() => {setEditing(true); setIsSettingsOpen(false);}} className="text-xs font-black uppercase text-white hover:text-[#CD8E6D] transition w-full text-left">Edit Profile</button>
              <button onClick={handleLogout} className="text-xs font-black uppercase text-red-500 hover:text-red-300 transition w-full text-left">Log Out</button>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-[1500px] mx-auto px-10 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12 mt-12">
        
        <div className="space-y-8">
          <div className="group relative">
            {profile?.avatar_url ? (
                <img src={profile.avatar_url} className="w-full aspect-square rounded-[2.5rem] object-cover border-[8px] border-[#1C1616] shadow-2xl" alt="Profile" />
            ) : (
                <div style={{ borderColor: '#302626', background: `linear-gradient(to top right, ${COLORS.acc2}, ${COLORS.acc1})` }} 
                     className="w-full aspect-square rounded-[2.5rem] border-[8px] shadow-2xl" />
            )}
            <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/60 rounded-[2.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-500">
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Upload Avatar</span>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
          </div>
          
          <div className="space-y-4">
            {editing ? (
                <input type="text" value={editedFullName} onChange={(e) => setEditedFullName(e.target.value)}
                       className="w-full bg-[#1C1616] text-white p-3 rounded-lg border border-white/10 font-bold outline-none focus:border-[#CD8E6D]" />
            ) : (
                <h2 className="text-3xl font-black uppercase tracking-tighter text-white">{profile?.full_name || user?.email?.split('@')[0]}</h2>
            )}

            {editing ? (
                <textarea value={editedBio} onChange={(e) => setEditedBio(e.target.value)}
                          className="w-full h-24 bg-[#1C1616] text-white p-3 rounded-lg border border-white/10 text-xs italic opacity-80 outline-none focus:border-[#CD8E6D]" />
            ) : (
                <p style={{ color: COLORS.textMuted }} className="text-xs font-bold leading-relaxed italic opacity-80">
                  {profile?.bio || '"Scanning library... no protocol bio initialized."'}
                </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2">
              {[
                { label: 'Actor', val: profile?.favorite_actor, edited: editedActor, set: setEditedActor },
                { label: 'Director', val: profile?.favorite_director, edited: editedDirector, set: setEditedDirector },
                { label: 'Studio', val: profile?.favorite_studio, edited: editedStudio, set: setEditedStudio },
                { label: 'Genre', val: profile?.favorite_genre, edited: editedGenre, set: setEditedGenre }
              ].map((pref, i) => (
                <div key={i} className="bg-[#1C1616] p-4 rounded-2xl border border-white/5 flex flex-col gap-1 hover:border-[#CD8E6D]/30 transition group">
                   <span style={{ color: COLORS.acc3 }} className="text-[8px] font-black uppercase tracking-[0.4em]">{pref.label}</span>
                   {editing ? (
                     <input type="text" value={pref.edited} onChange={(e) => pref.set(e.target.value)}
                            className="bg-transparent text-[11px] font-bold text-white outline-none" placeholder={`Fav ${pref.label}...`}/>
                   ) : (
                     <span className="text-[11px] font-bold text-white/80 group-hover:text-white">{pref.val || 'NULL'}</span>
                   )}
                </div>
              ))}
          </div>

          {editing && (
              <div className="flex gap-2">
                <button onClick={handleUpdateProfile} className="flex-1 bg-[#CD8E6D] py-3 rounded-xl font-black uppercase tracking-widest text-black text-[10px] hover:scale-105 transition shadow-2xl">Save Changes</button>
                <button onClick={() => setEditing(false)} className="flex-1 bg-[#1C1616] py-3 rounded-xl border border-white/10 font-black uppercase tracking-widest text-white/40 text-[10px] hover:text-white transition shadow-2xl">Cancel</button>
              </div>
          )}

          <div className="pt-4 border-t border-white/5">
             <Link href="/" className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-[#CD8E6D] transition">← Return to Home Page</Link>
          </div>
        </div>

        <div className="space-y-12">
          {/* STATS HEADER */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6">
            <div className="bg-[#1C1616] p-8 rounded-[2.5rem] border border-white/5 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30">Watch Protocol</p>
                    <p style={{ color: COLORS.acc1 }} className="text-xl font-black italic">
                      {stats.hoursWatched} <span className="text-[10px] opacity-40">HRS</span>
                    </p>
                </div>
                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <div style={{ width: `${Math.min((parseFloat(stats.hoursWatched) / 5000) * 100, 100)}%`, background: `linear-gradient(to right, ${COLORS.acc2}, ${COLORS.acc1})` }} 
                         className="h-full rounded-full transition-all duration-1000" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-[#1C1616] p-6 rounded-[2rem] border border-white/5 text-center">
                  <p style={{ color: COLORS.acc3 }} className="text-2xl font-black italic">{stats.meanScore}</p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mt-1">Mean Score</p>
               </div>
               <div className="bg-[#1C1616] p-6 rounded-[2rem] border border-white/5 text-center">
                  <p style={{ color: COLORS.acc3 }} className="text-2xl font-black italic">{stats.moviesLogged}</p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mt-1">Movies Logged</p>
               </div>
            </div>
          </div>

          <section>
             <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40 mb-8 px-4 flex items-center gap-4">
                <div className="w-8 h-px bg-[#CD8E6D]/40" /> Top 10 Selection
             </h3>
             <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {top10Movies.map((m, idx) => (
                    <div key={idx} className="group relative">
                        <Link href={`/movie/${m.id}`}>
                            <div className="aspect-[2/3] rounded-[1.5rem] overflow-hidden border border-white/5 grayscale group-hover:grayscale-0 transition-all duration-700 hover:scale-[1.05] shadow-xl hover:border-[#CD8E6D]/30">
                                <img src={m.poster_path ? `${IMAGE_BASE}${m.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster'} className="w-full h-full object-cover" alt={m.title} />
                                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                                    <span style={{ color: COLORS.acc1 }} className="text-[10px] font-black italic">{idx + 1}</span>
                                </div>
                            </div>
                        </Link>
                        <button onClick={() => removeFromVault(m.id)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-900 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-30 flex items-center justify-center text-[10px] font-bold">×</button>
                    </div>
                ))}
                {[...Array(10 - top10Movies.length)].map((_, i) => (
                  <button key={`empty-${i}`} onClick={() => setIsSearchOpen(true)} className="aspect-[2/3] rounded-[1.5rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center group hover:border-[#CD8E6D]/20 transition-all bg-[#1C1616]/30">
                    <span className="text-2xl text-white/5 group-hover:text-[#CD8E6D]/40 group-hover:scale-125 transition-all">+</span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/5 group-hover:text-[#CD8E6D]/40 mt-2">Vault Movie</span>
                  </button>
                ))}
             </div>
          </section>

          {/* NEW: ACTIVITY LOG SECTION */}
          <section className="mt-20">
             <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40 mb-8 px-4 flex items-center gap-4">
                <div className="w-8 h-px bg-[#CD8E6D]/40" /> Activity Log
             </h3>
             <div className="space-y-3">
                {logs.length > 0 ? logs.map((log, i) => (
                  <div key={i} className="flex items-center gap-6 bg-[#1C1616]/50 p-4 rounded-3xl border border-white/5 hover:border-white/10 transition group">
                     <img src={`${IMAGE_BASE}${log.poster_path}`} className="w-12 h-16 rounded-xl object-cover grayscale-[50%] group-hover:grayscale-0 transition" alt="" />
                     <div className="flex-grow">
                        <h4 className="text-sm font-black uppercase tracking-tighter text-white">{log.movie_title}</h4>
                        <p className="text-[9px] font-bold text-[#8C7461] uppercase tracking-widest">{log.runtime} MINS</p>
                     </div>
                     <div className="bg-[#0F0E0E] px-4 py-2 rounded-2xl border border-[#3C7F8C]/20">
                        <span className="text-[#3C7F8C] font-black italic text-sm">{log.rating}</span>
                        <span className="text-[8px] text-white/10 ml-1">/10</span>
                     </div>
                  </div>
                )) : (
                  <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[2.5rem]">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/10 italic">No historical data available</p>
                  </div>
                )}
             </div>
          </section>
        </div>
      </main>

      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        onMovieSelect={(movie) => {
          // You'll want to prompt for a rating here, 
          // or we can default to 7 for now to test the "Log" functionality
          logMovie(movie, 7); 
          setIsSearchOpen(false);
        }}
      />
    </div>
  );
}