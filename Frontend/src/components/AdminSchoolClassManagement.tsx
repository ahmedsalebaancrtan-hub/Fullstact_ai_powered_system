import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  GraduationCap,
  Layers3,
  Plus,
  RefreshCcw,
  School,
  MapPin,
  Mail,
  Hash,
  ChevronDown,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BarChart3,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { createClass, createSchool, fetchClasses, fetchSchools } from '../api/schools';

// ──── Type Definitions ────────────────────────────────────────────────────────

interface SchoolRecord {
  id?: number;
  ID?: number;
  name?: string;
  Name?: string;
  code?: string;
  Code?: string;
  address?: string;
  Address?: string;
  admin_contact_email?: string;
  AdminContactEmail?: string;
  created_at?: string;
  CreatedAt?: string;
  classes?: ClassRecord[];
  Classes?: ClassRecord[];
}

interface ClassRecord {
  id?: number;
  ID?: number;
  name?: string;
  Name?: string;
  school_id?: number;
  SchoolID?: number;
  school?: SchoolRecord;
  School?: SchoolRecord;
  created_at?: string;
  CreatedAt?: string;
}

interface SchoolFormState {
  name: string;
  code: string;
  address: string;
  adminContactEmail: string;
}

type FormError = Partial<Record<keyof SchoolFormState | 'className' | 'schoolId', string>>;

// ──── Normaliser Helpers ───────────────────────────────────────────────────────

const getId   = (r?: SchoolRecord | ClassRecord | null) => r?.id ?? r?.ID;
const getName = (r?: SchoolRecord | ClassRecord | null): string => r?.name ?? r?.Name ?? 'Untitled';
const getCode = (r?: SchoolRecord | null): string | undefined => r?.code ?? r?.Code;
const getAddress = (r?: SchoolRecord | null): string | undefined => r?.address ?? r?.Address;
const getEmail = (r?: SchoolRecord | null): string | undefined => r?.admin_contact_email ?? r?.AdminContactEmail;
const getSchoolId = (r?: ClassRecord | null) => r?.school_id ?? r?.SchoolID;
const getClassSchool = (r?: ClassRecord | null) => r?.school ?? r?.School;

