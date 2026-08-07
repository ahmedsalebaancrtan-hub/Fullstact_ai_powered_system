import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, BarChart3, ChevronRight } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

export default function GetStartedPage() {
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);

  const handleStart = () => {
    setIsExiting(true);
    setTimeout(() => {
      const token = localStorage.getItem('token') || useAuthStore.getState().token;
      if (!token) {
        navigate('/login');
        return;
      }

      const storedUser = localStorage.getItem('user');
      let user = useAuthStore.getState().user;
      if (!user && storedUser) {
        try {
          user = JSON.parse(storedUser);
        } catch (e) {
          console.error("Failed to parse user from localStorage", e);
        }
      }

      const role = (user?.role || user?.Role || '').toLowerCase();
      if (role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
    }, 500);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const cards = [
    {
      icon: <UploadCloud size={28} className="text-indigo-400" />,
      title: "Smart Upload",
      description: "Upload your PDFs or paste text documents directly. Our system performs deep AI analysis instantly."
    },
    {
      icon: <FileText size={28} className="text-purple-400" />,
      title: "Instant Quiz",
      description: "Automatically generate high-quality MCQs, True/False, and Short Answer assessments in seconds."
    },
    {
      icon: <BarChart3 size={28} className="text-pink-400" />,
      title: "Real-Time Analytics",
      description: "Receive instant accuracy rate feedback and comprehensive pedagogical summaries after every quiz."
    }
  ];
  return (
    <div className="h-screen w-full bg-[#060608] relative overflow-hidden flex flex-col items-center justify-between py-8">
      
      {/* Ambient Light Orbs */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[140px] animate-pulse"></div>
        <div className="absolute bottom-[20%] right-[5%] w-[35%] h-[35%] bg-purple-600/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <AnimatePresence>
        {!isExiting && (
          <motion.div 
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="flex flex-col items-center justify-between h-full w-full max-w-6xl px-4 md:px-6 relative z-10"
          >
            <div className="flex flex-col items-center justify-center flex-1 w-full mt-4 md:mt-8">
              {/* Hero Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="max-w-4xl mx-auto mb-8 text-center"
              >
                <h1 className="text-4xl md:text-5xl lg:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                  Empower Your Learning with Academic AI.
                </h1>
              </motion.div>

              {/* How It Works - Glass Cards */}
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full"
              >
                {cards.map((card, index) => (
                  <motion.div 
                    key={index}
                    variants={itemVariants}
                    className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-[32px] p-6 text-left hover:bg-slate-900/80 hover:border-slate-700/80 transition-all duration-300 shadow-2xl"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-center mb-3 shadow-inner">
                      {card.icon}
                    </div>
                    <h3 className="text-xl font-black text-white mb-2">{card.title}</h3>
                    <p className="text-slate-400 font-medium text-sm leading-relaxed">
                      {card.description}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Miniature CTA Button - Forced Visibility */}
            <motion.div
              initial={{ opacity: 1, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mb-6 flex justify-center w-full relative z-50 shrink-0"
            >
              <motion.button
                onClick={handleStart}
                whileHover={{ scale: 1.05, boxShadow: "0px 0px 30px rgba(99,102,241,0.5)" }}
                whileTap={{ scale: 0.95 }}
                className="group flex items-center justify-center gap-2 px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-lg rounded-full border border-white/10 shadow-lg shadow-indigo-500/30 transition-all"
              >
                <span>Get Started Now</span>
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}