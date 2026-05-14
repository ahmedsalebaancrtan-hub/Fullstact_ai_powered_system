import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, User } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import Sidebar from '../components/Sidebar';

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const { user, logout } = useAuthStore();

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

  return (
    <div className="flex h-screen w-screen bg-[#0f172a] font-sans overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        logout={logout}
        user={user}
      />

      {/* Main Content Area */}
      <main 
        className={`flex-1 flex flex-col transition-all duration-300 h-full relative
          ${isSidebarOpen ? 'md:ml-[280px]' : 'md:ml-20'}`}
      >
        {/* Header */}
        <header className="h-20 bg-[#0a0f1e]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 md:px-10 shrink-0 z-[50]">
          <div className="flex items-center gap-5">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              <Menu size={24} />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-white">
                Dashboard
              </h1>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
                QUIZ AI Interface
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pl-6 border-l border-white/5">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-white">{user?.FullName || 'Researcher'}</p>
                <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest bg-indigo-900/30 px-2 py-0.5 rounded-md inline-block">
                  {user?.Role || 'Academic'}
                </p>
              </div>
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
                <User size={22} />
              </div>
            </div>
          </div>
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
