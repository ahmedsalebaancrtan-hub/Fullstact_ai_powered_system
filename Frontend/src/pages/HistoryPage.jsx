import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Search,
  Calendar,
  ChevronRight,
  BookOpen,
  Sparkles,
  ExternalLink,
  ClipboardList,
  Trophy,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useQuizStore from '../store/useQuizStore';
import useAuthStore from '../store/useAuthStore';

// ─────────────────────────────────────────────────────────────────────────────
// Score badge helper
// ─────────────────────────────────────────────────────────────────────────────
function ScoreBadge({ score }) {
  const pct = Math.round(score ?? 0);
  const colour =
    pct >= 80
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      : pct >= 60
      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      : 'bg-red-500/10 text-red-400 border-red-500/20';
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-black border uppercase tracking-widest ${colour}`}>
      {pct}%
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Student Results View
// Renders myResults — each row is a QuizResult with an embedded Quiz object.
// ─────────────────────────────────────────────────────────────────────────────
function StudentResultsView({ myResults, isLoading, searchTerm }) {
  const filtered = myResults.filter((r) => {
    const title = (r.quiz?.title || r.quiz?.Title || '').toLowerCase();
    return title.includes(searchTerm.toLowerCase());
  });

  if (isLoading) return <LoadingSpinner label="Loading your results…" />;

  if (filtered.length === 0) {
    return (
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800/80 border-dashed p-20 text-center">
        <div className="h-24 w-24 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
          <ClipboardList size={48} className="text-emerald-400" />
        </div>
        <h3 className="text-2xl font-black text-white mb-3 tracking-tight">
          {searchTerm ? 'No matches found' : 'No results yet'}
        </h3>
        <p className="text-slate-400 max-w-sm mx-auto text-lg font-medium">
          {searchTerm
            ? `No results match "${searchTerm}".`
            : "You haven't completed any assessments yet. Take a quiz to see your results here!"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5">
      {filtered.map((result, index) => {
        const quiz      = result.quiz || {};
        const title     = quiz.title || quiz.Title || `Quiz #${result.quiz_id}`;
        const difficulty= quiz.difficulty || quiz.Difficulty || '—';
        const score     = Math.round(result.score ?? 0);
        const date      = result.created_at
          ? new Date(result.created_at).toLocaleDateString(undefined, {
              month: 'long',
              day:   'numeric',
              year:  'numeric',
            })
          : '—';

        return (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-slate-900/60 backdrop-blur-xl p-6 md:p-8 rounded-2xl border border-slate-800/80 shadow-2xl hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.08)] transition-all group flex flex-col md:flex-row md:items-center gap-8"
          >
            {/* Icon */}
            <div className="h-14 w-14 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40 transition-all duration-300">
              <CheckCircle2 size={28} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-lg font-black text-white truncate group-hover:text-emerald-400 transition-colors">
                  {title}
                </h3>
                <span
                  className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    difficulty === 'Hard'
                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : difficulty === 'Medium'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}
                >
                  {difficulty}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-slate-500">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-slate-600" />
                  <span>{date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy size={14} className="text-amber-400" />
                  <span className="text-slate-400 font-black">Score: {score}%</span>
                </div>
              </div>
            </div>

            {/* Score badge */}
            <div className="flex items-center gap-4">
              <ScoreBadge score={result.score} />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Teacher / Admin Library View
// Renders recentQuizzes — each row is a Quiz the user generated.
// ─────────────────────────────────────────────────────────────────────────────
function TeacherLibraryView({ recentQuizzes, isLoading, searchTerm }) {
  const navigate  = useNavigate();
  const filtered  = recentQuizzes.filter((q) =>
    q.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <LoadingSpinner label="Syncing Library…" />;

  if (filtered.length === 0) {
    return (
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800/80 border-dashed p-20 text-center">
        <div className="h-24 w-24 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
          <BookOpen size={48} className="text-indigo-400" />
        </div>
        <h3 className="text-2xl font-black text-white mb-3 tracking-tight">
          {searchTerm ? 'No matches found' : 'Library is empty'}
        </h3>
        <p className="text-slate-400 max-w-sm mx-auto mb-10 text-lg font-medium">
          {searchTerm
            ? `We couldn't find any results for "${searchTerm}".`
            : "You haven't generated any assessments yet. Let's create your first one!"}
        </p>
        {!searchTerm && (
          <button
            onClick={() => navigate('/upload')}
            className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center gap-3 mx-auto border border-white/5"
          >
            <Sparkles size={18} />
            Generate First Assessment
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5">
      {filtered.map((quiz, index) => (
        <motion.div
          key={quiz.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-slate-900/60 backdrop-blur-xl p-6 md:p-8 rounded-2xl border border-slate-800/80 shadow-2xl hover:border-indigo-500/30 hover:shadow-[0_0_20px_rgba(99,102,241,0.08)] transition-all group flex flex-col md:flex-row md:items-center gap-8 cursor-pointer"
          onClick={() => navigate(`/quiz-view/${quiz.id}`)}
        >
          <div className="h-14 w-14 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-indigo-500/20 group-hover:border-indigo-500/40 transition-all duration-300">
            <FileText size={28} />
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-lg font-black text-white truncate group-hover:text-indigo-400 transition-colors">
                {quiz.title}
              </h3>
              <span
                className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  quiz.difficulty === 'Hard'
                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                    : quiz.difficulty === 'Medium'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}
              >
                {quiz.difficulty}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-slate-500">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-slate-600" />
                <span>
                  {new Date(quiz.created_at).toLocaleDateString(undefined, {
                    month: 'long',
                    day:   'numeric',
                    year:  'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen size={14} className="text-slate-600" />
                <span className="uppercase tracking-widest text-[10px]">
                  {quiz.question_type}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-slate-800/60">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/quiz-view/${quiz.id}`);
              }}
              className="px-5 py-2.5 bg-slate-950/40 text-indigo-400 border border-indigo-500/20 font-black rounded-xl text-sm hover:bg-indigo-500/10 hover:border-indigo-500/40 transition-all flex items-center gap-2 active:scale-95"
            >
              <ExternalLink size={16} />
              <span>Open Assessment</span>
            </button>
            <div className="h-8 w-8 flex items-center justify-center text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all">
              <ChevronRight size={24} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared loading spinner
// ─────────────────────────────────────────────────────────────────────────────
function LoadingSpinner({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 space-y-6">
      <div className="h-12 w-12 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin" />
      <div className="text-center">
        <p className="text-white font-black text-xl">{label}</p>
        <p className="text-slate-500 font-medium mt-1 uppercase tracking-[0.2em] text-[10px]">
          Retrieving your data…
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function HistoryPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // ── Auth ────────────────────────────────────────────────────────────────────
  const user      = useAuthStore((state) => state.user);
  const role      = (user?.role || user?.Role || '').toLowerCase();
  const isStudent = role === 'student';
  // ───────────────────────────────────────────────────────────────────────────

  // ── Store slices ────────────────────────────────────────────────────────────
  const {
    recentQuizzes,
    myResults,
    fetchQuizzes,
    fetchMyResults,
    isLoading,
    error,
    clearError,
  } = useQuizStore();
  // ───────────────────────────────────────────────────────────────────────────

  // ── Data fetch — strictly by role ───────────────────────────────────────────
  useEffect(() => {
    if (isStudent) {
      // Students: fetch their own completed submissions
      fetchMyResults();
    } else {
      // Teachers / Admins: fetch their generated quiz library
      fetchQuizzes();
    }
  }, [isStudent, fetchMyResults, fetchQuizzes]);
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // ── Page copy per role ──────────────────────────────────────────────────────
  const pageTitle    = isStudent ? 'My Results'        : 'Assessment Library';
  const pageSubtitle = isStudent
    ? 'A record of every assessment you have completed.'
    : 'Manage, review, and export your AI-generated assessments.';
  const searchPlaceholder = isStudent
    ? 'Search by quiz name…'
    : 'Search assessments…';
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 w-full"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            {pageTitle}
          </h1>
          <p className="text-slate-400 font-medium mt-1">{pageSubtitle}</p>
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80 group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-3 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all w-full text-white placeholder:text-slate-600 font-medium text-sm"
            />
          </div>
        </div>
      </div>

      {/* Role-gated content */}
      {isStudent ? (
        <StudentResultsView
          myResults={myResults}
          isLoading={isLoading}
          searchTerm={searchTerm}
        />
      ) : (
        <TeacherLibraryView
          recentQuizzes={recentQuizzes}
          isLoading={isLoading}
          searchTerm={searchTerm}
        />
      )}
    </motion.div>
  );
}
