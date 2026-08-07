import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import PublicNavbar from '../components/PublicNavbar';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, token, user, resolveDashboardPath } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (token && user) {
      navigate(resolveDashboardPath(user), { replace: true });
    }
  }, [token, user, resolveDashboardPath, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    const loadingToast = toast.loading('Verifying account...');

    try {
      const result = await login(email, password);

      if (result.success) {
        toast.success('Welcome back', { id: loadingToast });
        const path = result.redirectPath || resolveDashboardPath(result.user);
        navigate(path, { replace: true });
        return;
      }

      toast.error(result.message || 'Login failed', { id: loadingToast });
    } catch (err) {
      console.error('Login handler error:', err);
      toast.error('Something went wrong. Please try again.', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#060608] flex font-sans overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[20%] left-[60%] w-[35%] h-[35%] bg-indigo-500/5 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[10%] right-[5%] w-[30%] h-[30%] bg-purple-600/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Left Column: Visual AI Banner */}
      <div className="relative hidden md:flex md:w-1/2 h-full flex-col justify-between p-12 overflow-hidden bg-gradient-to-b from-indigo-950/10 to-purple-950/10 border-r border-slate-900/60 z-10">
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/ai_thematic_graphic.png" 
            alt="Futuristic AI Illustration" 
            className="w-full h-full object-cover opacity-80" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-[#060608]/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#060608]/90"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <span className="text-white font-black text-xl">A</span>
            </div>
            <span className="font-black text-lg text-white tracking-tight uppercase">QUIZ <span className="text-indigo-400">GENERATOR</span></span>
          </div>
        </div>

        <div className="relative z-10 space-y-4 max-w-md">
          <h2 className="text-4xl font-black text-white leading-tight">QUIZ AI GENERATOR USING LARGE LANGUAGE MODELS.</h2>
          <p className="text-slate-400 font-medium text-sm">Deep semantic assessment generation, automated question styling, and real-time student activity logging.</p>
        </div>
      </div>

      {/* Right Column: Credentials Panel */}
      <div className="w-full md:w-1/2 h-full flex flex-col justify-center items-center p-6 md:p-12 overflow-y-auto scroll-container relative z-10">
        <div className="absolute top-8 right-8">
          <button 
            onClick={() => navigate('/register')}
            className="px-6 py-2.5 bg-slate-900/50 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-bold rounded-xl transition-all text-sm"
          >
            Create Account
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-[440px]"
        >
          <div className="bg-slate-900/40 backdrop-blur-xl rounded-[32px] border border-slate-800/80 p-8 md:p-10 shadow-2xl shadow-black/50 w-full">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-black text-white mb-2 tracking-tight">Quiz Login</h1>
              <p className="text-slate-400 font-medium text-sm leading-relaxed">
                Secure access to your pedagogical workspace.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6 w-full">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Enter Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4.5 flex items-center pointer-events-none text-slate-500 transition-colors group-focus-within:text-indigo-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@university.edu"
                    className="w-full pl-12 pr-6 py-3.5 bg-slate-950/40 border border-slate-800/80 rounded-xl focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-white placeholder:text-slate-600 font-medium text-sm"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">enter Password</label>
                  <button type="button" className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors">Recover Key?</button>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4.5 flex items-center pointer-events-none text-slate-500 transition-colors group-focus-within:text-indigo-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-950/40 border border-slate-800/80 rounded-xl focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-white placeholder:text-slate-600 font-medium text-sm"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-4.5 flex items-center text-slate-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <motion.button 
                type="submit"
                disabled={loading}
                whileHover={loading ? {} : { scale: 1.01 }}
                whileTap={loading ? {} : { scale: 0.99 }}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-md rounded-xl shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all mt-4 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed border border-white/5"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
