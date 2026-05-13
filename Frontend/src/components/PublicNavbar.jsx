import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const PublicNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <nav className="fixed top-0 left-0 w-full h-24 z-[100] flex items-center justify-between px-8 md:px-16 bg-transparent">
      {/* Logo Section - Matching image_4a3dc1.png */}
      <div 
        className="flex items-center gap-3 cursor-pointer group" 
        onClick={() => navigate('/')}
      >
        <div className="h-11 w-11 bg-[#1e3a8a] rounded-lg flex items-center justify-center shadow-lg shadow-black/20 group-hover:scale-105 transition-transform">
          <span className="text-white font-black text-2xl">A</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-black text-xl text-white tracking-tight uppercase">Academic</span>
          <span className="font-black text-xl text-[#F8C2A0] tracking-tight uppercase">AI</span>
        </div>
      </div>

      {/* Auth Toggle Button - Matching image_4a3dc1.png */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate(isLoginPage ? '/register' : '/login')}
        className="px-10 py-3.5 bg-[#F8C2A0] text-[#1e3a8a] font-black rounded-xl shadow-xl shadow-black/10 hover:bg-[#f7b58c] transition-all text-lg"
      >
        {isLoginPage ? 'Sign Up' : 'Login'}
      </motion.button>
    </nav>
  );
};

export default PublicNavbar;
