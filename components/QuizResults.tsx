'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, RotateCcw, PlusCircle, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizAttempt } from '@/lib/types';
import { playSound } from '@/lib/audio';

interface QuizResultsProps {
  attempt: QuizAttempt;
  onRetake: () => void;
  onNewQuiz: () => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({ attempt, onRetake, onNewQuiz }) => {
  const quiz = attempt.quizSnapshot;

  useEffect(() => {
    if (attempt.percentage >= 70) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe fallback
      }
    }
  }, [attempt.percentage]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* Score Header Card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 text-center shadow-xs mb-6">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-3">
          <Award className="h-6 w-6" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
          Quiz Completed!
        </h1>
        <p className="text-sm text-zinc-500 mt-1">Topic: {attempt.topic}</p>

        {/* Big Score Display */}
        <div className="my-6">
          <div className="text-5xl font-black text-indigo-600 tracking-tight">
            {attempt.score} <span className="text-2xl text-zinc-400 font-semibold">/ {attempt.totalQuestions}</span>
          </div>
          <div className="text-sm font-bold text-zinc-600 mt-1">
            {attempt.percentage}% Correct
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
          <button
            onClick={() => {
              playSound('click');
              onRetake();
            }}
            id="retake-mcq-btn"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Retake This Quiz</span>
          </button>

          <button
            onClick={() => {
              playSound('click');
              onNewQuiz();
            }}
            id="new-mcq-btn"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 shadow-xs transition"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Start Another Quiz</span>
          </button>
        </div>
      </div>

      {/* Question by Question Review */}
      {quiz && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-zinc-900 px-1">Review Answers</h2>

          {quiz.questions.map((q, idx) => {
            const userAns = attempt.userAnswers[idx];
            const isCorrect = userAns?.isCorrect ?? false;
            const selectedIdx = userAns?.selectedAnswerIndex ?? null;

            return (
              <div
                key={q.id || idx}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-xs font-bold text-zinc-600">
                      {idx + 1}
                    </span>
                    <h3 className="text-sm font-bold text-zinc-900 leading-snug">
                      {q.question}
                    </h3>
                  </div>

                  {isCorrect ? (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 shrink-0 border border-emerald-200">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Correct
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700 shrink-0 border border-rose-200">
                      <XCircle className="h-3.5 w-3.5" /> Incorrect
                    </span>
                  )}
                </div>

                {/* Options Review */}
                <div className="space-y-2 mt-3 text-xs">
                  {q.options.map((opt, optIdx) => {
                    const isUserChoice = selectedIdx === optIdx;
                    const isRightChoice = q.correctAnswerIndex === optIdx;

                    let rowStyle = 'border-zinc-100 bg-zinc-50/50 text-zinc-600';
                    if (isRightChoice) {
                      rowStyle = 'border-emerald-300 bg-emerald-50 text-emerald-950 font-bold';
                    } else if (isUserChoice && !isRightChoice) {
                      rowStyle = 'border-rose-300 bg-rose-50 text-rose-950 font-medium line-through';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`flex items-center justify-between rounded-xl border p-2.5 ${rowStyle}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{String.fromCharCode(65 + optIdx)}.</span>
                          <span>{opt}</span>
                        </div>
                        {isRightChoice && (
                          <span className="text-[10px] uppercase font-bold text-emerald-700">
                            Correct Answer
                          </span>
                        )}
                        {isUserChoice && !isRightChoice && (
                          <span className="text-[10px] uppercase font-bold text-rose-600">
                            Your Choice
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                <div className="mt-3 rounded-xl bg-zinc-50 p-3 text-xs text-zinc-600 leading-relaxed border border-zinc-100">
                  <span className="font-bold text-zinc-800">Explanation: </span>
                  {q.explanation}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
