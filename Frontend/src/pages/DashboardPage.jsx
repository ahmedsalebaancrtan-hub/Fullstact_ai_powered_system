import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  UploadCloud, 
  Plus, 
  ArrowUpRight, 
  ChevronRight,
  BookOpen,
  Sparkles,
  Clock,
  Play
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useQuizStore from '../store/useQuizStore';
import useAuthStore from '../store/useAuthStore';

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { recentQuizzes, myResults, fetchQuizzes, fetchAvailableQuizzes, fetchMyResults, getStats } = useQuizStore();

  // ── RBAC: normalise role once ──────────────────────────────────────────────
  const role = (user?.role || user?.Role || '').toLowerCase();
  const isStudent = role === 'student';
  const isTeacher = role === 'teacher';
  const isAdmin   = role === 'admin';
  const canGenerate = isTeacher || isAdmin; // only teacher / admin may create assessments
  const studentClassId = user?.class_id ?? user?.ClassID;
  // ──────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (isStudent) {
      fetchAvailableQuizzes();
      fetchMyResults();
    } else {
      fetchQuizzes();
    }
  }, [fetchQuizzes, fetchAvailableQuizzes, fetchMyResults, user]);

  const classScopedQuizzes = studentClassId
    ? recentQuizzes.filter((quiz) => String(quiz.class_id ?? quiz.ClassID) === String(studentClassId))
    : recentQuizzes;

  const { totalQuizzes, totalMaterials, recentActivity } = getStats({ recentQuizzes });

  const stats = [
    { label: 'Total Assessments', value: totalQuizzes, icon: FileText, color: 'text-indigo-400', glow: 'border-slate-800/80 hover:border-indigo-500/30', bg: 'bg-indigo-500/10 border-indigo-500/20' },
    { label: 'Materials Processed', value: totalMaterials, icon: UploadCloud, color: 'text-purple-400', glow: 'border-slate-800/80 hover:border-purple-500/30', bg: 'bg-purple-500/10 border-purple-500/20' },
    { label: 'Published Quizzes', value: recentActivity.filter(q => q.status === 'PUBLISHED').length || totalQuizzes, icon: BookOpen, color: 'text-pink-400', glow: 'border-slate-800/80 hover:border-pink-500/30', bg: 'bg-pink-500/10 border-pink-500/20' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 w-full"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-50 tracking-tight">Quiz Overview</h1>
          <p className="text-slate-300 font-medium mt-1">Welcome back. Here's what's happening with your assessments.</p>
        </div>
        {/* Only teachers and admins can create / generate assessments */}
        {canGenerate && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/upload')}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-slate-50 rounded-full font-black shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] border border-white/10 transition-all whitespace-nowrap"
          >
            <Plus size={20} />
            Create New Quiz
          </motion.button>
        )}
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl border ${stat.glow} flex items-center gap-6 group hover:scale-[1.02] transition-all duration-300 shadow-2xl`}
          >
            <div className={`${stat.bg} ${stat.color} p-4 rounded-xl border transition-transform group-hover:scale-110 shadow-inner`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-white">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {isStudent ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {classScopedQuizzes.map((quiz) => (
            <motion.div
              key={quiz.id}
              whileHover={{ y: -5 }}
              className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-800/80 shadow-2xl hover:border-indigo-500/50 hover:shadow-[0_0_25px_rgba(99,102,241,0.15)] transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="h-12 w-12 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl flex items-center justify-center">
                  <FileText size={24} />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                  quiz.difficulty === 'Hard' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  quiz.difficulty === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {quiz.difficulty}
                </span>
              </div>
              
              <h3 className="text-xl font-black text-slate-50 mb-2 relative z-10 line-clamp-2">{quiz.title}</h3>
              {(quiz.class?.name || quiz.Class?.Name) && (
                <p className="text-xs font-black text-indigo-200/80 uppercase tracking-widest mb-4 relative z-10">
                  {quiz.class?.name || quiz.Class?.Name}
                </p>
              )}
              
              <div className="flex items-center gap-4 text-slate-400 font-medium text-sm mb-8 relative z-10">
                <div className="flex items-center gap-1.5 text-indigo-300">
                  <Clock size={16} className="drop-shadow-[0_0_5px_rgba(165,180,252,0.8)]" />
                  <span>{quiz.time_limit_minutes || 30} Minutes</span>
                </div>
                <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                <span>{quiz.total_questions || quiz.Questions?.length || 0} Questions</span>
              </div>
              
              {(() => {
                const isCompleted = myResults?.some(res => res.quiz_id === quiz.id);
                if (isCompleted) {
                  return (
                    <button
                      disabled
                      className="w-full py-3.5 bg-slate-800/50 text-slate-400 font-black rounded-xl border border-slate-700/50 flex items-center justify-center gap-2 relative z-10 cursor-not-allowed"
                    >
                      <span>Completed</span>
                    </button>
                  );
                }
                return (
                  <button
                    onClick={() => navigate(`/active-quiz/${quiz.id}`)}
                    className="w-full py-3.5 bg-white/5 hover:bg-indigo-600 text-indigo-300 hover:text-white font-black rounded-xl border border-white/10 hover:border-indigo-500 transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] relative z-10"
                  >
                    <span>Start Assessment</span>
                    <Play size={16} className="fill-current" />
                  </button>
                );
              })()}
            </motion.div>
          ))}
          {classScopedQuizzes.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="h-16 w-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen size={32} className="text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-300">No Assessments Available</h3>
              <p className="text-slate-500 mt-2">Check back later for new quizzes assigned by your teacher.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Primary Action Card */}
          <div className="lg:col-span-1 h-full">
            <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-8 text-slate-50 border border-slate-800/80 relative overflow-hidden h-full shadow-2xl flex flex-col justify-between group hover:border-indigo-500/30 transition-all duration-300">
              <div className="relative z-10 space-y-6">
                <div className="h-14 w-14 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles size={28} className="text-indigo-400" />
                </div>
                <h3 className="text-2xl font-black mb-4 leading-tight tracking-tight text-white">AI-Powered Pedagogical Excellence</h3>
                <p className="text-slate-300 font-medium opacity-90 text-md leading-relaxed">Transform your course materials into professional-grade assessments in seconds using Gemini 3.</p>
              </div>
              
              <div className="relative z-10 mt-12">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/upload')}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-md rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-indigo-600/20 border border-white/5"
                >
                  <span>Generate Assessment</span>
                  <ChevronRight size={20} />
                </motion.button>
              </div>

              {/* Decorative background circle */}
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px]"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2"></div>
            </div>
          </div>

          {/* Recent Activity Table */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800/80 overflow-hidden h-full flex flex-col">
              <div className="p-8 border-b border-slate-800/80 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">Recent Activity</h3>
                  <p className="text-slate-400 text-xs font-medium mt-0.5">Your most recently generated assessments.</p>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/history')}
                  className="text-xs font-black text-indigo-300 hover:text-indigo-200 flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2.5 rounded-full transition-all"
                >
                  View Library <ArrowUpRight size={14} />
                </motion.button>
              </div>
              
              <div className="overflow-x-auto flex-1">
                <table className="w-full">
                  <thead className="bg-slate-950/40 border-b border-slate-800/60 text-slate-400 text-[10px] uppercase font-black tracking-[0.2em]">
                    <tr>
                      <th className="px-8 py-5 text-left">Assessment Title</th>
                      <th className="px-8 py-5 text-left">Generated On</th>
                      <th className="px-8 py-5 text-left">Difficulty</th>
                      <th className="px-8 py-5 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {recentActivity.map((quiz) => (
                      <tr key={quiz.id} className="hover:bg-slate-900/30 transition-colors group cursor-pointer" onClick={() => navigate(`/quiz-view/${quiz.id}`)}>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center transition-transform group-hover:scale-110 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                              <FileText size={18} />
                            </div>
                            <span className="text-sm font-bold text-slate-100">{quiz.title}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-xs font-medium text-slate-400">
                          {new Date(quiz.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            quiz.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            quiz.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                            {quiz.difficulty}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="p-2 text-slate-400 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all inline-block">
                            <ChevronRight size={20} />
                          </div>
                        </td>
                      </tr>
                    ))}
                    {recentActivity.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-8 py-20 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="h-16 w-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                              <FileText size={32} className="text-slate-500" />
                            </div>
                            <p className="text-slate-400 font-bold text-lg">No assessments found.</p>
                            <button 
                              onClick={() => navigate('/upload')}
                              className="text-indigo-400 font-black text-sm hover:underline"
                            >
                              Generate your first quiz now
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
