'use client';

import React from 'react';
import { Volume2, VolumeX, Sparkles, BarChart3, User } from 'lucide-react';
import { UserProfile } from '@/lib/types';

interface NavbarProps {
  activeTab: 'create' | 'runner' | 'results' | 'history' | 'saved';
  onSelectTab: (tab: 'create' | 'history') => void;
  userProfile: UserProfile;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  userProfile,
  soundEnabled,
  onToggleSound,
  onOpenProfile,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-xs">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <button
          onClick={() => onSelectTab('create')}
          className="flex items-center gap-2.5 text-left transition hover:opacity-90 cursor-pointer"
          id="brand-logo-btn"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-zinc-900">
              MCQ Quiz <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md border border-indigo-100">AI</span>
            </span>
          </div>
        </button>

        {/* Right Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectTab('create')}
            id="nav-new-quiz"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'create' || activeTab === 'runner' || activeTab === 'results'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            New Quiz
          </button>

          <button
            onClick={() => onSelectTab('history')}
            id="nav-history"
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'history'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>History</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            id="sound-toggle-btn"
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 transition cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <VolumeX className="h-4 w-4 text-zinc-400" />
            )}
          </button>

          {/* Profile */}
          <button
            onClick={onOpenProfile}
            id="user-profile-btn"
            title="View Profile"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 transition cursor-pointer"
          >
            <User className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
