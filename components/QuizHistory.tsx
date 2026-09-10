'use client';

import React, { useState } from 'react';
import { 
  BarChart3, 
  Bookmark, 
  Calendar, 
  Trophy, 
  Flame, 
  Clock, 
  ArrowRight, 
  Trash2, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles,
  HelpCircle,
  FileJson
} from 'lucide-react';
import { QuizAttempt, Quiz, UserProfile } from '@/lib/types';
import { playSound } from '@/lib/audio';
import { JsonModal } from './JsonModal';

interface QuizHistoryProps {
  attempts: QuizAttempt[];
  savedQuizzes: Quiz[];
  userProfile: UserProfile;
  onLaunchSavedQuiz: (quiz: Quiz) => void;
  onDeleteSavedQuiz: (quizId: string) => void;
  onReviewAttempt: (attempt: QuizAttempt) => void;
  onRetakeAttempt: (attempt: QuizAttempt) => void;
  initialTab?: 'attempts' | 'saved';
}

export const QuizHistory: React.FC<QuizHistoryProps> = ({
  attempts,
  savedQuizzes,
  userProfile,
  onLaunchSavedQuiz,
  onDeleteSavedQuiz,
  onReviewAttempt,
  onRetakeAttempt,
  initialTab = 'attempts',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'attempts' | 'saved'>(initialTab);
  const [inspectQuizJson, setInspectQuizJson] = useState<Quiz | null>(null);

  const averageScore = attempts.length > 0
    ? Math.round(attempts.reduce((acc, a) => acc + a.percentage, 0) / attempts.length)
    : 0;

  const totalTimeSpentSeconds = attempts.reduce((acc, a) => acc + a.timeSpentTotalSeconds, 0);
  const totalHours = (totalTimeSpentSeconds / 3600).toFixed(1);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Overview Analytics Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 mb-8">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
            <Trophy className="h-4 w-4 text-amber-500" /> Quizzes Taken
          </div>
          <div className="mt-2 text-2xl font-black text-zinc-900">{attempts.length}</div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Average Accuracy
          </div>
          <div className="mt-2 text-2xl font-black text-zinc-900">{averageScore}%</div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
            <Flame className="h-4 w-4 text-orange-500" /> Best Streak
          </div>
          <div className="mt-2 text-2xl font-black text-zinc-900">{userProfile.highestStreak}x</div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
            <Clock className="h-4 w-4 text-indigo-500" /> Study Time
          </div>
          <div className="mt-2 text-2xl font-black text-zinc-900">{totalHours} hrs</div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setActiveSubTab('attempts');
              playSound('click');
            }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeSubTab === 'attempts'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Attempt History ({attempts.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('saved');
              playSound('click');
            }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeSubTab === 'saved'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
          >
            <Bookmark className="h-4 w-4" />
            <span>Saved Quizzes Library ({savedQuizzes.length})</span>
          </button>
        </div>
      </div>

      {/* Tab: Attempt History */}
      {activeSubTab === 'attempts' && (
        <div>
          {attempts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center bg-white">
              <BarChart3 className="mx-auto h-12 w-12 text-zinc-300 mb-3" />
              <h3 className="text-base font-bold text-zinc-900">No attempts logged yet</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                Generate and complete your first quiz to track your mastery scores, speed statistics, and streaks.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {attempts.map((att) => {
                const date = new Date(att.timestamp).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={att.id}
                    className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xs hover:border-indigo-200 transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white font-black text-lg">
                        {att.percentage}%
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200">
                            {att.topic}
                          </span>
                          <span className="text-xs text-zinc-400">•</span>
                          <span className="text-xs font-bold text-zinc-700">Grade {att.grade}</span>
                          <span className="text-xs text-zinc-400">•</span>
                          <span className="text-xs text-zinc-400 flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {date}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-zinc-900 mt-1">{att.quizTitle}</h4>
                        <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                          <span>{att.score}/{att.totalQuestions} correct</span>
                          <span>•</span>
                          <span>{att.streakRecord}x streak</span>
                          <span>•</span>
                          <span>+{att.xpEarned} XP</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onReviewAttempt(att)}
                        className="rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition"
                      >
                        Review Answers
                      </button>
                      {att.quizSnapshot && (
                        <button
                          onClick={() => onRetakeAttempt(att)}
                          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition shadow-xs"
                        >
                          <RotateCcw className="h-3.5 w-3.5" /> Retake
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Saved Quizzes Library */}
      {activeSubTab === 'saved' && (
        <div>
          {savedQuizzes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center bg-white">
              <Bookmark className="mx-auto h-12 w-12 text-zinc-300 mb-3" />
              <h3 className="text-base font-bold text-zinc-900">Your quiz library is empty</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                After generating and taking a quiz, click &quot;Save Quiz&quot; on the results screen to replay it anytime without using AI tokens!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xs hover:border-indigo-300 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200">
                        {quiz.topic}
                      </span>
                      <span className="text-xs font-medium text-zinc-500 capitalize">
                        {quiz.difficulty} Level
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-zinc-900 leading-snug">{quiz.title}</h4>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{quiz.description}</p>
                    
                    <div className="mt-3 flex items-center gap-3 text-xs text-zinc-400">
                      <span>{quiz.questions.length} questions</span>
                      <span>•</span>
                      <span>{quiz.timePerQuestionSeconds > 0 ? `${quiz.timePerQuestionSeconds}s/q` : 'Untimed'}</span>
                      <span>•</span>
                      <span>{quiz.mode === 'instant' ? 'Instant learn' : 'Exam mode'}</span>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onDeleteSavedQuiz(quiz.id)}
                        className="text-xs text-zinc-400 hover:text-rose-600 flex items-center gap-1 transition"
                        title="Remove from saved library"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                      <button
                        onClick={() => setInspectQuizJson(quiz)}
                        className="text-xs text-zinc-400 hover:text-emerald-600 flex items-center gap-1 transition ml-1"
                        title="Export or inspect JSON"
                      >
                        <FileJson className="h-3.5 w-3.5" /> JSON
                      </button>
                    </div>

                    <button
                      onClick={() => onLaunchSavedQuiz(quiz)}
                      className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition shadow-xs"
                    >
                      <span>Take Quiz</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {inspectQuizJson && (
        <JsonModal
          isOpen={!!inspectQuizJson}
          onClose={() => setInspectQuizJson(null)}
          title={inspectQuizJson.title}
          data={inspectQuizJson}
          filename={`${inspectQuizJson.topic.toLowerCase().replace(/\s+/g, '-')}-quiz.json`}
        />
      )}
    </div>
  );
};
