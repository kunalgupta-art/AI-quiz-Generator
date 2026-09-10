export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'mixed';
export type QuizMode = 'instant' | 'exam';
export type QuestionType = 'multiple_choice' | 'true_false' | 'mixed';

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  hint: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  codeSnippet?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  topic: string;
  difficulty: DifficultyLevel;
  questionType: QuestionType;
  questions: Question[];
  createdAt: string;
  totalQuestions: number;
  timePerQuestionSeconds: number; // 0 = untimed, or e.g. 15, 30, 60
  totalQuizTimeLimitSeconds?: number; // 0 = no total limit
  mode: QuizMode;
}

export interface UserAnswerRecord {
  questionId: string;
  selectedAnswerIndex: number | null; // null if skipped or timed out
  isCorrect: boolean;
  timeSpentSeconds: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  topic: string;
  timestamp: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  timeSpentTotalSeconds: number;
  streakRecord: number;
  xpEarned: number;
  userAnswers: UserAnswerRecord[];
  quizSnapshot?: Quiz;
}

export interface AchievementBadge {
  id: string;
  name: string;
  description: string;
  iconName: string;
  unlockedAt?: string;
}

export interface UserProfile {
  name: string;
  avatarSeed: string;
  xp: number;
  level: number;
  totalQuizzesTaken: number;
  totalQuestionsAnswered: number;
  correctAnswersCount: number;
  highestStreak: number;
  unlockedBadgeIds: string[];
}
