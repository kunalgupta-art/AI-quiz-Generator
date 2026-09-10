'use client';

import React, { useState } from 'react';
import { X, Trophy, Award, Zap, Flame, CheckCircle, Brain, Crown, Timer, Sparkles, User } from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { BADGES, calculateLevel, getXpForNextLevel } from '@/lib/storage';
import { playSound } from '@/lib/audio';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
}) => {
  const [name, setName] = useState(profile.name);
  const [isEditingName, setIsEditingName] = useState(false);

  if (!isOpen) return null;

  const currentLevel = calculateLevel(profile.xp);
  const xpNeeded = getXpForNextLevel(currentLevel);
  const prevLevelXp = Math.pow(currentLevel - 1, 2) * 100;
  const progressInLevel = Math.max(0, profile.xp - prevLevelXp);
  const levelSpan = Math.max(1, xpNeeded - prevLevelXp);
  const progressPercent = Math.min(100, Math.round((progressInLevel / levelSpan) * 100));

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onUpdateProfile({ ...profile, name: name.trim() });
      setIsEditingName(false);
      playSound('click');
    }
  };

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Award': return <Award className="h-5 w-5" />;
      case 'Flame': return <Flame className="h-5 w-5" />;
      case 'Zap': return <Zap className="h-5 w-5" />;
      case 'Trophy': return <Trophy className="h-5 w-5" />;
      case 'Timer': return <Timer className="h-5 w-5" />;
      case 'Brain': return <Brain className="h-5 w-5" />;
      case 'Crown': return <Crown className="h-5 w-5" />;
      default: return <Sparkles className="h-5 w-5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-2xl font-black text-white shadow-lg shadow-indigo-500/20">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            {isEditingName ? (
              <form onSubmit={handleSaveName} className="flex items-center gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-lg border border-zinc-300 px-3 py-1 text-sm font-bold text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-bold text-white hover:bg-indigo-500"
                >
                  Save
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-zinc-900">{profile.name}</h3>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-xs text-indigo-600 hover:underline font-semibold"
                >
                  Edit
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200">
                Level {currentLevel} Scholar
              </span>
              <span className="text-xs text-zinc-400">•</span>
              <span className="text-xs font-mono font-bold text-zinc-500">{profile.xp} Total XP</span>
            </div>
          </div>
        </div>

        {/* XP Level Progress Bar */}
        <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 mb-6">
          <div className="flex justify-between items-center text-xs font-bold text-zinc-700 mb-1.5">
            <span>Level {currentLevel} Progress</span>
            <span>{profile.xp} / {xpNeeded} XP</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-zinc-200 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-[11px] text-zinc-400 mt-1.5">
            {xpNeeded - profile.xp} XP needed to reach Level {currentLevel + 1}
          </div>
        </div>

        {/* Lifetime Stats */}
        <div className="grid grid-cols-3 gap-2 text-center mb-6">
          <div className="rounded-xl border border-zinc-200/80 p-3">
            <div className="text-xs text-zinc-400 font-medium">Quizzes Taken</div>
            <div className="text-lg font-black text-zinc-900 mt-0.5">{profile.totalQuizzesTaken}</div>
          </div>
          <div className="rounded-xl border border-zinc-200/80 p-3">
            <div className="text-xs text-zinc-400 font-medium">Questions Hit</div>
            <div className="text-lg font-black text-zinc-900 mt-0.5">{profile.correctAnswersCount}</div>
          </div>
          <div className="rounded-xl border border-zinc-200/80 p-3">
            <div className="text-xs text-zinc-400 font-medium">Top Streak</div>
            <div className="text-lg font-black text-amber-600 mt-0.5">{profile.highestStreak}x</div>
          </div>
        </div>

        {/* Achievements Shelf */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-amber-500" />
              Achievements & Badges ({profile.unlockedBadgeIds.length} / {BADGES.length})
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {BADGES.map((badge) => {
              const isUnlocked = profile.unlockedBadgeIds.includes(badge.id);

              return (
                <div
                  key={badge.id}
                  className={`rounded-xl border p-3 flex items-start gap-3 transition ${
                    isUnlocked
                      ? 'border-indigo-200 bg-indigo-50/50 text-zinc-900'
                      : 'border-zinc-200 bg-zinc-50/70 opacity-50 text-zinc-400'
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      isUnlocked
                        ? 'bg-gradient-to-tr from-indigo-500 to-violet-500 text-white shadow-xs'
                        : 'bg-zinc-200 text-zinc-400'
                    }`}
                  >
                    {getBadgeIcon(badge.iconName)}
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-snug flex items-center gap-1">
                      {badge.name}
                      {isUnlocked && <CheckCircle className="h-3 w-3 text-emerald-600" />}
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5 leading-tight">{badge.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