// ──── Stat Counter Card ───────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  gradient,
  glow,
  borderColor,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  gradient: string;
  glow: string;
  borderColor: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-4 p-5 rounded-2xl bg-slate-900/50 backdrop-blur border ${borderColor} ${glow}`}
    >
      <div className={`h-12 w-12 rounded-2xl ${gradient} flex items-center justify-center shrink-0`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
        <p className="text-3xl font-black text-slate-50 leading-none mt-0.5">{value}</p>
      </div>
    </motion.div>
  );
}

// ──── Field Component ─────────────────────────────────────────────────────────

function Field({
  label,
  icon: Icon,
  error,
  children,
}: {
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
        {Icon && <Icon size={11} className="text-slate-500" />}
        {label}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-1 text-red-400 text-xs font-semibold mt-1.5"
          >
            <AlertCircle size={12} />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputCls =
  'w-full bg-slate-800/60 border border-white/10 rounded-xl py-3.5 px-4 text-slate-50 font-medium placeholder-slate-600 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm';

// ──── Main Component ──────────────────────────────────────────────────────────

export default function AdminSchoolClassManagement() {
  const [schools, setSchools]             = useState<SchoolRecord[]>([]);
  const [classes, setClasses]             = useState<ClassRecord[]>([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [isCreatingSchool, setIsCreatingSchool] = useState(false);
  const [isCreatingClass, setIsCreatingClass]   = useState(false);
  const [expandedSchool, setExpandedSchool]     = useState<string | null>(null);

  // School form
  const [schoolForm, setSchoolForm] = useState<SchoolFormState>({
    name: '',
    code: '',
    address: '',
    adminContactEmail: '',
  });

  // Class form
  const [className, setClassName]         = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState('');

  // Validation errors
  const [schoolErrors, setSchoolErrors]   = useState<FormError>({});
  const [classErrors, setClassErrors]     = useState<FormError>({});

  // ── Data Fetching ─────────────────────────────────────────────────────

  const loadTenantData = async () => {
    setIsLoading(true);
    try {
      const [schoolList, classList] = await Promise.all([fetchSchools(), fetchClasses()]);
      setSchools(schoolList || []);
      setClasses(classList || []);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || error.response?.data?.error || 'Unable to load schools and classes.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTenantData();
  }, []);

  // ── Derived Data ──────────────────────────────────────────────────────

  const schoolsById = useMemo(() => {
    const map = new Map<string, SchoolRecord>();
    schools.forEach((school) => {
      const schoolId = getId(school);
      if (schoolId) map.set(String(schoolId), school);
    });
    classes.forEach((classRecord) => {
      const school = getClassSchool(classRecord);
      const schoolId = getId(school) ?? getSchoolId(classRecord);
      if (!schoolId || map.has(String(schoolId))) return;
      map.set(String(schoolId), school || { id: schoolId, name: `School #${schoolId}` });
    });
    return map;
  }, [classes, schools]);

  const oversightRows = useMemo(() => {
    return Array.from(schoolsById.values()).map((school) => {
      const schoolId = getId(school);
      const schoolClasses = classes.filter(
        (classRecord) => String(getSchoolId(classRecord)) === String(schoolId),
      );
      const embeddedClasses = school.classes ?? school.Classes ?? [];
      const mergedClasses = schoolClasses.length > 0 ? schoolClasses : embeddedClasses;
      return { school, classes: mergedClasses };
    });
  }, [classes, schoolsById]);

  // ── Duplicate Code Check ──────────────────────────────────────────────

  const existingCodes = useMemo(
    () => new Set(schools.map((s) => (getCode(s) || '').toLowerCase())),
    [schools],
  );

  // ── School Form Validation ────────────────────────────────────────────

  const validateSchoolForm = (): boolean => {
    const errors: FormError = {};
    if (!schoolForm.name.trim()) errors.name = 'School name is required.';
    if (!schoolForm.code.trim()) {
      errors.code = 'School code is required.';
    } else if (existingCodes.has(schoolForm.code.trim().toLowerCase())) {
      errors.code = 'This code already exists. Use a unique code.';
    }
    if (!schoolForm.address.trim()) errors.address = 'Address is required.';
    if (!schoolForm.adminContactEmail.trim()) {
      errors.adminContactEmail = 'Admin email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(schoolForm.adminContactEmail)) {
      errors.adminContactEmail = 'Enter a valid email address.';
    }
    setSchoolErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateClassForm = (): boolean => {
    const errors: FormError = {};
    if (!selectedSchoolId) errors.schoolId = 'Select a school.';
    if (!className.trim()) errors.className = 'Class name is required.';
    setClassErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Handlers ──────────────────────────────────────────────────────────

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSchoolForm()) return;

    setIsCreatingSchool(true);
    const toastId = toast.loading('Creating school...');
    try {
      await createSchool({
        name: schoolForm.name.trim(),
        code: schoolForm.code.trim().toUpperCase(),
        address: schoolForm.address.trim(),
        adminContactEmail: schoolForm.adminContactEmail.trim(),
      });
      toast.success('School created successfully!', { id: toastId });
      setSchoolForm({ name: '', code: '', address: '', adminContactEmail: '' });
      setSchoolErrors({});
      await loadTenantData();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || error.response?.data?.error || 'Unable to create school.',
        { id: toastId },
      );
    } finally {
      setIsCreatingSchool(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateClassForm()) return;

    setIsCreatingClass(true);
    const toastId = toast.loading('Creating class...');
    try {
      await createClass({ name: className.trim(), schoolId: selectedSchoolId });
      toast.success('Class created successfully!', { id: toastId });
      setClassName('');
      setClassErrors({});
      await loadTenantData();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || error.response?.data?.error || 'Unable to create class.',
        { id: toastId },
      );
    } finally {
      setIsCreatingClass(false);
    }
  };

  const toggleExpanded = (id: string) =>
    setExpandedSchool((prev) => (prev === id ? null : id));

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <section id="admin-schools" className="scroll-mt-28 space-y-8">

      {/* ── Section Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-indigo-400">
            Tenant Management
          </p>
          <h2 className="mt-2 text-2xl md:text-3xl font-black text-slate-50 tracking-tight flex items-center gap-3">
            <School className="text-indigo-400" size={28} />
            Schools &amp; Classes
          </h2>
          <p className="mt-2 text-sm text-slate-400 font-medium max-w-2xl">
            Create school tenants, attach classes to the correct school, and keep class-targeted quiz
            routing clean and isolated.
          </p>
        </div>
        <button
          type="button"
          onClick={loadTenantData}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-200 font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-50 shrink-0"
        >
          <RefreshCcw size={16} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Live Counter Stats ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          label="Total Schools"
          value={schoolsById.size}
          icon={Building2}
          gradient="bg-gradient-to-br from-indigo-500 to-purple-600"
          glow="shadow-[0_0_18px_rgba(99,102,241,0.22)]"
          borderColor="border-indigo-500/30"
        />
        <StatCard
          label="Total Classes"
          value={classes.length}
          icon={GraduationCap}
          gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          glow="shadow-[0_0_18px_rgba(16,185,129,0.22)]"
          borderColor="border-emerald-500/30"
        />
        <StatCard
          label="Avg Classes / School"
          value={schoolsById.size > 0 ? Math.round(classes.length / schoolsById.size) : 0}
          icon={BarChart3}
          gradient="bg-gradient-to-br from-pink-500 to-rose-600"
          glow="shadow-[0_0_18px_rgba(236,72,153,0.22)]"
          borderColor="border-pink-500/30"
        />
      </div>

      {/* ── Creation Forms Row ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Add School Card */}
        <motion.form
          onSubmit={handleCreateSchool}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[28px] p-7 shadow-[0_0_40px_rgba(0,0,0,0.3)] space-y-5 flex flex-col"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-purple-600/30 text-indigo-300 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Building2 size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-50">Add School</h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Register a new tenant school on the platform.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="School Name" icon={School} error={schoolErrors.name}>
              <input
                type="text"
                value={schoolForm.name}
                onChange={(e) => setSchoolForm({ ...schoolForm, name: e.target.value })}
                className={inputCls}
                placeholder="e.g. Hargeisa High Academy"
              />
            </Field>

            <Field label="School Code / Slug" icon={Hash} error={schoolErrors.code}>
              <input
                type="text"
                value={schoolForm.code}
                onChange={(e) => setSchoolForm({ ...schoolForm, code: e.target.value })}
                className={inputCls}
                placeholder="e.g. HHA-01"
              />
            </Field>
          </div>

          <Field label="Physical Address / Location" icon={MapPin} error={schoolErrors.address}>
            <input
              type="text"
              value={schoolForm.address}
              onChange={(e) => setSchoolForm({ ...schoolForm, address: e.target.value })}
              className={inputCls}
              placeholder="e.g. 14 University Rd, Hargeisa"
            />
          </Field>

          <Field label="Principal / Admin Email" icon={Mail} error={schoolErrors.adminContactEmail}>
            <input
              type="email"
              value={schoolForm.adminContactEmail}
              onChange={(e) => setSchoolForm({ ...schoolForm, adminContactEmail: e.target.value })}
              className={inputCls}
              placeholder="e.g. principal@hha.edu"
            />
          </Field>

          <button
            type="submit"
            disabled={isCreatingSchool}
            className="mt-auto w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-black shadow-[0_0_20px_rgba(99,102,241,0.35)] hover:shadow-[0_0_30px_rgba(99,102,241,0.55)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isCreatingSchool ? (
              <><Loader2 size={18} className="animate-spin" /> Creating...</>
            ) : (
              <><Plus size={18} /> Create School</>
            )}
          </button>
        </motion.form>

        {/* Add Class Card */}
        <motion.form
          onSubmit={handleCreateClass}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.07 }}
          className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[28px] p-7 shadow-[0_0_40px_rgba(0,0,0,0.3)] space-y-5 flex flex-col"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-600/30 text-emerald-300 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <GraduationCap size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-50">Add Class</h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Attach a class to an existing school for quiz targeting.</p>
            </div>
          </div>

          <Field label="Parent School" icon={Building2} error={classErrors.schoolId}>
            <div className="relative">
              <select
                value={selectedSchoolId}
                onChange={(e) => setSelectedSchoolId(e.target.value)}
                className={`${inputCls} appearance-none pr-10`}
              >
                <option value="">— Select a school —</option>
                {Array.from(schoolsById.values()).map((school) => (
                  <option key={getId(school)} value={getId(school)}>
                    {getName(school)}{getCode(school) ? ` (${getCode(school)})` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
          </Field>

          <Field label="Class Name" icon={GraduationCap} error={classErrors.className}>
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className={inputCls}
              placeholder="e.g. Grade 10 — Biology"
            />
          </Field>

          {/* Selected school preview */}
          <AnimatePresence>
            {selectedSchoolId && schoolsById.has(String(selectedSchoolId)) && (() => {
              const school = schoolsById.get(String(selectedSchoolId))!;
              return (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <div className="text-xs text-slate-300 font-medium">
                      <span className="font-black text-emerald-300">{getName(school)}</span>
                      {getAddress(school) && (
                        <span className="text-slate-500 ml-2">· {getAddress(school)}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isCreatingClass}
            className="mt-auto w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-black shadow-[0_0_20px_rgba(16,185,129,0.30)] hover:shadow-[0_0_30px_rgba(16,185,129,0.50)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isCreatingClass ? (
              <><Loader2 size={18} className="animate-spin" /> Creating...</>
            ) : (
              <><Plus size={18} /> Create Class</>
            )}
          </button>
        </motion.form>
      </div>

      {/* ── School Class Map Table ──────────────────────────────────────── */}
      <div className="bg-slate-900/50 backdrop-blur-xl rounded-[28px] border border-white/10 overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.3)]">
        
        {/* Table Header */}
        <div className="p-6 md:p-8 border-b border-white/10 flex items-center justify-between gap-4 flex-wrap">
          <h3 className="text-xl md:text-2xl font-black text-slate-50 tracking-tight flex items-center gap-3">
            <Layers3 className="text-indigo-400" size={24} />
            School Directory
          </h3>
          <div className="flex items-center gap-3">
            <span className="px-4 py-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
              {oversightRows.length} {oversightRows.length === 1 ? 'school' : 'schools'}
            </span>
            <span className="px-4 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
              {classes.length} {classes.length === 1 ? 'class' : 'classes'}
            </span>
          </div>
        </div>

        {/* Table Body */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 size={36} className="text-indigo-400 animate-spin" />
            <p className="text-slate-500 font-semibold text-sm">Loading tenant structure...</p>
          </div>
        ) : oversightRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-5">
            <div className="h-20 w-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
              <School size={36} className="text-slate-600" />
            </div>
            <div className="text-center">
              <p className="text-slate-300 font-black text-xl">No Schools Yet</p>
              <p className="text-slate-500 font-medium text-sm mt-1">
                Create your first school tenant using the form above.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-white/8">
            {oversightRows.map(({ school, classes: rowClasses }, index) => {
              const schoolIdStr = String(getId(school));
              const isExpanded = expandedSchool === schoolIdStr;
              const code    = getCode(school);
              const address = getAddress(school);
              const email   = getEmail(school);

              return (
                <motion.div
                  key={schoolIdStr}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  {/* School Row */}
                  <button
                    type="button"
                    onClick={() => toggleExpanded(schoolIdStr)}
                    className="w-full text-left px-6 md:px-8 py-5 hover:bg-white/4 transition-colors group flex items-start md:items-center gap-4 flex-col md:flex-row"
                  >
                    {/* Avatar */}
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-500/25 to-purple-600/25 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-black text-lg shrink-0">
                      {getName(school).charAt(0).toUpperCase()}
                    </div>

                    {/* School Name + Meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-black text-slate-50 text-base">{getName(school)}</p>
                        {code && (
                          <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 text-[10px] font-black uppercase tracking-wider">
                            {code}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                        {address && (
                          <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                            <MapPin size={11} /> {address}
                          </span>
                        )}
                        {email && (
                          <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                            <Mail size={11} /> {email}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Class count badge */}
                    <div className="flex items-center gap-3 ml-auto shrink-0">
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/6 border border-white/10 text-slate-300 text-xs font-black">
                        <BookOpen size={12} />
                        {rowClasses.length} {rowClasses.length === 1 ? 'class' : 'classes'}
                      </span>
                      <ChevronRight
                        size={18}
                        className={`text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}
                      />
                    </div>
                  </button>

                  {/* Expanded Classes List */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        key="expanded"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 md:px-8 pb-6 pt-2 ml-0 md:ml-15">
                          {rowClasses.length > 0 ? (
                            <div className="flex flex-wrap gap-2.5 pl-0 md:pl-[60px]">
                              {rowClasses.map((classRecord) => (
                                <motion.span
                                  key={`${schoolIdStr}-${getId(classRecord)}`}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-200 border border-emerald-500/20 text-sm font-black"
                                >
                                  <GraduationCap size={13} />
                                  {getName(classRecord)}
                                </motion.span>
                              ))}
                            </div>
                          ) : (
                            <p className="pl-0 md:pl-[60px] text-slate-500 text-sm font-semibold italic">
                              No classes assigned — add one using the form above.
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
