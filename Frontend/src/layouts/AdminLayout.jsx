import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { ShieldCheck, LogOut } from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  if (!user || (user.role?.toLowerCase() !== 'admin' && user.Role?.toLowerCase() !== 'admin')) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <header className="px-8 py-6 flex items-center justify-between border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500/20 p-2 rounded-xl border border-indigo-500/30">
            <ShieldCheck className="text-indigo-400" />
          </div>
          <h1 className="text-xl font-black tracking-tight">Admin Portal</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-black text-sm">
              {user.full_name?.charAt(0) || 'A'}
            </div>
            <span className="font-bold text-sm hidden md:block">{user.full_name}</span>
          </div>
          
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors font-bold text-sm"
          >
            <LogOut size={18} />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </header>
      
      <main className="flex-1 p-6 md:p-12 overflow-y-auto max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
