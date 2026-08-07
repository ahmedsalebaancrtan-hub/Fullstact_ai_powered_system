import React, { useMemo, useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Menu, User } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import Sidebar from '../components/Sidebar';

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const { token, user, logout, fetchProfile } = useAuthStore();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const displayName = useMemo(() => {
    return user?.full_name || user?.FullName || user?.name || 'Researcher';
  }, [user]);

  const displayRole = useMemo(() => {
    return (user?.role || user?.Role || 'user').toString();
  }, [user]);

  const displayEmail = useMemo(() => {
    return user?.email || user?.Email || '';
  }, [user]);

  useEffect(() => {
    if (!token || user) return;
    fetchProfile();
  }, [token, user, fetchProfile]);

  // ── RBAC: derive role once ─────────────────────────────────────────────────
  const role = (user?.role || user?.Role || '').toLowerCase();
  const isAdmin = role === 'admin';
  // ──────────────────────────────────────────────────────────────────────────

  // Auto-collapse sidebar on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Redirect AFTER hooks to satisfy React's Rules of Hooks
  if (isAdmin) {
    return <Navigate to="/admin-dashboard" state={{ from: location }} replace />;
  }

  return (
    <div className="flex h-screen w-screen bg-[#060608] font-sans overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[20%] w-[30%] h-[30%] bg-indigo-500/5 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[25%] h-[25%] bg-purple-600/5 rounded-full blur-[120px]"></div>
      </div>
      
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        logout={logout}
        user={user}
      />

      {/* Main Content Area */}
      <main 
        className={`flex-1 flex flex-col transition-all duration-300 h-full relative z-10
          ${isSidebarOpen ? 'md:ml-[290px]' : 'md:ml-28'}`}
      >
        {/* Header */}
        <header className="h-20 bg-transparent border-b border-slate-900/60 flex items-center justify-between px-6 md:px-10 shrink-0 z-[50] relative">
          <div className="flex items-center gap-5">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 text-slate-400 hover:text-slate-50 hover:bg-slate-900/50 rounded-xl transition-all border border-transparent hover:border-slate-800/80"
            >
              <Menu size={24} />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-white">
                Dashboard
              </h1>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                QUIZ AI Interface
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pl-6 border-l border-slate-800/80">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-50">{displayName}</p>
                <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md inline-block mt-0.5">
                  {displayRole}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsProfileOpen((v) => !v)}
                className="h-11 w-11 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 flex items-center justify-center text-slate-50 shadow-2xl group hover:bg-slate-800/60 transition-colors"
                aria-label="Open profile menu"
              >
                <User size={22} className="text-indigo-400 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>

          {/* Profile dropdown */}
          {isProfileOpen && (
            <div
              className="absolute right-6 md:right-10 top-[72px] w-[320px] rounded-3xl border border-slate-800/80 bg-slate-900/90 backdrop-blur-2xl shadow-2xl overflow-hidden"
              onMouseLeave={() => setIsProfileOpen(false)}
            >
              <div className="p-5 border-b border-white/10">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.25em]">Profile</p>
                <p className="mt-2 text-lg font-black text-slate-50 truncate">{displayName}</p>
                {displayEmail ? (
                  <p className="text-xs text-slate-400 font-semibold truncate">{displayEmail}</p>
                ) : null}
                <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-500/15 text-indigo-200 border border-indigo-500/25">
                  {displayRole}
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

        {/* Content Outlet - Internal Scrolling */}
        <div className="flex-1 overflow-y-auto scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          <div className="p-4 md:p-10 max-w-[1600px] mx-auto w-full pb-32">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
