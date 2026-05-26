import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import PublicNavbar from '../components/PublicNavbar';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const login = useAuthStore((state) => state.login);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (token && user) {
      if (user.role?.toLowerCase() === 'admin' || user.Role?.toLowerCase() === 'admin') {
        navigate('/admin-dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [token, user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const loadingToast = toast.loading("Verifying Account...");

    const result = await login(email, password);
    
    if (result.success) {
      toast.success("Welcome back", { id: loadingToast });
      const user = useAuthStore.getState().user;
      setTimeout(() => {
        if (user && (user.role?.toLowerCase() === 'admin' || user.Role?.toLowerCase() === 'admin')) {
          navigate('/admin-dashboard');
        } else {
          navigate('/dashboard');
        }
      }, 800);
    } else {
      toast.error(result.message, { id: loadingToast });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e1b4b] flex flex-col items-center justify-center font-sans overflow-y-auto relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] py-24 px-4">
      <PublicNavbar />

      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[10%] right-[5%] w-[30%] h-[30%] bg-purple-600/10 rounded-full blur-[120px]"></div>
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
            <p className="text-white font-black uppercase tracking-[0.5em] text-xs">Authenticating Profile</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[500px] px-6 relative z-10"
      >
        <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[40px] border border-white/10 p-10 shadow-[0_0_40px_rgba(0,0,0,0.5)] w-full">
          
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-slate-50 mb-3 tracking-tight">Quiz Login</h1>
            <p className="text-slate-300 font-medium text-sm max-w-[280px] mx-auto leading-relaxed">
              Secure access to your pedagogical workspace.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8 w-full">
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Enter Email</label>
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
                  className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-slate-50 placeholder:text-slate-400 font-medium text-md"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">enter Password</label>
                <button type="button" className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors">Recover Key?</button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 transition-colors group-focus-within:text-indigo-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-14 pr-14 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-slate-50 placeholder:text-slate-400 font-medium text-md"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-5 flex items-center text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <motion.button 
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{ 
                boxShadow: ["0px 0px 0px rgba(99,102,241,0)", "0px 0px 20px rgba(99,102,241,0.5)", "0px 0px 0px rgba(99,102,241,0)"]
              }}
              transition={{ boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" } }}
              className="w-full py-4.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-slate-50 font-black text-xl rounded-full shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all mt-4 flex items-center justify-center gap-3 disabled:opacity-50 border border-white/10"
            >
              <span>Sign In</span>
            </motion.button>
          </form>

          <div className="mt-10 pt-6 border-t border-white/10 text-center">
            <p className="text-slate-400 font-bold text-xs">
              New Researcher? {' '}
              <button 
                onClick={() => navigate('/register')}
                className="text-indigo-300 hover:text-indigo-200 transition-colors underline underline-offset-4 decoration-indigo-500/50"
              >
                Create Account
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
