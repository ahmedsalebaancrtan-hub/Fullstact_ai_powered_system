import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  X,
  Mail,
  User,
  Lock,
  Search,
  ShieldCheck,
  GraduationCap,
  FileText,
  Activity,
  Trash2,
  Edit2,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import RoleGuard from '../components/RoleGuard';

interface Teacher {
  id: number;
  full_name: string;
  email: string;
  role?: string;
  Role?: string;
}

interface Stats {
  students: number;
  teachers: number;
  quizzes: number;
}

interface ActivityLog {
  id: string;
  type: 'quiz' | 'result' | 'user';
  title: string;
  description: string;
  timestamp: string;
}

export default function AdminDashboard() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Stats state
  const [stats, setStats] = useState<Stats>({
    students: 0,
    teachers: 0,
    quizzes: 0
  });

  // Recent system activity logs state
  const [recentActivities, setRecentActivities] = useState<ActivityLog[]>([]);

  // Modal form states for registering teacher
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Edit teacher modal states
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isEditingSubmitting, setIsEditingSubmitting] = useState<boolean>(false);

  // Comprehensive fetch for dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [teachersRes, overviewRes] = await Promise.all([
        api.get('/api/admin/teachers'),
        api.get('/api/quiz/system-overview')
      ]);

      if (teachersRes.data.is_success) {
        setTeachers(teachersRes.data.data || []);
      }

      if (overviewRes.data.is_success) {
        const overview = overviewRes.data.data || {};
        const allUsers = (overview.users || []) as any[];
        const quizzesList = (overview.quizzes || []) as any[];
        const resultsList = (overview.results || []) as any[];

        // Compute system stats dynamically
        const studentsCount = allUsers.filter(u => (u.role || u.Role || '').toLowerCase() === 'student').length;
        const teachersCount = allUsers.filter(u => (u.role || u.Role || '').toLowerCase() === 'teacher').length;
        const quizzesCount = quizzesList.length;

        setStats({
          students: studentsCount,
          teachers: teachersCount,
          quizzes: quizzesCount
        });

        // Virtual Audit Logs generation
        const activities: ActivityLog[] = [];

        // 1. Quizzes Generated
        quizzesList.forEach(q => {
          activities.push({
            id: `quiz-${q.id}`,
            type: 'quiz',
            title: 'Quiz Generated',
            description: `Quiz "${q.title}" (${q.difficulty}) was generated.`,
            timestamp: q.created_at || new Date().toISOString()
          });
        });

        // 2. Quiz Submissions
        resultsList.forEach(r => {
          const student = allUsers.find(u => u.id === r.student_id);
          const studentName = student ? student.full_name : `Student #${r.student_id}`;
          const quiz = quizzesList.find(q => q.id === r.quiz_id);
          const quizTitle = quiz ? quiz.title : `Quiz #${r.quiz_id}`;

          activities.push({
            id: `result-${r.id}`,
            type: 'result',
            title: 'Quiz Submitted',
            description: `${studentName} completed "${quizTitle}" and scored ${r.score.toFixed(1)}%.`,
            timestamp: r.created_at || new Date().toISOString()
          });
        });

        // 3. System registrations
        allUsers.forEach(u => {
          const roleLabel = (u.role || u.Role || 'user').toUpperCase();
          activities.push({
            id: `user-${u.id}`,
            type: 'user',
            title: 'User Registered',
            description: `${u.full_name} registered as ${roleLabel}.`,
            timestamp: u.created_at || new Date().toISOString()
          });
        });

        // Sort chronologically desc
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setRecentActivities(activities.slice(0, 10)); // keep top 10
      }
    } catch (error) {
      toast.error('Failed to load system overview stats.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // REGISTER TEACHER
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill all fields');
      return;
    }
    
    setIsSubmitting(true);
    const loadingToast = toast.loading('Registering teacher...');
    
    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
    };

    try {
      const response = await api.post('/api/admin/create-teacher', payload);
      if (response.data.is_success) {
        toast.success('Teacher registered successfully!', { id: loadingToast });
        setShowModal(false);
        setFormData({ name: '', email: '', password: '' });
        fetchDashboardData();
      } else {
        toast.error(response.data.message || 'Registration failed', { id: loadingToast });
      }
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.response?.data?.error || 'Registration failed';
      toast.error(errMsg, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  // EDIT TEACHER MODAL OPEN TRIGGER
  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setEditFormData({
      name: teacher.full_name || '',
      email: teacher.email || '',
      password: ''
    });
    setShowEditModal(true);
  };

  // UPDATE TEACHER
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;
    if (!editFormData.name || !editFormData.email) {
      toast.error('Please provide name and email');
      return;
    }

    setIsEditingSubmitting(true);
    const loadingToast = toast.loading('Updating teacher profile...');

    const payload: any = {
      name: editFormData.name,
      email: editFormData.email
    };
    if (editFormData.password) {
      payload.password = editFormData.password;
    }

    try {
      // Direct integration with backend PUT routes: support teachers alias
      const response = await api.put(`/api/admin/teachers/${editingTeacher.id}`, payload);
      if (response.data.is_success) {
        toast.success('Teacher profile updated!', { id: loadingToast });
        setShowEditModal(false);
        fetchDashboardData();
      } else {
        toast.error(response.data.message || 'Update failed', { id: loadingToast });
      }
    } catch (error: any) {
      const errMsg = error.response?.data?.message || 'Update failed';
      toast.error(errMsg, { id: loadingToast });
    } finally {
      setIsEditingSubmitting(false);
    }
  };

  // DELETE TEACHER EXECUTE DIRECTLY
  const handleDelete = async (teacher: Teacher) => {
    const isConfirmed = window.confirm(`Are you absolutely sure you want to remove ${teacher.full_name}? This action is permanent.`);
    if (!isConfirmed) return;

    const loadingToast = toast.loading('Removing teacher account...');

    try {
      // Direct integration with backend DELETE routes: support teachers alias
      const response = await api.delete(`/api/admin/teachers/${teacher.id}`);
      if (response.data.is_success) {
        toast.success('Teacher successfully removed!', { id: loadingToast });
        fetchDashboardData();
      } else {
        toast.error(response.data.message || 'Deletion failed', { id: loadingToast });
      }
    } catch (error: any) {
      const errMsg = error.response?.data?.message || 'Deletion failed';
      toast.error(errMsg, { id: loadingToast });
    }
  };

  const filteredTeachers = teachers.filter(t => 
    (t.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (t.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-slate-950 text-slate-50">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-10 relative z-10 scrollbar-thin"
      >
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-50 tracking-tight flex items-center gap-3 bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            <ShieldCheck className="text-indigo-400" size={38} />
            Command Center
          </h1>
          <p className="text-slate-300 font-medium mt-1">Superuser monitoring, teacher administrative operations, and virtual system audit logs.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search teachers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-full text-sm text-white focus:outline-none focus:border-indigo-500 w-full sm:w-64 transition-all"
            />
          </div>
          <RoleGuard allowedRoles={['admin']}>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-slate-50 rounded-full font-black shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] border border-white/10 transition-all whitespace-nowrap"
            >
              <Plus size={18} />
              Register New Teacher
            </motion.button>
          </RoleGuard>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Students Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="relative bg-gradient-to-br from-indigo-900/30 via-slate-900/40 to-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-white/10 overflow-hidden group shadow-lg"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-2xl">
              <GraduationCap size={24} />
            </div>
            <div>
              <p className="text-slate-400 font-bold uppercase tracking-wider text-xs">Total Students</p>
              <h3 className="text-3xl font-black text-white mt-1">
                {loading ? '...' : stats.students}
              </h3>
            </div>
          </div>
        </motion.div>

        {/* Total Teachers Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="relative bg-gradient-to-br from-purple-900/30 via-slate-900/40 to-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-white/10 overflow-hidden group shadow-lg"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-2xl">
              <Users size={24} />
            </div>
            <div>
              <p className="text-slate-400 font-bold uppercase tracking-wider text-xs">Active Teachers</p>
              <h3 className="text-3xl font-black text-white mt-1">
                {loading ? '...' : stats.teachers}
              </h3>
            </div>
          </div>
        </motion.div>

        {/* Total Quizzes Generated */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="relative bg-gradient-to-br from-emerald-900/30 via-slate-900/40 to-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-white/10 overflow-hidden group shadow-lg"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-2xl">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-slate-400 font-bold uppercase tracking-wider text-xs">Quizzes Generated</p>
              <h3 className="text-3xl font-black text-white mt-1">
                {loading ? '...' : stats.quizzes}
              </h3>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Grid Layout Partitioning - 2/3 for directory, 1/3 for audit log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Educator Directory (2/3 col-span) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[32px] shadow-[0_0_30px_rgba(0,0,0,0.3)] border border-white/10 overflow-hidden flex flex-col">
            <div className="p-8 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-50 tracking-tight flex items-center gap-3">
                <Users className="text-indigo-400" />
                Educator Directory
              </h3>
              <span className="px-4 py-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
                Platform: {teachers.length}
              </span>
            </div>
            
            {/* Scrollable container for directory table to prevent pushing content offscreen */}
            <div className="overflow-y-auto overflow-x-auto max-h-[500px] scrollbar-thin">
              <table className="w-full">
                <thead className="bg-white/5 text-gray-400 text-[11px] uppercase font-black tracking-[0.2em] sticky top-0 backdrop-blur-md z-20">
                  <tr>
                    <th className="px-8 py-5 text-left">Teacher Name</th>
                    <th className="px-8 py-5 text-left font-black">Email Address</th>
                    <th className="px-8 py-5 text-center">Status</th>
                    <RoleGuard allowedRoles={['admin']}>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </RoleGuard>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center text-gray-500 font-bold">
                        Loading educator data...
                      </td>
                    </tr>
                  ) : filteredTeachers.length > 0 ? (
                    filteredTeachers.map((teacher, idx) => (
                      <tr key={teacher.id || idx} className="hover:bg-white/5 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-black">
                              {teacher.full_name ? teacher.full_name.charAt(0).toUpperCase() : 'T'}
                            </div>
                            <span className="font-bold text-slate-50 text-base">{teacher.full_name}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-slate-300 font-medium">
                          {teacher.email}
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-black uppercase tracking-widest">
                            Active
                          </span>
                        </td>
                        <RoleGuard allowedRoles={['admin']}>
                          <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleEdit(teacher)}
                                className="p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 hover:border-indigo-500/30 rounded-lg transition-all"
                                title="Edit Teacher Account"
                              >
                                <Edit2 size={16} />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDelete(teacher)}
                                className="p-2 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 rounded-lg transition-all"
                                title="Delete Teacher Account"
                              >
                                <Trash2 size={16} />
                              </motion.button>
                            </div>
                          </td>
                        </RoleGuard>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="h-16 w-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                            <Users size={32} className="text-slate-500" />
                          </div>
                          <p className="text-slate-400 font-bold text-lg">No educators registered.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Virtual Audit Logs (1/3 col-span) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[32px] border border-white/10 overflow-hidden shadow-lg p-6 flex flex-col h-full">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
              <Activity className="text-indigo-400" size={22} />
              <h3 className="text-xl font-black text-white tracking-tight">System Audit Stream</h3>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 max-h-[500px] pr-2 scrollbar-thin">
              {loading ? (
                <div className="text-center py-20 text-slate-500 font-medium">
                  Loading stream...
                </div>
              ) : recentActivities.length > 0 ? (
                recentActivities.map((act) => (
                  <div 
                    key={act.id} 
                    className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-1.5 transition-all hover:bg-white/10 relative overflow-hidden"
                  >
                    {/* Activity Type Left Highlight Border */}
                    <div className={`absolute top-0 bottom-0 left-0 w-1 ${
                      act.type === 'user' ? 'bg-purple-500' :
                      act.type === 'quiz' ? 'bg-indigo-500' : 'bg-emerald-500'
                    }`}></div>

                    <div className="flex items-center justify-between pl-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        act.type === 'user' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                        act.type === 'quiz' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 
                        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {act.type}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-slate-100 pl-2 mt-0.5">{act.title}</p>
                    <p className="text-xs text-slate-400 font-medium pl-2 leading-relaxed">{act.description}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 text-slate-500">
                  No system activity logged.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* --- Modals & Overlays --- */}

      {/* 1. Register Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 border border-indigo-500/30 rounded-[32px] shadow-[0_0_50px_rgba(79,70,229,0.3)] overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="relative z-10 p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-slate-50 tracking-tight">Register Teacher</h2>
                    <p className="text-slate-400 text-sm mt-1">Create a new platform educator account.</p>
                  </div>
                  <button 
                    onClick={() => setShowModal(false)}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <form onSubmit={handleRegister} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-slate-800/50 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-slate-50 font-medium placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-slate-800/50 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-slate-50 font-medium placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        placeholder="teacher@school.edu"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Temporary Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input 
                        type="password" 
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="w-full bg-slate-800/50 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-slate-50 font-medium placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        placeholder="••••••••"
                        required
                        minLength={8}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-black text-lg shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Registering...' : 'Create Account'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Edit Modal */}
      <AnimatePresence>
        {showEditModal && editingTeacher && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowEditModal(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 border border-indigo-500/30 rounded-[32px] shadow-[0_0_50px_rgba(79,70,229,0.3)] overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="relative z-10 p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-slate-50 tracking-tight">Edit Teacher</h2>
                    <p className="text-slate-400 text-sm mt-1">Update registration parameters for {editingTeacher.full_name}.</p>
                  </div>
                  <button 
                    onClick={() => setShowEditModal(false)}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <form onSubmit={handleUpdate} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input 
                        type="text" 
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                        className="w-full bg-slate-800/50 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-slate-50 font-medium placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input 
                        type="email" 
                        value={editFormData.email}
                        onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                        className="w-full bg-slate-800/50 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-slate-50 font-medium placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        placeholder="teacher@school.edu"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Reset Password (Optional)</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input 
                        type="password" 
                        value={editFormData.password}
                        onChange={(e) => setEditFormData({...editFormData, password: e.target.value})}
                        className="w-full bg-slate-800/50 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-slate-50 font-medium placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        placeholder="Leave blank to keep current"
                        minLength={8}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <button 
                      type="submit"
                      disabled={isEditingSubmitting}
                      className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-black text-lg shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isEditingSubmitting ? 'Updating...' : 'Save Profile Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      </motion.div>
    </div>
  );
}
