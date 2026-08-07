import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, Eye, EyeOff, Loader2, User,
  School, Users, ChevronDown, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import useAuthStore, { STUDENT_DASHBOARD_PATH } from '../store/useAuthStore';
import PublicNavbar from '../components/PublicNavbar';

// ---------- helpers ----------
const unwrap = (res, fallback = []) => res.data?.data ?? fallback;

const fetchPublicSchools = async () => {
  const res = await api.get('/api/public/schools');
  return unwrap(res);
};

const fetchPublicClasses = async (schoolId) => {
  const res = await api.get(`/api/public/classes?school_id=${schoolId}`);
  return unwrap(res);
};

const getId   = (e) => e?.id  ?? e?.ID;
const getName = (e) => e?.name ?? e?.Name;

// ---------- component ----------
export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  /* form state */
  const [name,        setName]        = useState('');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPwd,     setShowPwd]     = useState(false);
  const [schoolId,    setSchoolId]    = useState('');
  const [classId,     setClassId]     = useState('');
  const [loading,     setLoading]     = useState(false);

  /* tenant data */
  const [schools,        setSchools]        = useState([]);
  const [classes,        setClasses]        = useState([]);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  const [classesLoading, setClassesLoading] = useState(false);

  /* password strength */
  const pwdStrength = password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : 3;
  const pwdLabels   = ['', 'Weak', 'Good', 'Strong'];
  const pwdColors   = ['', 'bg-red-500', 'bg-amber-400', 'bg-emerald-500'];

  /* load schools on mount */
  useEffect(() => {
    fetchPublicSchools()
      .then(setSchools)
      .catch(() => toast.error('Could not load schools. Is the backend running?'))
      .finally(() => setSchoolsLoading(false));
  }, []);

  /* load classes whenever school changes */
  useEffect(() => {
    if (!schoolId) { setClasses([]); setClassId(''); return; }
    setClassesLoading(true);
    setClassId('');
    fetchPublicClasses(schoolId)
      .then(setClasses)
      .catch(() => toast.error('Could not load classes for this school.'))
      .finally(() => setClassesLoading(false));
  }, [schoolId]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (!schoolId)            { toast.error('Please select your school');              return; }
    if (!classId)             { toast.error('Please select your class');               return; }

    setLoading(true);
    const tid = toast.loading('Creating your account…');

    try {
      const res = await api.post('/api/students/register', {
        name,
        email,
        password,
        school_id: Number(schoolId),
        class_id:  Number(classId),
      });

      if (!res.data?.is_success) {
        throw new Error(res.data?.error || res.data?.message || 'Registration failed');
      }

      toast.success('Account created! Signing you in…', { id: tid });

      /* auto-login after successful registration */
      const loginResult = await login(email, password);
      if (loginResult.success) {
        const role = (loginResult.user?.role || loginResult.user?.Role || 'student').toLowerCase();
        const path = role === 'admin'   ? '/admin-dashboard'
                   : role === 'teacher' ? '/teacher-dashboard'
                   : STUDENT_DASHBOARD_PATH;
        setTimeout(() => navigate(path), 600);
      } else {
        toast.success('Account created! Please log in.', { id: tid });
        navigate('/login');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Registration failed';
      toast.error(msg, { id: tid });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#060608] flex font-sans overflow-hidden relative">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[10%] right-[10%] w-[35%] h-[35%] bg-indigo-900/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-[20%] left-[-5%] w-[30%] h-[30%] bg-blue-900/5 rounded-full blur-[120px]" />
      </div>

      {/* Loading overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-[#060608]/85 backdrop-blur-xl flex flex-col items-center justify-center gap-6"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.3, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl absolute"
            />
            <Loader2 size={56} className="text-indigo-400 animate-spin relative z-10" />
            <p className="text-white font-black uppercase tracking-[0.4em] text-xs relative z-10">
              Initializing Profile
            </p>
          </motion.div>
        )}
      </AnimatePresence>

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
          <h2 className="text-4xl font-black text-white leading-tight">Empower Learning with Academic AI.</h2>
          <p className="text-slate-400 font-medium text-sm">Automate question designing, parse textbook materials instantly, and track progress using deep visual analytics.</p>
        </div>
      </div>

      {/* Right Column: Registration Form Scroll Container */}
      <div className="w-full md:w-1/2 h-full flex flex-col justify-start md:justify-center items-center p-6 md:p-12 overflow-y-auto scroll-container relative z-10">
        <div className="absolute top-8 right-8">
          <button 
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 bg-slate-900/50 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-bold rounded-xl transition-all text-sm"
          >
            Sign In
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[440px] pt-16 md:pt-0"
        >
          <div className="bg-slate-900/40 backdrop-blur-xl rounded-[32px] border border-slate-800/80 p-8 md:p-10 shadow-2xl shadow-black/50 w-full">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-wider mb-3">
                <Users size={12} />
                Student Registration
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">Create Account</h1>
              <p className="text-slate-400 font-medium text-xs leading-relaxed mt-1">
                Join your school's learning platform.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4 w-full">
              {/* Full Name */}
              <Field label="Full Name">
                <IconInput icon={<User size={15} />} disabled={loading}>
                  <input
                    type="text" required value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Fatima Hassan"
                    className={inputCls}
                    disabled={loading}
                  />
                </IconInput>
              </Field>

              {/* Email */}
              <Field label="Institutional Email">
                <IconInput icon={<Mail size={15} />} disabled={loading}>
                  <input
                    type="email" required value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@school.edu"
                    className={inputCls}
                    disabled={loading}
                  />
                </IconInput>
              </Field>

              {/* Password */}
              <Field label="Password">
                <IconInput icon={<Lock size={15} />} disabled={loading} rightEl={
                  <button type="button" onClick={() => setShowPwd(v => !v)}
                    className="text-slate-500 hover:text-white transition-colors pr-1">
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }>
                  <input
                    type={showPwd ? 'text' : 'password'} required value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className={inputCls}
                    disabled={loading}
                  />
                </IconInput>
                {/* Strength meter */}
                {password.length > 0 && (
                  <div className="mt-1.5 flex items-center gap-2 px-1">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= pwdStrength ? pwdColors[pwdStrength] : 'bg-white/10'}`} />
                      ))}
                    </div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider w-12 text-right">
                      {pwdLabels[pwdStrength]}
                    </span>
                  </div>
                )}
              </Field>

              {/* Divider */}
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-slate-800/80" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Tenant Assignment</span>
                <div className="flex-1 h-px bg-slate-800/80" />
              </div>

              {/* School Selector */}
              <Field label="Your School">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                    <School size={15} />
                  </div>
                  <select
                    required value={schoolId}
                    onChange={(e) => setSchoolId(e.target.value)}
                    disabled={loading || schoolsLoading}
                    className={`${inputCls} pl-12 appearance-none cursor-pointer`}
                  >
                    <option value="" disabled>
                      {schoolsLoading ? 'Loading schools…' : schools.length === 0 ? 'No schools found' : 'Select your school'}
                    </option>
                    {schools.map(s => (
                      <option key={getId(s)} value={getId(s)} className="bg-slate-900 text-white">{getName(s)}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-4.5 flex items-center pointer-events-none text-slate-500">
                    {schoolsLoading ? <Loader2 size={13} className="animate-spin" /> : <ChevronDown size={13} />}
                  </div>
                </div>
              </Field>

              {/* Class Selector — only shown after school is selected */}
              <AnimatePresence>
                {schoolId && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <Field label="Your Class">
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-4.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                          <Users size={15} />
                        </div>
                        <select
                          required value={classId}
                          onChange={(e) => setClassId(e.target.value)}
                          disabled={loading || classesLoading || classes.length === 0}
                          className={`${inputCls} pl-12 appearance-none cursor-pointer`}
                        >
                          <option value="" disabled>
                            {classesLoading ? 'Loading classes…'
                              : classes.length === 0 ? 'No classes in this school'
                              : 'Select your class'}
                          </option>
                          {classes.map(cls => (
                            <option key={getId(cls)} value={getId(cls)} className="bg-slate-900 text-white">{getName(cls)}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-4.5 flex items-center pointer-events-none text-slate-500">
                          {classesLoading ? <Loader2 size={13} className="animate-spin" /> : <ChevronDown size={13} />}
                        </div>
                      </div>
                    </Field>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tenant confirmation badge */}
              <AnimatePresence>
                {schoolId && classId && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20"
                  >
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                    <p className="text-emerald-300 text-[11px] font-bold leading-snug">
                      Assigned to:&nbsp;
                      <span className="text-emerald-200">{getName(schools.find(s => String(getId(s)) === String(schoolId)))}</span>
                      &nbsp;→&nbsp;
                      <span className="text-emerald-200">{getName(classes.find(c => String(getId(c)) === String(classId)))}</span>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Info note */}
              <div className="flex items-start gap-2 px-1">
                <AlertCircle size={12} className="text-slate-500 mt-0.5 shrink-0" />
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  School and class assignments are locked after registration.
                </p>
              </div>

              {/* Submit */}
              <motion.button
                type="submit" disabled={loading || !schoolId || !classId}
                whileHover={!loading ? { scale: 1.01 } : {}}
                whileTap={!loading ? { scale: 0.99 } : {}}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-sm rounded-xl shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all mt-2 flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                <span>Create Student Account</span>
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ---------- Sub-components ----------
function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
        {label}
      </label>
      {children}
    </div>
  );
}

// Icon input component
function IconInput({ icon, children, disabled, rightEl }) {
  return (
    <div className={`relative group transition-opacity ${disabled ? 'opacity-50' : ''}`}>
      <div className="absolute inset-y-0 left-4.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
        {icon}
      </div>
      {children}
      {rightEl && (
        <div className="absolute inset-y-0 right-4.5 flex items-center">
          {rightEl}
        </div>
      )}
    </div>
  );
}

const inputCls = "w-full pl-12 pr-6 py-3 bg-slate-950/40 border border-slate-800/80 rounded-xl focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-white placeholder:text-slate-600 font-medium text-sm";

