'use client';

import React, { useState } from 'react';
import { Sparkles, Loader2, BookOpen, Check } from 'lucide-react';
import { Quiz, DifficultyLevel } from '@/lib/types';
import { playSound } from '@/lib/audio';

interface QuizCreatorProps {
  onQuizGenerated: (quiz: Quiz) => void;
}

const POPULAR_TOPICS = [
  'JavaScript & Web',
  'Python Basics',
  'World History',
  'Solar System & Space',
  'Human Biology',
  'General Science',
  'World Geography',
  'Basic Economics',
];

export const QuizCreator: React.FC<QuizCreatorProps> = ({ onQuizGenerated }) => {
  const [topic, setTopic] = useState('JavaScript & Web');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectPreset = (preset: string) => {
    setTopic(preset);
    setError(null);
    playSound('click');
  };

  const handleStartQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTopic = topic.trim();
    if (!cleanTopic) {
      setError('Please enter a topic for your MCQ quiz.');
      return;
    }

    setError(null);
    setIsLoading(true);
    playSound('click');

    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: cleanTopic,
          questionCount,
          difficulty,
        }),
      });

      const data = await res.json();
      if (data.quiz && Array.isArray(data.quiz.questions)) {
        playSound('powerup');
        onQuizGenerated(data.quiz);
      } else {
        throw new Error('Could not load quiz questions.');
      }
    } catch {
      setError('A connection issue occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-semibold text-indigo-700 mb-3">
          <BookOpen className="h-3.5 w-3.5" />
          Multiple Choice Questions (MCQ)
        </div>
        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight sm:text-4xl">
          Quick MCQ Quiz
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Pick any topic to generate 4-choice questions with instant answers and explanations.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleStartQuiz} className="space-y-6">
          {/* Topic Input */}
          <div>
            <label htmlFor="quiz-topic" className="block text-sm font-bold text-zinc-900 mb-2">
              Topic or Subject
            </label>
            <input
              id="quiz-topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Ancient Rome, React Hooks, Cell Division..."
              className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-600 focus:bg-white focus:outline-hidden focus:ring-3 focus:ring-indigo-500/15 transition"
            />

            {/* Quick Topic Chips */}
            <div className="mt-3">
              <span className="text-xs font-medium text-zinc-500 block mb-2">Popular suggestions:</span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_TOPICS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleSelectPreset(item)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium border transition ${
                      topic === item
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                        : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Controls: Number of Questions & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-100">
            {/* Number of Questions */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-2">
                Number of MCQs
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[3, 5, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setQuestionCount(num);
                      playSound('click');
                    }}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      questionCount === num
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                        : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    {num} Questions
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-2">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'easy', label: 'Easy' },
                  { key: 'medium', label: 'Medium' },
                  { key: 'hard', label: 'Hard' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setDifficulty(item.key as DifficultyLevel);
                      playSound('click');
                    }}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      difficulty === item.key
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                        : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              {error}
            </div>
          )}

          {/* Start Quiz Button */}
          <button
            type="submit"
            disabled={isLoading}
            id="start-mcq-quiz-btn"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 px-6 text-sm font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 focus:outline-hidden focus:ring-4 focus:ring-indigo-500/20 active:scale-[0.99] disabled:opacity-75 transition cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Preparing your MCQ quiz...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Start MCQ Quiz</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
