import { Quiz, QuizAttempt, UserProfile, AchievementBadge } from './types';

const STORAGE_KEYS = {
  ATTEMPTS: 'ai_quiz_attempts_v1',
  SAVED_QUIZZES: 'ai_quiz_saved_quizzes_v1',
  PROFILE: 'ai_quiz_user_profile_v1',
};

export const BADGES: AchievementBadge[] = [
  {
    id: 'first_quiz',
    name: 'First Step',
    description: 'Completed your first AI-generated quiz',
    iconName: 'Award',
  },
  {
    id: 'streak_3',
    name: 'On Fire',
    description: 'Achieved a streak of 3 consecutive correct answers',
    iconName: 'Flame',
  },
  {
    id: 'streak_5',
    name: 'Unstoppable',
    description: 'Achieved a streak of 5 consecutive correct answers',
    iconName: 'Zap',
  },
  {
    id: 'perfect_score',
    name: 'Flawless Victory',
    description: 'Scored 100% on a quiz with at least 5 questions',
    iconName: 'Trophy',
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Finished a quiz with an average of under 8 seconds per question',
    iconName: 'Timer',
  },
  {
    id: 'quiz_master_5',
    name: 'Curious Mind',
    description: 'Completed 5 different quizzes',
    iconName: 'Brain',
  },
  {
    id: 'high_roller_xp',
    name: 'Mastermind',
    description: 'Accumulated over 1,000 Total XP',
    iconName: 'Crown',
  },
];

export function getInitialProfile(): UserProfile {
  return {
    name: 'Quiz Explorer',
    avatarSeed: 'scholar',
    xp: 0,
    level: 1,
    totalQuizzesTaken: 0,
    totalQuestionsAnswered: 0,
    correctAnswersCount: 0,
    highestStreak: 0,
    unlockedBadgeIds: [],
  };
}

export function getUserProfile(): UserProfile {
  if (typeof window === 'undefined') return getInitialProfile();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return getInitialProfile();
    return { ...getInitialProfile(), ...JSON.parse(raw) };
  } catch {
    return getInitialProfile();
  }
}

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch {
    // Ignore storage quota errors
  }
}

export function calculateLevel(xp: number): number {
  // Level up curve: Level = 1 + floor(sqrt(xp / 100))
  return Math.max(1, Math.floor(1 + Math.sqrt(xp / 100)));
}

export function getXpForNextLevel(currentLevel: number): number {
  return Math.pow(currentLevel, 2) * 100;
}

export function getQuizAttempts(): QuizAttempt[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveQuizAttempt(attempt: QuizAttempt): { newBadges: AchievementBadge[] } {
  if (typeof window === 'undefined') return { newBadges: [] };
  const currentAttempts = getQuizAttempts();
  const updatedAttempts = [attempt, ...currentAttempts];
  
  try {
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(updatedAttempts.slice(0, 50)));
  } catch {
    // ignore
  }

  // Update User Profile
  const profile = getUserProfile();
  const newXp = profile.xp + attempt.xpEarned;
  const newLevel = calculateLevel(newXp);
  const totalQuizzes = profile.totalQuizzesTaken + 1;
  const totalQuestions = profile.totalQuestionsAnswered + attempt.totalQuestions;
  const correctCount = profile.correctAnswersCount + attempt.score;
  const highestStreak = Math.max(profile.highestStreak, attempt.streakRecord);

  // Check badges
  const newlyUnlockedBadges: AchievementBadge[] = [];
  const existingBadgeIds = new Set(profile.unlockedBadgeIds);

  const checkBadge = (id: string, condition: boolean) => {
    if (condition && !existingBadgeIds.has(id)) {
      existingBadgeIds.add(id);
      const b = BADGES.find((badge) => badge.id === id);
      if (b) newlyUnlockedBadges.push(b);
    }
  };

  checkBadge('first_quiz', totalQuizzes >= 1);
  checkBadge('quiz_master_5', totalQuizzes >= 5);
  checkBadge('streak_3', attempt.streakRecord >= 3);
  checkBadge('streak_5', attempt.streakRecord >= 5);
  checkBadge('perfect_score', attempt.percentage === 100 && attempt.totalQuestions >= 5);
  checkBadge(
    'speed_demon',
    attempt.totalQuestions > 0 &&
      attempt.timeSpentTotalSeconds / attempt.totalQuestions < 8 &&
      attempt.percentage >= 70
  );
  checkBadge('high_roller_xp', newXp >= 1000);

  const updatedProfile: UserProfile = {
    ...profile,
    xp: newXp,
    level: newLevel,
    totalQuizzesTaken: totalQuizzes,
    totalQuestionsAnswered: totalQuestions,
    correctAnswersCount: correctCount,
    highestStreak,
    unlockedBadgeIds: Array.from(existingBadgeIds),
  };

  saveUserProfile(updatedProfile);
  return { newBadges: newlyUnlockedBadges };
}

export function getSavedQuizzes(): Quiz[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_QUIZZES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveQuizToLibrary(quiz: Quiz): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const existing = getSavedQuizzes();
    // Prevent duplicate saves
    if (existing.some((q) => q.id === quiz.id)) return true;
    const updated = [quiz, ...existing];
    localStorage.setItem(STORAGE_KEYS.SAVED_QUIZZES, JSON.stringify(updated.slice(0, 30)));
    return true;
  } catch {
    return false;
  }
}

export function deleteSavedQuiz(quizId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getSavedQuizzes();
    const filtered = existing.filter((q) => q.id !== quizId);
    localStorage.setItem(STORAGE_KEYS.SAVED_QUIZZES, JSON.stringify(filtered));
  } catch {
    // ignore
  }
}
