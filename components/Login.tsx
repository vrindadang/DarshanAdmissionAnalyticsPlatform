
import React, { useState } from 'react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('admin@def.org');
  const [password, setPassword] = useState('password');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#f8f5f2] via-[#e8eef6] to-[#d6e4f0] p-6 font-sans relative overflow-hidden">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-400/5 blur-[120px] rounded-full"></div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center z-10">
        {/* Left Section */}
        <div className="flex flex-col items-start space-y-8 animate-in slide-in-from-left duration-1000">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-[0_15px_40px_-10px_rgba(0,0,0,0.1)] mb-4">
             <span className="text-4xl font-black text-[#0066cc]">D</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-[56px] leading-[1.1] font-extrabold text-[#0f172a] tracking-tight">
              Darshan Academy
            </h1>
            <div className="flex items-center gap-3">
              <div className="w-10 h-[3px] bg-[#e11d48]"></div>
              <span className="text-[11px] font-extrabold text-[#0066cc] uppercase tracking-[0.35em]">
                Admissions Intelligence
              </span>
            </div>
          </div>

          <div className="mt-16 space-y-6 max-w-md">
            <blockquote className="relative">
               <span className="absolute -top-10 -left-6 text-[80px] font-serif text-[#fbd38d] opacity-50">“</span>
               <p className="text-[32px] leading-[1.3] font-bold text-[#1e293b] italic tracking-tight">
                 "Be Conscious, Be Connected, Be Caring"
               </p>
            </blockquote>
            <div className="flex flex-col gap-2">
              <div className="w-12 h-[1.5px] bg-[#fbd38d]"></div>
              <p className="text-[11px] font-bold text-[#ea580c] uppercase tracking-[0.25em]">
                Sant Rajinder Singh Ji Maharaj
              </p>
            </div>
          </div>
        </div>

        {/* Right Section - Login Card */}
        <div className="flex justify-center lg:justify-end animate-in slide-in-from-right duration-1000 delay-200">
          <div className="w-full max-w-[480px] bg-white p-14 rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.12)] border border-white/40 backdrop-blur-sm">
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-[#0f172a] mb-2">Secure Gateway</h2>
              <p className="text-sm font-medium text-[#64748b]">Accessing Consolidated Intelligence Core</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-extrabold text-[#94a3b8] uppercase tracking-[0.2em] ml-1">
                  Enterprise Credential
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#f8fafc] border-none rounded-2xl p-5 text-sm font-semibold text-[#0f172a] focus:ring-2 focus:ring-[#0070f3] outline-none transition-all placeholder-[#cbd5e1]"
                  placeholder="admin@def.org"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-extrabold text-[#94a3b8] uppercase tracking-[0.2em] ml-1">
                  Strategic Access Key
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#f8fafc] border-none rounded-2xl p-5 text-sm font-semibold text-[#0f172a] focus:ring-2 focus:ring-[#0070f3] outline-none transition-all placeholder-[#cbd5e1]"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                className="w-full py-5 bg-[#0070f3] hover:bg-[#0060d0] text-white rounded-2xl text-[11px] font-extrabold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-[0_15px_30px_-5px_rgba(0,112,243,0.35)] active:scale-[0.98]"
              >
                Initialize Session
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>

            <div className="mt-14 flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#10b981] rounded-full animate-pulse"></div>
              <p className="text-[9px] font-extrabold text-[#94a3b8] uppercase tracking-[0.25em]">
                Governance Protocol V4.2 Active
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Text */}
      <footer className="absolute bottom-8 w-full text-center">
        <p className="text-[9px] font-bold text-[#94a3b8] uppercase tracking-[0.3em] opacity-60">
          Darshan Intelligence Group &copy; 2025
        </p>
      </footer>
    </div>
  );
};

export default Login;
