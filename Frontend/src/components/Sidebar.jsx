import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UploadCloud, 
  FileText, 
  LogOut, 
  X,
  BarChart3,
  BookOpen,
  ClipboardList,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ isOpen, toggleSidebar, logout, user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Normalize role to lowercase for consistent comparison
  const role = (user?.role || user?.Role || '').toLowerCase();
  const isAdmin   = role === 'admin';
  const isTeacher = role === 'teacher';
  const isStudent = role === 'student';

  // Build menu based on role
  const menuItems = [];

  if (isAdmin) {
    menuItems.push(
      { name: 'Admin Dashboard', icon: ShieldCheck,     path: '/admin-dashboard' },
      { name: 'Dashboard',       icon: LayoutDashboard, path: '/dashboard' },
      { name: 'Upload Material', icon: UploadCloud,     path: '/upload' },
      { name: 'All Quizzes',     icon: FileText,        path: '/history' },
      { name: 'Analytics',       icon: BarChart3,       path: '/analytics' },
    );
  } else if (isTeacher) {
    menuItems.push(
      { name: 'Dashboard',       icon: LayoutDashboard, path: '/dashboard' },
      { name: 'Upload Material', icon: UploadCloud,     path: '/upload' },
      { name: 'My Quizzes',      icon: FileText,        path: '/history' },
      { name: 'Analytics',       icon: BarChart3,       path: '/analytics' },
    );
  } else {
    // student (default)
    menuItems.push(
      { name: 'Dashboard',       icon: LayoutDashboard, path: '/dashboard' },
      { name: 'Available Quizzes', icon: BookOpen,      path: '/dashboard' },
      { name: 'Results',         icon: ClipboardList,   path: '/history' },
    );
  }

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

      {/* Sidebar Container */}
      <aside 
        className={`fixed left-4 top-4 bottom-4 bg-slate-900/60 backdrop-blur-xl text-slate-50 transition-all duration-300 z-[70] rounded-3xl border border-slate-800/80 shadow-2xl
        ${isOpen ? 'w-[260px] translate-x-0' : 'w-0 -translate-x-full md:w-20 md:translate-x-0'}
        overflow-hidden`}
      >
        <div className="flex flex-col h-full w-[260px]">
          {/* Logo Section */}
          <div className="p-8 flex items-center justify-between shrink-0">
            <h2 className={`font-black text-xl tracking-tighter transition-all duration-300 flex items-center gap-2 ${!isOpen && 'md:opacity-0 md:scale-0'}`}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-sm">AI</div>
              <span>QUIZ<span className="text-indigo-400">GEN</span></span>
            </h2>
            <button 
              onClick={toggleSidebar}
              className="md:hidden text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-xl transition-all"
            >
              <X size={24} />
            </button>
          </div>

          {/* Role Badge */}
          <div className={`px-6 mb-4 transition-all duration-300 ${!isOpen && 'md:opacity-0'}`}>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border
              ${isAdmin   ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' :
                isTeacher ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' :
                            'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'}`}>
              {isAdmin ? <ShieldCheck size={10} /> : null}
              {role || 'user'}
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto overflow-x-hidden">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                   key={item.name}
                  onClick={() => {
                    navigate(item.path);
                    if (window.innerWidth < 768) toggleSidebar();
                  }}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all relative group border
                    ${isActive 
                      ? 'bg-indigo-500/10 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.15)] border-indigo-500/20' 
                      : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-50 border-transparent hover:border-slate-800/60'
                    }`}
                >
                  <item.icon size={22} className={`shrink-0 transition-all duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'group-hover:scale-110 group-hover:text-indigo-400'}`} />
                  <span className={`font-black text-sm uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${!isOpen && 'md:opacity-0 md:translate-x-10'}`}>
                    {item.name}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* User Section (Bottom) */}
          <div className="p-6 border-t border-slate-800/60 shrink-0 bg-slate-950/40 rounded-b-3xl">
            {/* User info */}
            <div className={`mb-3 px-1 transition-all duration-300 ${!isOpen && 'md:opacity-0'}`}>
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest truncate">
                {user?.FullName || user?.full_name || user?.name || 'User'}
              </p>
              <p className="text-xs text-slate-600 truncate mt-0.5">
                {user?.email || user?.Email || ''}
              </p>
            </div>
            <button 
              onClick={logout}
              className="w-full flex items-center gap-4 px-5 py-4 text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 border border-transparent rounded-2xl transition-all group"
            >
              <LogOut size={22} className="shrink-0 transition-transform group-hover:-translate-x-1 group-hover:drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]" />
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
