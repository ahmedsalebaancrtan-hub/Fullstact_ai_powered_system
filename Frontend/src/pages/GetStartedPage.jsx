import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, BarChart3, ChevronRight } from 'lucide-react';

export default function GetStartedPage() {
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);

  const handleStart = () => {
    setIsExiting(true);
    setTimeout(() => {
      navigate('/login');
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
    <div className="h-screen w-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e1b4b] relative overflow-hidden flex flex-col">
      
      {/* Ambient Light Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[140px] animate-pulse"></div>
        <div className="absolute bottom-[20%] right-[5%] w-[35%] h-[35%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="flex-1 overflow-y-auto w-full relative z-10 flex flex-col items-center justify-start pt-12 pb-12 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        <AnimatePresence>
          {!isExiting && (
            <motion.div 
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="flex flex-col items-center text-center px-4 md:px-6 w-full max-w-6xl"
            >
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="max-w-4xl mx-auto mb-8"
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-50 leading-tight tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                Empower Your Learning with Academic AI.
              </h1>
            </motion.div>

            {/* How It Works - Glass Cards */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12"
            >
              {cards.map((card, index) => (
                <motion.div 
                  key={index}
                  variants={itemVariants}
                  className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-6 text-left hover:bg-white/10 transition-colors duration-300 shadow-[0_0_20px_rgba(0,0,0,0.3)]"
                >
                  <div className="w-14 h-14 rounded-2xl bg-slate-900/50 border border-white/10 flex items-center justify-center mb-6 shadow-inner">
                    {card.icon}
                  </div>
                  <h3 className="text-xl font-black text-slate-50 mb-3">{card.title}</h3>
                  <p className="text-slate-400 font-medium text-sm leading-relaxed">
                    {card.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {/* Miniature CTA Button - Forced Visibility */}
            <motion.div
              initial={{ opacity: 1, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-6 flex justify-center w-full relative z-[100] pb-10"
            >
              <motion.button
                onClick={handleStart}
                whileHover={{ scale: 1.05, boxShadow: "0px 0px 30px rgba(99,102,241,0.8)" }}
                whileTap={{ scale: 0.95 }}
                className="group flex items-center justify-center gap-2 px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg rounded-full border border-white/20 shadow-lg shadow-indigo-500/50 transition-all"
              >
                <span>Get Started Now</span>
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}