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
    <div className="h-screen w-full bg-[#0a0f1e] font-sans overflow-y-auto overflow-x-hidden relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
      <PublicNavbar />

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] right-[10%] w-[40%] h-[40%] bg-indigo-900/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-[20%] left-[-5%] w-[30%] h-[30%] bg-blue-900/8 rounded-full blur-[120px]" />
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] bg-violet-900/5 rounded-full blur-[160px]" />
      </div>

      {/* Loading overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-[#0a0f1e]/85 backdrop-blur-xl flex flex-col items-center justify-center gap-6"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.3, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl absolute"
            />
            <Loader2 size={56} className="text-[#F8C2A0] animate-spin relative z-10" />
            <p className="text-white font-black uppercase tracking-[0.4em] text-xs relative z-10">
              Initializing Profile
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Form Container */}
      <div className="flex flex-col items-center min-h-[100dvh] w-full pt-28 pb-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[520px] relative z-10"
        >
          {/* Header badge */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest">
              <Users size={13} />
              Student Registration
            </div>
          </div>

          <div className="bg-[#0f172a]/60 backdrop-blur-3xl rounded-[36px] border border-white/5 p-8 md:p-10 shadow-2xl shadow-black/40 w-full">

            <div className="text-center mb-8">
              <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Create Account</h1>
              <p className="text-gray-500 font-medium text-sm leading-relaxed">
                Join your school's learning platform.
              </p>
            </div>

          <form onSubmit={handleRegister} className="space-y-5 w-full">

            {/* Full Name */}
            <Field label="Full Name">
              <IconInput icon={<User size={17} />} disabled={loading}>
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
              <IconInput icon={<Mail size={17} />} disabled={loading}>
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
              <IconInput icon={<Lock size={17} />} disabled={loading} rightEl={
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="text-gray-600 hover:text-white transition-colors pr-1">
                  {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
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
                <div className="mt-2 flex items-center gap-2 px-1">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= pwdStrength ? pwdColors[pwdStrength] : 'bg-white/10'}`} />
                    ))}
                  </div>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider w-14 text-right">
                    {pwdLabels[pwdStrength]}
                  </span>
                </div>
              )}
            </Field>

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Tenant Assignment</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            {/* School Selector */}
            <Field label="Your School">
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-600 group-focus-within:text-indigo-400 transition-colors">
                  <School size={17} />
                </div>
                <select
                  required value={schoolId}
                  onChange={(e) => setSchoolId(e.target.value)}
                  disabled={loading || schoolsLoading}
                  className={`${inputCls} pl-14 appearance-none cursor-pointer`}
                >
                  <option value="" disabled>
                    {schoolsLoading ? 'Loading schools…' : schools.length === 0 ? 'No schools found' : 'Select your school'}
                  </option>
                  {schools.map(s => (
                    <option key={getId(s)} value={getId(s)}>{getName(s)}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-gray-600">
                  {schoolsLoading ? <Loader2 size={15} className="animate-spin" /> : <ChevronDown size={15} />}
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
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <Field label="Your Class">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-600 group-focus-within:text-indigo-400 transition-colors">
                        <Users size={17} />
                      </div>
                      <select
                        required value={classId}
                        onChange={(e) => setClassId(e.target.value)}
                        disabled={loading || classesLoading || classes.length === 0}
                        className={`${inputCls} pl-14 appearance-none cursor-pointer`}
                      >
                        <option value="" disabled>
                          {classesLoading ? 'Loading classes…'
                            : classes.length === 0 ? 'No classes in this school'
                            : 'Select your class'}
                        </option>
                        {classes.map(cls => (
                          <option key={getId(cls)} value={getId(cls)}>{getName(cls)}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-gray-600">
                        {classesLoading ? <Loader2 size={15} className="animate-spin" /> : <ChevronDown size={15} />}
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
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/8 border border-emerald-500/20"
                >
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <p className="text-emerald-300 text-xs font-bold leading-snug">
                    You'll be assigned to&nbsp;
                    <span className="text-emerald-200">{getName(schools.find(s => String(getId(s)) === String(schoolId)))}</span>
                    &nbsp;→&nbsp;
                    <span className="text-emerald-200">{getName(classes.find(c => String(getId(c)) === String(classId)))}</span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Info note */}
            <div className="flex items-start gap-2 px-1">
              <AlertCircle size={13} className="text-gray-600 mt-0.5 shrink-0" />
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Your school and class cannot be changed after registration. Contact your admin if you selected incorrectly.
              </p>
            </div>

            {/* Submit */}
            <motion.button
              type="submit" disabled={loading || !schoolId || !classId}
              whileHover={!loading ? { scale: 1.01 } : {}}
              whileTap={!loading ? { scale: 0.99 } : {}}
              className="w-full py-4 bg-[#F8C2A0] text-[#1e3a8a] font-black text-lg rounded-2xl shadow-xl shadow-black/30 hover:bg-[#f7b58c] transition-all mt-2 flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
              <span>Create Student Account</span>
            </motion.button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-gray-600 font-bold text-xs">
              Already have an account?{' '}
              <button onClick={() => navigate('/login')}
                className="text-gray-400 hover:text-white transition-colors underline underline-offset-4 decoration-gray-700">
                Sign In
              </button>
            </p>
          </div>
        </div>
      </motion.div>
      </div>
    </div>
  );
}

// ---------- Sub-components ----------
function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">
        {label}
      </label>
      {children}
    </div>
  );
}

function IconInput({ icon, children, disabled, rightEl }) {
  return (
    <div className={`relative group transition-opacity ${disabled ? 'opacity-50' : ''}`}>
      <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-600 group-focus-within:text-[#F8C2A0] transition-colors">
        {icon}
      </div>
      {children}
      {rightEl && (
        <div className="absolute inset-y-0 right-5 flex items-center">
          {rightEl}
        </div>
      )}
    </div>
  );
}

const inputCls = "w-full pl-14 pr-6 py-3.5 bg-[#0a0f1e]/70 border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/40 transition-all text-white placeholder:text-gray-700 font-medium text-sm";
