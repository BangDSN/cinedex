'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Initialize the Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        emailRedirectTo: `${window.location.origin}/auth/callback` 
      },
    });
    
    if (error) setMessage(error.message);
    else setMessage('Check your email for the confirmation link!');
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) setMessage(error.message);
    else router.push('/dex');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0F0E0E] flex items-center justify-center p-6 selection:bg-[#3C7F8C]/30">
      <div className="w-full max-w-md space-y-8 bg-[#1C1616] p-10 rounded-[2.5rem] border border-white/5 shadow-2xl">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-[#CD8E6D]">System Access</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic">Cinedex Authentication Protocol</p>
        </div>

        <form className="space-y-6 mt-10">
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase tracking-widest text-[#8C7461] ml-4">Email</label>
            <input 
              type="email" 
              className="w-full bg-[#0F0E0E] border border-white/5 rounded-2xl p-4 text-white outline-none focus:border-[#CD8E6D] transition-all"
              placeholder="ENTER EMAIL..."
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase tracking-widest text-[#8C7461] ml-4">Password</label>
            <input 
              type="password" 
              className="w-full bg-[#0F0E0E] border border-white/5 rounded-2xl p-4 text-white outline-none focus:border-[#CD8E6D] transition-all"
              placeholder="ENTER PASSWORD..."
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button onClick={handleSignIn} disabled={loading}
                    className="flex-1 bg-[#CD8E6D] py-4 rounded-2xl font-black uppercase tracking-widest text-black text-xs hover:scale-[1.02] transition-all shadow-xl disabled:opacity-50">
              Login
            </button>
            <button onClick={handleSignUp} disabled={loading}
                    className="flex-1 border border-white/10 py-4 rounded-2xl font-black uppercase tracking-widest text-white text-xs hover:bg-white/5 transition-all disabled:opacity-50">
              Signup
            </button>
          </div>
          {message && <p className="text-[10px] text-center font-black uppercase text-[#3C7F8C] animate-pulse">{message}</p>}
        </form>

        <div className="pt-8 text-center">
           <Link href="/" className="text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-white transition">← Return to Public Dex</Link>
        </div>
      </div>
    </div>
  );
}