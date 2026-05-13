import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import PublicNavbar from '../components/PublicNavbar';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const register = useAuthStore((state) => state.register);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Access Key must be at least 8 characters");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Creating Account...");
    
    const result = await register({ name, email, password });
    
    if (result.success) {
      toast.success("Account Created", { id: loadingToast });
      setTimeout(() => navigate('/dashboard'), 1000);
    } else {
      toast.error(result.message, { id: loadingToast });
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#0a0f1e] flex flex-col items-center justify-center font-sans overflow-hidden relative">
      <PublicNavbar />

      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] right-[10%] w-[40%] h-[40%] bg-blue-900/5 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[20%] left-[-5%] w-[30%] h-[30%] bg-indigo-900/5 rounded-full blur-[120px]"></div>
      </div>

      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-[#0a0f1e]/80 backdrop-blur-xl flex flex-col items-center justify-center"
          >
            <Loader2 size={64} className="text-[#F8C2A0] animate-spin mb-8" />
            <p className="text-white font-black uppercase tracking-[0.5em] text-xs">Initializing Profile</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[500px] px-6 relative z-10"
      >
        <div className="bg-[#0f172a]/40 backdrop-blur-3xl rounded-[40px] border border-white/5 p-8 md:p-12 shadow-2xl">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Create User</h1>
            <p className="text-gray-400 font-medium text-sm leading-relaxed">
              Join the Quiz ai Generator.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-600 transition-colors group-focus-within:text-[#F8C2A0]">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Prof. John Doe"
                  className="w-full pl-14 pr-6 py-3.5 bg-[#0a0f1e]/60 border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all text-white placeholder:text-gray-700 font-medium text-md"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Institutional Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-600 transition-colors group-focus-within:text-[#F8C2A0]">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full pl-14 pr-6 py-3.5 bg-[#0a0f1e]/60 border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all text-white placeholder:text-gray-700 font-medium text-md"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Access Key</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-600 transition-colors group-focus-within:text-[#F8C2A0]">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full pl-14 pr-14 py-3.5 bg-[#0a0f1e]/60 border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all text-white placeholder:text-gray-700 font-medium text-md"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-5 flex items-center text-gray-600 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <motion.button 
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-4.5 bg-[#F8C2A0] text-[#1e3a8a] font-black text-xl rounded-2xl shadow-xl shadow-black/20 hover:bg-[#f7b58c] transition-all mt-4 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <span>Sign Up</span>
            </motion.button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-gray-600 font-bold text-xs">
              Existing Account? {' '}
              <button 
                onClick={() => navigate('/login')}
                className="text-gray-400 hover:text-white transition-colors underline underline-offset-4 decoration-gray-700"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
