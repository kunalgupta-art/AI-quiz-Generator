import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { getFallbackQuiz } from '@/lib/fallback-quizzes';
import { Quiz, Question, DifficultyLevel } from '@/lib/types';

function extractJsonFromText(rawText: string) {
  if (!rawText || !rawText.trim()) {
    throw new Error('JSON is not present in model response');
  }

  let cleaned = rawText.trim();

  // Strip markdown code fences if returned by model
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const candidate = cleaned.substring(firstBrace, lastBrace + 1);
      return JSON.parse(candidate);
    }
    throw new Error(`JSON is not present or malformed: ${(err as Error).message}`);
  }
}

export async function POST(req: NextRequest) {
  let requestedTopic = 'General Knowledge';
  let requestedCount = 5;
  let requestedDifficulty: DifficultyLevel = 'medium';

  try {
    const body = await req.json();
    const {
      topic = 'General Knowledge',
      questionCount = 5,
      difficulty = 'medium' as DifficultyLevel,
    } = body;

    requestedTopic = String(topic || 'General Knowledge').trim();
    requestedCount = Math.min(Math.max(Number(questionCount) || 5, 3), 15);
    requestedDifficulty = (['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium') as DifficultyLevel;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      const fallback = getFallbackQuiz(requestedTopic, requestedCount, requestedDifficulty, 'instant', 0);
      return NextResponse.json({ quiz: fallback, source: 'fallback' });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const promptContext = `Generate a high quality Multiple Choice Quiz (MCQ) on the topic: "${requestedTopic}".
Each question MUST be a multiple choice question with exactly 4 options (A, B, C, D) and exactly one correct answer.
Difficulty level: ${requestedDifficulty}. Provide exactly ${requestedCount} questions.`;

    const systemInstruction = `You are an expert educator. Create a clear, high-quality multiple choice quiz (MCQ).
Rules:
1. Every question MUST have exactly 4 choices in "options" array.
2. "correctAnswerIndex" MUST be 0, 1, 2, or 3.
3. Provide a clear, educational "explanation" explaining why the answer is correct.
4. Provide a brief 1-sentence "hint".
5. Keep questions concise and well-phrased.`;

    // Use supported modern models as defined in gemini-api skill
    const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
    let rawText = '';
    let lastError: unknown = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: promptContext,
          config: {
            systemInstruction,
            temperature: 0.7,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: {
                  type: Type.STRING,
                  description: 'Title of the MCQ quiz',
                },
                description: {
                  type: Type.STRING,
                  description: 'Short 1-sentence description',
                },
                questions: {
                  type: Type.ARRAY,
                  description: `Array of exactly ${requestedCount} multiple choice questions`,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      question: {
                        type: Type.STRING,
                        description: 'The multiple choice question prompt',
                      },
                      options: {
                        type: Type.ARRAY,
                        description: 'Exactly 4 multiple choice options',
                        items: { type: Type.STRING },
                      },
                      correctAnswerIndex: {
                        type: Type.INTEGER,
                        description: 'Index of correct choice (0, 1, 2, or 3)',
                      },
                      explanation: {
                        type: Type.STRING,
                        description: 'Explanation for why the correct option is right',
                      },
                      hint: {
                        type: Type.STRING,
                        description: 'Subtle conceptual hint',
                      },
                    },
                    required: ['question', 'options', 'correctAnswerIndex', 'explanation'],
                  },
                },
              },
              required: ['title', 'questions'],
            },
          },
        });

        rawText = response.text || '';
        if (rawText) break;
      } catch (err) {
        lastError = err;
        console.warn(`Model ${modelName} encountered an issue:`, err);
        // Continue to fallback model
      }
    }

    if (!rawText) {
      // Graceful fallback to curated questions
      const fallback = getFallbackQuiz(requestedTopic, requestedCount, requestedDifficulty, 'instant', 0);
      return NextResponse.json({ quiz: fallback, source: 'fallback' });
    }

    const parsed = extractJsonFromText(rawText);

    if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      const fallback = getFallbackQuiz(requestedTopic, requestedCount, requestedDifficulty, 'instant', 0);
      return NextResponse.json({ quiz: fallback, source: 'fallback' });
    }

    interface RawQuestion {
      question?: string;
      options?: string[];
      correctAnswerIndex?: number;
      explanation?: string;
      hint?: string;
    }

    const formattedQuestions: Question[] = parsed.questions.slice(0, requestedCount).map((q: RawQuestion, idx: number) => {
      const rawOptions = Array.isArray(q.options) && q.options.length >= 2 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'];
      // Ensure exactly 4 options if possible
      while (rawOptions.length < 4) {
        rawOptions.push(`Option ${String.fromCharCode(65 + rawOptions.length)}`);
      }
      const safeOptions = rawOptions.slice(0, 4);

      let correctIndex = Number(q.correctAnswerIndex);
      if (isNaN(correctIndex) || correctIndex < 0 || correctIndex >= safeOptions.length) {
        correctIndex = 0;
      }

      return {
        id: `q-${idx + 1}-${Date.now().toString(36)}`,
        question: q.question || `Question ${idx + 1}`,
        options: safeOptions,
        correctAnswerIndex: correctIndex,
        explanation: q.explanation || 'The selected choice is the verified correct answer.',
        hint: q.hint || 'Review the options carefully to find the best match.',
        difficulty: requestedDifficulty,
        category: requestedTopic,
      };
    });

    const quiz: Quiz = {
      id: `quiz-${Date.now().toString(36)}`,
      title: parsed.title || `${requestedTopic} MCQ Quiz`,
      description: parsed.description || `A simple multiple choice quiz on ${requestedTopic}.`,
      topic: requestedTopic,
      difficulty: requestedDifficulty,
      questionType: 'multiple_choice',
      questions: formattedQuestions,
      createdAt: new Date().toISOString(),
      totalQuestions: formattedQuestions.length,
      timePerQuestionSeconds: 0,
      mode: 'instant',
    };

    return NextResponse.json({ quiz, source: 'gemini' });
  } catch {
    // Return curated fallback seamlessly without breaking or throwing 500/503
    const fallback = getFallbackQuiz(requestedTopic, requestedCount, requestedDifficulty, 'instant', 0);
    return NextResponse.json({ quiz: fallback, source: 'fallback' });
  }
}
