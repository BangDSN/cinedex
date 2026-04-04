'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { 
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { username, full_name: fullName }
        },
      });
      if (error) setMessage(error.message);
      else setMessage('Account created. Check your email to confirm.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else router.push('/dex');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0F0E0E] flex items-center justify-center p-6 selection:bg-[#3C7F8C]/30">
      <div className="w-full max-w-md space-y-8 bg-[#1C1616] p-10 rounded-[2.5rem] border border-white/5 shadow-2xl transition-all duration-500">
        
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-[#CD8E6D]">
            {isSignUp ? 'Sign Up' : 'Login'}
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic">
            {isSignUp ? 'Create your Cinedex Profile' : 'Access your Archive'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5 mt-10">
          {isSignUp && (
            <div className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-[#8C7461] ml-4">Username</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-[#0F0E0E] border border-white/5 rounded-2xl p-4 text-white outline-none focus:border-[#CD8E6D] transition-all"
                  placeholder="Username"
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-[#8C7461] ml-4">Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-[#0F0E0E] border border-white/5 rounded-2xl p-4 text-white outline-none focus:border-[#CD8E6D] transition-all"
                  placeholder="Name"
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase tracking-widest text-[#8C7461] ml-4">Email</label>
            <input 
              required
              type="email" 
              className="w-full bg-[#0F0E0E] border border-white/5 rounded-2xl p-4 text-white outline-none focus:border-[#CD8E6D] transition-all"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase tracking-widest text-[#8C7461] ml-4">Password</label>
            <input 
              required
              type="password" 
              className="w-full bg-[#0F0E0E] border border-white/5 rounded-2xl p-4 text-white outline-none focus:border-[#CD8E6D] transition-all"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#CD8E6D] py-4 rounded-2xl font-black uppercase tracking-widest text-black text-xs hover:scale-[1.02] transition-all shadow-xl disabled:opacity-50 mt-4"
          >
            {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Login'}
          </button>

          {message && <p className="text-[10px] text-center font-black uppercase text-[#3C7F8C] animate-pulse">{message}</p>}
        </form>

        <div className="pt-8 text-center space-y-4">
           <button 
             onClick={() => setIsSignUp(!isSignUp)}
             className="text-[10px] font-black uppercase tracking-widest text-[#CD8E6D]/60 hover:text-[#CD8E6D] transition"
           >
             {isSignUp ? 'Already have an account? Login' : 'New user? Sign Up'}
           </button>
           <div className="block">
             <Link href="/" className="text-[9px] font-black uppercase tracking-widest text-white/10 hover:text-white transition">← Return to Public Dex</Link>
           </div>
        </div>
      </div>
    </div>
  );
}