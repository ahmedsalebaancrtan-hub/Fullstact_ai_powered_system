import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UploadCloud, 
  FileText, 
  LogOut, 
  X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ isOpen, toggleSidebar, logout, user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Upload Material', icon: UploadCloud, path: '/upload' },
    { name: 'My Quizzes', icon: FileText, path: '/history' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-full bg-[#0a0f1e] text-white transition-all duration-300 z-[70] 
        ${isOpen ? 'w-[280px] translate-x-0' : 'w-0 -translate-x-full md:w-20 md:translate-x-0'}
        overflow-hidden shadow-2xl border-r border-white/5`}
      >
        <div className="flex flex-col h-full w-[280px]">
          {/* Logo Section */}
          <div className="p-8 flex items-center justify-between shrink-0">
            <h2 className={`font-black text-xl tracking-tighter transition-all duration-300 ${!isOpen && 'md:opacity-0 md:scale-0'}`}>
              QUIZ <span className="text-[#F8C2A0]">GENERATOR</span>
            </h2>
            <button 
              onClick={toggleSidebar}
              className="md:hidden text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-xl transition-all"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation Items - Internal Scroll */}
          <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto overflow-x-hidden">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.path);
                    if (window.innerWidth < 768) toggleSidebar();
                  }}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all relative group
                    ${isActive 
                      ? 'bg-indigo-600/20 text-indigo-400 shadow-xl shadow-black/10' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <item.icon size={22} className={`shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className={`font-black text-sm uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${!isOpen && 'md:opacity-0 md:translate-x-10'}`}>
                    {item.name}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* User Section (Bottom) */}
          <div className="p-6 border-t border-white/5 shrink-0 bg-white/5">
            <button 
              onClick={logout}
              className="w-full flex items-center gap-4 px-5 py-4 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all group"
            >
              <LogOut size={22} className="shrink-0 transition-transform group-hover:-translate-x-1" />
              <span className={`font-black text-sm uppercase tracking-widest transition-all duration-300 ${!isOpen && 'md:opacity-0 md:translate-x-10'}`}>
                Logout
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
