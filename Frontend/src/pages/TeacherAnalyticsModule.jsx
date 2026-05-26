import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Target, 
  Clock, 
  BarChart3,
  Search,
  Download
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function TeacherAnalyticsModule() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/api/analytics/teacher');
        if (response.data.is_success) {
          const { quizzes, results, users } = response.data.data;
          
          // Map relationships
          const mappedData = (results || []).map(res => {
            const student = (users || []).find(u => u.id === res.student_id);
            const quiz = (quizzes || []).find(q => q.id === res.quiz_id);
            
            return {
              id: res.id,
              studentName: student ? student.full_name : 'Unknown Student',
              quizTitle: quiz ? quiz.title : 'Deleted Quiz',
              score: res.score,
              timeSpent: res.time_spent_minutes || 0,
              date: new Date(res.created_at).toLocaleDateString()
            };
          });

          setData(mappedData);
        }
      } catch (error) {
        toast.error("Failed to load analytics data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const filteredData = data.filter(item => 
    item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.quizTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 w-full"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-50 tracking-tight">System Analytics</h1>
          <p className="text-slate-300 font-medium mt-1">Comprehensive overview of student performance across all assessments.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search student or quiz..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-full text-sm text-white focus:outline-none focus:border-indigo-500 w-64 transition-all"
            />
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-500/20 text-indigo-300 rounded-full font-bold border border-indigo-500/30 hover:bg-indigo-500/30 transition-all"
          >
            <Download size={18} />
            Export CSV
          </motion.button>
        </div>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[40px] shadow-[0_0_30px_rgba(0,0,0,0.3)] border border-white/10 overflow-hidden w-full flex flex-col">
        <div className="p-8 border-b border-white/10">
          <h3 className="text-2xl font-black text-slate-50 tracking-tight flex items-center gap-3">
            <BarChart3 className="text-indigo-400" />
            Performance Records
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 text-gray-400 text-[11px] uppercase font-black tracking-[0.2em]">
              <tr>
                <th className="px-8 py-5 text-left">Student Name</th>
                <th className="px-8 py-5 text-left">Assessment Taken</th>
                <th className="px-8 py-5 text-center">Score (%)</th>
                <th className="px-8 py-5 text-center">Time Spent</th>
                <th className="px-8 py-5 text-right">Date Completed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center text-gray-500 font-bold">
                    Loading analytics data...
                  </td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                          <Users size={14} />
                        </div>
                        <span className="font-bold text-slate-50">{row.studentName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-slate-300 font-medium">
                      {row.quizTitle}
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-black ${
                        row.score >= 80 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        row.score >= 60 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {row.score.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center text-slate-400 font-medium flex items-center justify-center gap-2">
                      <Clock size={16} />
                      {row.timeSpent} mins
                    </td>
                    <td className="px-8 py-6 text-right text-gray-500 font-medium text-sm">
                      {row.date}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-16 w-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                        <Target size={32} className="text-slate-500" />
                      </div>
                      <p className="text-slate-400 font-bold text-lg">No records found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
