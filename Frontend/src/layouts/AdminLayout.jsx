import React, { useEffect, useMemo, useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { ShieldCheck, User, LogOut, LayoutDashboard, Users, Activity, School } from 'lucide-react';

export default function AdminLayout() {
  const { token, user, logout, fetchProfile } = useAuthStore();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    if (!token || user) return;
    fetchProfile();
  }, [token, user, fetchProfile]);

  const role = (user?.role || user?.Role || '').toLowerCase();
  const isAdmin = role === 'admin';

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <div className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Loading admin session…</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  const displayName = useMemo(() => user?.full_name || user?.FullName || user?.name || 'Admin', [user]);
  const displayEmail = useMemo(() => user?.email || user?.Email || '', [user]);
  const initial = useMemo(
    () => (displayName || 'A').toString().trim().charAt(0).toUpperCase(),
    [displayName]
  );

  return (
    <div className="h-screen bg-[#060608] text-slate-50 flex flex-col overflow-hidden">
      <header className="px-6 md:px-10 py-5 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50 relative">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500/10 p-2 rounded-xl border border-indigo-500/20">
            <ShieldCheck className="text-indigo-400" />
          </div>
          <h1 className="text-xl font-black tracking-tight">Admin Portal</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsProfileOpen((v) => !v)}
            className="flex items-center gap-3 bg-slate-900/60 px-4 py-2 rounded-2xl border border-slate-800/80 hover:bg-slate-800/60 transition-colors"
            aria-label="Open profile menu"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center font-black text-sm">
              {initial}
            </div>
            <div className="hidden md:block text-left">
              <p className="font-black text-sm leading-tight">{displayName}</p>
              <p className="text-[10px] text-indigo-300 font-black uppercase tracking-widest">admin</p>
            </div>
            <User size={18} className="text-slate-400 hidden sm:block" />
          </button>
          
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors font-bold text-sm"
          >
            <LogOut size={18} />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>

        {isProfileOpen && (
          <div
            className="absolute right-6 md:right-10 top-[76px] w-[340px] rounded-3xl border border-slate-800/80 bg-slate-900/90 backdrop-blur-2xl shadow-2xl overflow-hidden"
            onMouseLeave={() => setIsProfileOpen(false)}
          >
            <div className="p-5 border-b border-white/10">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.25em]">Signed in as</p>
              <p className="mt-2 text-lg font-black text-slate-50 truncate">{displayName}</p>
              {displayEmail ? (
                <p className="text-xs text-slate-400 font-semibold truncate">{displayEmail}</p>
              ) : null}
              <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-500/15 text-indigo-200 border border-indigo-500/25">
                admin
              </div>
            </div>
            <div className="p-3">
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  logout();
                }}
                className="w-full px-4 py-3 rounded-2xl text-left font-black uppercase tracking-widest text-[11px] text-red-300 hover:text-red-200 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </header>
      
      <div className="flex-1 min-h-0 w-full max-w-[1600px] mx-auto px-4 md:px-8 py-6 flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-[280px] shrink-0 h-fit bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-4 shadow-2xl">
          <p className="px-2 pt-2 pb-4 text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">Admin Navigation</p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('admin-overview');
                el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-transparent hover:border-indigo-500/20 hover:bg-white/5 text-slate-200 transition-all"
            >
              <LayoutDashboard size={18} className="text-indigo-400" />
              <span className="font-black uppercase tracking-widest text-[11px]">Overview</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('admin-educators');
                el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-transparent hover:border-indigo-500/20 hover:bg-white/5 text-slate-200 transition-all"
            >
              <Users size={18} className="text-indigo-400" />
              <span className="font-black uppercase tracking-widest text-[11px]">Educators</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('admin-schools');
                el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-transparent hover:border-indigo-500/20 hover:bg-white/5 text-slate-200 transition-all"
            >
              <School size={18} className="text-indigo-400" />
              <span className="font-black uppercase tracking-widest text-[11px]">Schools</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('admin-audit');
                el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-transparent hover:border-indigo-500/20 hover:bg-white/5 text-slate-200 transition-all"
            >
              <Activity size={18} className="text-indigo-400" />
              <span className="font-black uppercase tracking-widest text-[11px]">Audit stream</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 min-w-0 min-h-0 overflow-y-auto pb-16 pr-2">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
