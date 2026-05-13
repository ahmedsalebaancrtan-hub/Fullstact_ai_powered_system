import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Search, 
  Calendar, 
  ChevronRight, 
  BookOpen,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useQuizStore from '../store/useQuizStore';

export default function HistoryPage() {
  const navigate = useNavigate();
  const { recentQuizzes, fetchQuizzes, isLoading, error, clearError } = useQuizStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const filteredQuizzes = recentQuizzes.filter(quiz => 
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 w-full"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Assessment Library</h1>
          <p className="text-gray-500 font-medium mt-1">Manage, review, and export your AI-generated assessments.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1e3a8a] transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search assessments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all w-full shadow-sm text-md font-medium"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-6">
          <div className="h-14 w-14 border-4 border-blue-50 border-t-[#1e3a8a] rounded-full animate-spin"></div>
          <div className="text-center">
            <p className="text-gray-900 font-black text-xl">Syncing Library</p>
            <p className="text-gray-500 font-medium mt-1 uppercase tracking-[0.2em] text-[10px]">Retrieving your data...</p>
          </div>
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="bg-white rounded-[40px] border-4 border-dashed border-gray-100 p-20 text-center">
          <div className="h-24 w-24 bg-blue-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 transform -rotate-6">
            <BookOpen size={48} className="text-[#1e3a8a]" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">
            {searchTerm ? "No matches found" : "Library is empty"}
          </h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-10 text-lg font-medium">
            {searchTerm ? `We couldn't find any results for "${searchTerm}".` : "You haven't generated any assessments yet. Let's create your first one!"}
          </p>
          {!searchTerm && (
            <button 
              onClick={() => navigate('/upload')}
              className="px-10 py-4 bg-[#1e3a8a] text-white font-black rounded-2xl hover:bg-blue-800 transition-all shadow-2xl shadow-blue-900/20 active:scale-95 flex items-center gap-3 mx-auto"
            >
              <Sparkles size={20} />
              Generate First Assessment
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {filteredQuizzes.map((quiz, index) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all group flex flex-col md:flex-row md:items-center gap-8 cursor-pointer"
              onClick={() => navigate(`/quiz-view/${quiz.id}`)}
            >
              <div className="h-16 w-16 rounded-[24px] bg-blue-50 text-[#1e3a8a] flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-[#1e3a8a] group-hover:text-white transition-all duration-300 shadow-sm">
                <FileText size={32} />
              </div>
              
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-black text-gray-900 truncate group-hover:text-[#1e3a8a] transition-colors">{quiz.title}</h3>
                  <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    quiz.difficulty === 'Hard' ? 'bg-red-50 text-red-600' :
                    quiz.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600' :
                    'bg-emerald-50 text-emerald-600'
                  }`}>
                    {quiz.difficulty}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-300" />
                    <span>{new Date(quiz.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-gray-300" />
                    <span className="uppercase tracking-widest text-[11px]">{quiz.question_type}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 pt-6 md:pt-0 border-t md:border-t-0 border-gray-50">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/quiz-view/${quiz.id}`);
                  }}
                  className="px-6 py-3 bg-gray-50 text-[#1e3a8a] font-black rounded-xl text-sm hover:bg-[#1e3a8a] hover:text-white transition-all flex items-center gap-3 active:scale-95 shadow-sm"
                >
                  <ExternalLink size={18} />
                  <span>Open Assessment</span>
                </button>
                <div className="h-10 w-10 flex items-center justify-center text-gray-300 group-hover:text-[#1e3a8a] group-hover:translate-x-2 transition-all">
                  <ChevronRight size={32} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
