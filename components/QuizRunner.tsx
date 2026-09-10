'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowRight, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { Quiz, Question, QuizAttempt, UserAnswerRecord } from '@/lib/types';
import { playSound } from '@/lib/audio';

interface QuizRunnerProps {
  quiz: Quiz;
  onFinishQuiz: (attempt: QuizAttempt) => void;
  onQuitQuiz: () => void;
}

export const QuizRunner: React.FC<QuizRunnerProps> = ({ quiz, onFinishQuiz, onQuitQuiz }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [userAnswers, setUserAnswers] = useState<UserAnswerRecord[]>([]);
  const startTimeRef = useRef<number>(0);

  const currentQuestion: Question = quiz.questions[currentIndex] || quiz.questions[0];
  const totalQuestions = quiz.questions.length;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, []);

  const handleSelectOption = useCallback((optionIdx: number) => {
    if (isAnswered) return;

    const isCorrect = optionIdx === currentQuestion.correctAnswerIndex;
    setSelectedOption(optionIdx);
    setIsAnswered(true);

    if (isCorrect) {
      playSound('correct');
    } else {
      playSound('incorrect');
    }

    const answerRecord: UserAnswerRecord = {
      questionId: currentQuestion.id,
      selectedAnswerIndex: optionIdx,
      isCorrect,
      timeSpentSeconds: 0,
    };

    setUserAnswers((prev) => [...prev, answerRecord]);
  }, [currentQuestion.correctAnswerIndex, currentQuestion.id, isAnswered]);

  const handleNext = useCallback(() => {
    playSound('click');

    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Calculate final score
      const totalTimeSpent = Math.max(1, Math.round((Date.now() - (startTimeRef.current || Date.now())) / 1000));
      const score = userAnswers.filter((a) => a.isCorrect).length + (selectedOption === currentQuestion.correctAnswerIndex ? 0 : 0);
      const percentage = Math.round((score / totalQuestions) * 100);

      let grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
      if (percentage >= 90) grade = 'A+';
      else if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'B';
      else if (percentage >= 60) grade = 'C';
      else if (percentage >= 50) grade = 'D';

      const attempt: QuizAttempt = {
        id: `attempt-${Date.now().toString(36)}`,
        quizId: quiz.id,
        quizTitle: quiz.title,
        topic: quiz.topic,
        timestamp: new Date().toISOString(),
        score,
        totalQuestions,
        percentage,
        grade,
        timeSpentTotalSeconds: totalTimeSpent,
        streakRecord: 0,
        xpEarned: score * 50,
        userAnswers,
        quizSnapshot: quiz,
      };

      playSound('finish');
      onFinishQuiz(attempt);
    }
  }, [currentIndex, currentQuestion.correctAnswerIndex, onFinishQuiz, quiz, selectedOption, totalQuestions, userAnswers]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (!isAnswered) {
        if (['1', 'a', 'A'].includes(e.key) && currentQuestion.options[0]) handleSelectOption(0);
        if (['2', 'b', 'B'].includes(e.key) && currentQuestion.options[1]) handleSelectOption(1);
        if (['3', 'c', 'C'].includes(e.key) && currentQuestion.options[2]) handleSelectOption(2);
        if (['4', 'd', 'D'].includes(e.key) && currentQuestion.options[3]) handleSelectOption(3);
      } else if (e.key === 'Enter') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestion.options, handleNext, handleSelectOption, isAnswered]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* Header bar */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <span className="rounded-md bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200">
            {quiz.topic}
          </span>
          <span className="ml-2 text-xs font-medium text-zinc-500 capitalize">
            {quiz.difficulty} Level
          </span>
        </div>

        <button
          onClick={onQuitQuiz}
          className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 transition"
        >
          Exit Quiz
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs font-bold text-zinc-600 mb-1.5">
          <span>Question {currentIndex + 1} of {totalQuestions}</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200">
          <div
            className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs">
        <h2 className="text-lg sm:text-xl font-bold text-zinc-900 leading-snug mb-6">
          {currentQuestion.question}
        </h2>

        {/* 4 MCQ Option Choices */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            const letter = String.fromCharCode(65 + idx);
            const isSelected = selectedOption === idx;
            const isCorrectAnswer = idx === currentQuestion.correctAnswerIndex;

            let cardStyle = 'border-zinc-200 bg-white hover:border-indigo-300 hover:bg-zinc-50 text-zinc-800';
            let badgeStyle = 'border-zinc-200 bg-zinc-100 text-zinc-600';

            if (isAnswered) {
              if (isCorrectAnswer) {
                cardStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold ring-2 ring-emerald-500/20';
                badgeStyle = 'border-emerald-500 bg-emerald-600 text-white';
              } else if (isSelected && !isCorrectAnswer) {
                cardStyle = 'border-rose-400 bg-rose-50 text-rose-950 font-semibold ring-2 ring-rose-400/20';
                badgeStyle = 'border-rose-400 bg-rose-500 text-white';
              } else {
                cardStyle = 'border-zinc-200 bg-zinc-50 text-zinc-400 opacity-60';
                badgeStyle = 'border-zinc-200 bg-zinc-100 text-zinc-400';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={isAnswered}
                onClick={() => handleSelectOption(idx)}
                className={`w-full text-left rounded-xl border p-4 transition flex items-center justify-between cursor-pointer ${cardStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold border transition ${badgeStyle}`}
                  >
                    {letter}
                  </span>
                  <span className="text-sm font-medium leading-relaxed">{option}</span>
                </div>

                {isAnswered && (
                  <div>
                    {isCorrectAnswer && <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />}
                    {isSelected && !isCorrectAnswer && <XCircle className="h-5 w-5 text-rose-500 shrink-0" />}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation Banner */}
        {isAnswered && (
          <div
            className={`mt-6 rounded-xl border p-4 text-xs leading-relaxed transition ${
              selectedOption === currentQuestion.correctAnswerIndex
                ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900'
                : 'border-rose-200 bg-rose-50/70 text-rose-900'
            }`}
          >
            <div className="font-bold mb-1 flex items-center gap-1.5">
              {selectedOption === currentQuestion.correctAnswerIndex ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Correct!</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-rose-600" />
                  <span>
                    Incorrect. The correct answer is Option {String.fromCharCode(65 + currentQuestion.correctAnswerIndex)}.
                  </span>
                </>
              )}
            </div>
            <p className="mt-1 text-zinc-700">{currentQuestion.explanation}</p>
          </div>
        )}

        {/* Next Question / Finish Action */}
        {isAnswered && (
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleNext}
              id="next-mcq-btn"
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-xs hover:bg-indigo-500 transition cursor-pointer"
            >
              <span>{currentIndex < totalQuestions - 1 ? 'Next Question' : 'View Results'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 text-center text-xs text-zinc-400">
        Tip: You can use keys 1-4 or A-D to answer, and Enter to advance.
      </div>
    </div>
  );
};
