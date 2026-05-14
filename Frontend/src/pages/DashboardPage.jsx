import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  UploadCloud, 
  Plus, 
  ArrowUpRight, 
  ChevronRight,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useQuizStore from '../store/useQuizStore';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { recentQuizzes, fetchQuizzes, getStats } = useQuizStore();

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const { totalQuizzes, totalMaterials, recentActivity } = getStats({ recentQuizzes });

  const stats = [
    { label: 'Total Assessments', value: totalQuizzes, icon: FileText, color: 'bg-indigo-600', shadow: 'shadow-indigo-900/20' },
    { label: 'Materials Processed', value: totalMaterials, icon: UploadCloud, color: 'bg-blue-600', shadow: 'shadow-blue-900/20' },
    { label: 'Published Quizzes', value: recentActivity.filter(q => q.status === 'PUBLISHED').length || totalQuizzes, icon: BookOpen, color: 'bg-[#F8C2A0]', shadow: 'shadow-orange-900/20', textColor: 'text-[#1e3a8a]' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 w-full"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Quiz Overview</h1>
          <p className="text-gray-400 font-medium mt-1">Welcome back. Here's what's happening with your assessments.</p>
        </div>
        <button 
          onClick={() => navigate('/upload')}
          className="flex items-center gap-3 px-8 py-4 bg-[#F8C2A0] text-[#1e3a8a] rounded-2xl font-black shadow-xl shadow-[#F8C2A0]/20 hover:bg-[#f7b58c] transition-all active:scale-95 whitespace-nowrap"
        >
          <Plus size={20} />
          Create New Quiz
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-800/40 backdrop-blur-md p-8 rounded-[32px] shadow-sm border border-white/5 flex items-center gap-6 group hover:shadow-md transition-shadow"
          >
            <div className={`${stat.color} ${stat.textColor || 'text-white'} p-4 rounded-2xl ${stat.shadow} transition-transform group-hover:scale-110`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-white">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Primary Action Card */}
        <div className="lg:col-span-1 h-full">
          <div className="bg-[#0a0f1e] rounded-[40px] p-10 text-white border border-white/5 relative overflow-hidden h-full shadow-2xl shadow-black/20 flex flex-col justify-between">
            <div className="relative z-10 space-y-6">
              <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center">
                <Sparkles size={28} className="text-[#F8C2A0]" />
              </div>
              <h3 className="text-3xl font-black mb-4 leading-tight tracking-tight">AI-Powered Pedagogical Excellence</h3>
              <p className="text-blue-100 font-medium opacity-80 text-lg leading-relaxed">Transform your course materials into professional-grade assessments in seconds using Gemini 3.</p>
            </div>
            
            <div className="relative z-10 mt-12">
              <button 
                onClick={() => navigate('/upload')}
                className="w-full py-5 bg-[#F8C2A0] text-gray-900 font-black text-lg rounded-2xl flex items-center justify-center gap-3 hover:bg-[#f7b58c] transition-all transform hover:-translate-y-1 shadow-xl shadow-orange-900/20 active:translate-y-0"
              >
                <span>Generate Assessment</span>
                <ChevronRight size={22} />
              </button>
            </div>

            {/* Decorative background circle */}
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800/40 backdrop-blur-md rounded-[40px] shadow-sm border border-white/5 overflow-hidden h-full flex flex-col">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">Recent Activity</h3>
                <p className="text-gray-400 text-sm font-medium mt-0.5">Your most recently generated assessments.</p>
              </div>
              <button 
                onClick={() => navigate('/history')}
                className="text-sm font-black text-indigo-300 hover:text-indigo-200 flex items-center gap-2 bg-indigo-900/30 px-5 py-2.5 rounded-xl transition-all active:scale-95"
              >
                View Library <ArrowUpRight size={16} />
              </button>
            </div>
            
            <div className="overflow-x-auto flex-1">
              <table className="w-full">
                <thead className="bg-white/5 text-gray-500 text-[10px] uppercase font-black tracking-[0.2em]">
                  <tr>
                    <th className="px-8 py-5 text-left">Assessment Title</th>
                    <th className="px-8 py-5 text-left">Generated On</th>
                    <th className="px-8 py-5 text-left">Difficulty</th>
                    <th className="px-8 py-5 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentActivity.map((quiz) => (
                    <tr key={quiz.id} className="hover:bg-slate-800/60 transition-colors group cursor-pointer" onClick={() => navigate(`/quiz-view/${quiz.id}`)}>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-indigo-900/30 text-indigo-400 flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm">
                            <FileText size={20} />
                          </div>
                          <span className="text-md font-bold text-white">{quiz.title}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm font-medium text-gray-500">
                        {new Date(quiz.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          quiz.difficulty === 'Hard' ? 'bg-red-50 text-red-600' :
                          quiz.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600' :
                          'bg-emerald-50 text-emerald-600'
                        }`}>
                          {quiz.difficulty}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="p-2 text-gray-300 group-hover:text-[#1e3a8a] group-hover:translate-x-1 transition-all inline-block">
                          <ChevronRight size={24} />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {recentActivity.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="h-16 w-16 bg-slate-800/60 rounded-2xl flex items-center justify-center">
                            <FileText size={32} className="text-slate-600" />
                          </div>
                          <p className="text-gray-400 font-bold text-lg">No assessments found.</p>
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
    </motion.div>
  );
}
