'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { QuizCreator } from '@/components/QuizCreator';
import { QuizRunner } from '@/components/QuizRunner';
import { QuizResults } from '@/components/QuizResults';
import { QuizHistory } from '@/components/QuizHistory';
import { UserProfileModal } from '@/components/UserProfileModal';
import { Quiz, QuizAttempt, UserProfile, AchievementBadge } from '@/lib/types';
import { 
  getUserProfile, 
  saveUserProfile, 
  getQuizAttempts, 
  saveQuizAttempt, 
  getSavedQuizzes, 
  deleteSavedQuiz 
} from '@/lib/storage';
import { isSoundEnabled, setSoundEnabled, playSound } from '@/lib/audio';
import { Trophy, Sparkles } from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'create' | 'runner' | 'results' | 'history'>('create');
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [latestAttempt, setLatestAttempt] = useState<QuizAttempt | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>(() => getQuizAttempts());
  const [savedQuizzes, setSavedQuizzes] = useState<Quiz[]>(() => getSavedQuizzes());
  const [userProfile, setUserProfile] = useState<UserProfile>(() => getUserProfile());
  const [soundActive, setSoundActive] = useState(() => isSoundEnabled());

  // Profile Modal
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Unlocked badge toast notification
  const [unlockedToast, setUnlockedToast] = useState<AchievementBadge | null>(null);

  const handleToggleSound = () => {
    const next = !soundActive;
    setSoundActive(next);
    setSoundEnabled(next);
    if (next) playSound('click');
  };

  const handleQuizGenerated = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setActiveTab('runner');
  };

  const handleFinishQuiz = (attempt: QuizAttempt) => {
    setLatestAttempt(attempt);
    const { newBadges } = saveQuizAttempt(attempt);
    
    // Refresh storage states
    setAttempts(getQuizAttempts());
    setUserProfile(getUserProfile());

    if (newBadges.length > 0) {
      setUnlockedToast(newBadges[0]);
      setTimeout(() => setUnlockedToast(null), 4000);
    }

    setActiveTab('results');
  };

  const handleRetake = () => {
    if (activeQuiz) {
      setActiveTab('runner');
    }
  };

  const handleNewQuiz = () => {
    setActiveTab('create');
    setActiveQuiz(null);
    setLatestAttempt(null);
  };

  const handleDeleteSavedQuiz = (quizId: string) => {
    deleteSavedQuiz(quizId);
    setSavedQuizzes(getSavedQuizzes());
    playSound('click');
  };

  const handleLaunchSavedQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setActiveTab('runner');
    playSound('click');
  };

  const handleReviewAttempt = (attempt: QuizAttempt) => {
    setLatestAttempt(attempt);
    setActiveTab('results');
    playSound('click');
  };

  const handleRetakeAttempt = (attempt: QuizAttempt) => {
    if (attempt.quizSnapshot) {
      setActiveQuiz(attempt.quizSnapshot);
      setActiveTab('runner');
      playSound('click');
    }
  };

  const handleQuitQuiz = () => {
    if (confirm('Exit this quiz session?')) {
      setActiveTab('create');
      setActiveQuiz(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          playSound('click');
        }}
        userProfile={userProfile}
        soundEnabled={soundActive}
        onToggleSound={handleToggleSound}
        onOpenProfile={() => {
          setIsProfileOpen(true);
          playSound('click');
        }}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'create' && (
          <QuizCreator onQuizGenerated={handleQuizGenerated} />
        )}

        {activeTab === 'runner' && activeQuiz && (
          <QuizRunner
            quiz={activeQuiz}
            onFinishQuiz={handleFinishQuiz}
            onQuitQuiz={handleQuitQuiz}
          />
        )}

        {activeTab === 'results' && latestAttempt && (
          <QuizResults
            attempt={latestAttempt}
            onRetake={handleRetake}
            onNewQuiz={handleNewQuiz}
          />
        )}

        {activeTab === 'history' && (
          <QuizHistory
            attempts={attempts}
            savedQuizzes={savedQuizzes}
            userProfile={userProfile}
            onLaunchSavedQuiz={handleLaunchSavedQuiz}
            onDeleteSavedQuiz={handleDeleteSavedQuiz}
            onReviewAttempt={handleReviewAttempt}
            onRetakeAttempt={handleRetakeAttempt}
          />
        )}
      </main>

      {/* Profile & Badges Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={userProfile}
        onUpdateProfile={(updated) => {
          setUserProfile(updated);
          saveUserProfile(updated);
        }}
      />

      {/* Unlocked Achievement Toast Notification */}
      {unlockedToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 shadow-xl text-amber-900 animate-slideUp">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" /> Badge Unlocked!
            </div>
            <div className="text-sm font-black text-zinc-900">{unlockedToast.name}</div>
            <div className="text-[11px] text-zinc-600">{unlockedToast.description}</div>
          </div>
        </div>
      )}
    </div>
  );
}
