import { Question, Quiz, DifficultyLevel, QuestionType, QuizMode } from './types';

const FALLBACK_TOPIC_DATA: Record<string, Question[]> = {
  javascript: [
    {
      id: 'js-1',
      question: 'What is the output of `typeof NaN` in JavaScript?',
      options: ['"number"', '"nan"', '"undefined"', '"object"'],
      correctAnswerIndex: 0,
      explanation: 'In JavaScript according to the IEEE 754 floating-point standard, NaN represents "Not-a-Number", but its data type primitive is still numeric ("number").',
      hint: 'Even though its name stands for Not-a-Number, numeric arithmetic produced it.',
      difficulty: 'easy',
      category: 'JavaScript Fundamentals',
      codeSnippet: 'console.log(typeof NaN); // ?',
    },
    {
      id: 'js-2',
      question: 'Which of the following creates a microtask in the JavaScript event loop?',
      options: ['setTimeout() callback', 'Promise.then() callback', 'requestAnimationFrame()', 'setInterval() callback'],
      correctAnswerIndex: 1,
      explanation: 'Promise reactions (`.then`, `.catch`, `.finally`), `queueMicrotask()`, and `MutationObserver` callbacks run in the microtask queue, which is drained immediately after the current macrotask before rendering or timers.',
      hint: 'Think about asynchronous primitives introduced in ES6 that have priority over timers.',
      difficulty: 'medium',
      category: 'Event Loop & Asynchrony',
    },
    {
      id: 'js-3',
      question: 'What does `Object.freeze()` do compared to `Object.seal()`?',
      options: [
        'Freeze prevents adding new properties; Seal prevents deleting properties.',
        'Freeze makes existing properties read-only and non-configurable; Seal only prevents adding/removing properties.',
        'Seal prevents modifying prototype; Freeze only affects values.',
        'They are exact aliases with identical behavior in V8.',
      ],
      correctAnswerIndex: 1,
      explanation: '`Object.freeze()` creates a shallow immutable object where existing properties cannot be modified, reconfigured, or deleted. `Object.seal()` prevents adding and deleting properties, but allows modifying existing writable properties.',
      hint: 'One allows mutating existing values if writable was true, the other locks down all mutations.',
      difficulty: 'hard',
      category: 'Object Manipulation',
    },
    {
      id: 'js-4',
      question: 'Which array method does NOT mutate the original array in place?',
      options: ['Array.prototype.splice()', 'Array.prototype.sort()', 'Array.prototype.slice()', 'Array.prototype.reverse()'],
      correctAnswerIndex: 2,
      explanation: '`slice()` returns a shallow copy of a portion of an array without modifying the original array. In contrast, `splice()`, `sort()`, and `reverse()` modify the calling array in place.',
      hint: 'Three of these alter the caller directly; one is a pure non-destructive accessor.',
      difficulty: 'easy',
      category: 'Array Methods',
    },
    {
      id: 'js-5',
      question: 'What happens when accessing a variable declared with `let` before its declaration?',
      options: ['Returns undefined', 'Throws a ReferenceError (Temporal Dead Zone)', 'Returns null', 'Silently coerces to window property'],
      correctAnswerIndex: 1,
      explanation: 'Variables declared with `let` and `const` are hoisted to the top of their block scope, but are not initialized. Accessing them before declaration causes a ReferenceError due to the Temporal Dead Zone (TDZ).',
      hint: 'Unlike `var` which yields `undefined`, modern block-scoped declarations enforce strict timing.',
      difficulty: 'medium',
      category: 'Scope & Closures',
    },
  ],
  ai: [
    {
      id: 'ai-1',
      question: 'What key innovation introduced by the 2017 "Attention Is All You Need" paper revolutionized Natural Language Processing?',
      options: ['Recurrent Neural Networks (RNNs)', 'The Transformer architecture with Self-Attention', 'Convolutional feature pyramids', 'Support Vector Machines'],
      correctAnswerIndex: 1,
      explanation: 'Vaswani et al. introduced the Transformer architecture based solely on self-attention mechanisms, dispensing with recurrence and convolutions and enabling massively parallelized pre-training.',
      hint: 'The model architecture powering modern LLMs such as GPT, Claude, and Gemini.',
      difficulty: 'easy',
      category: 'AI Architectures',
    },
    {
      id: 'ai-2',
      question: 'In large language models, what is "temperature" primarily used to adjust?',
      options: [
        'The clock frequency of the GPU execution clusters',
        'The randomness and entropy of token selection during sampling',
        'The learning rate during fine-tuning updates',
        'The embedding vector dimensional size',
      ],
      correctAnswerIndex: 1,
      explanation: 'Temperature scales the model logits before the softmax activation. A lower temperature (e.g. 0.2) concentrates probability on top tokens for deterministic outputs, while higher temperature (e.g. 0.9) flattens distribution for creativity.',
      hint: 'Adjusting this dial between 0.0 and 1.0 makes responses either strictly predictable or more varied.',
      difficulty: 'medium',
      category: 'LLM Sampling',
    },
    {
      id: 'ai-3',
      question: 'What does RAG stand for in modern generative AI application stacks?',
      options: [
        'Recurrent Artificial Gradient',
        'Retrieval-Augmented Generation',
        'Reinforced Agent Graph',
        'Residual Attention Guidance',
      ],
      correctAnswerIndex: 1,
      explanation: 'Retrieval-Augmented Generation (RAG) fetches relevant chunks from an external knowledge base or vector database and passes them in the prompt context to ground the LLM response in factual data.',
      hint: 'Technique that searches a document store before generating an answer.',
      difficulty: 'easy',
      category: 'Generative AI Concepts',
    },
    {
      id: 'ai-4',
      question: 'What is the purpose of RLHF (Reinforcement Learning from Human Feedback)?',
      options: [
        'To increase the context window size of neural networks',
        'To align the model outputs with human intentions, helpfulness, and safety guidelines',
        'To compress weights into 4-bit quantized formats',
        'To scrape additional training data automatically from websites',
      ],
      correctAnswerIndex: 1,
      explanation: 'RLHF uses reward models trained on human preferences to steer base models towards being helpful, truthful, and harmless through algorithms like PPO or DPO.',
      hint: 'Aligning behavior rather than just predicting next tokens.',
      difficulty: 'medium',
      category: 'Model Alignment',
    },
    {
      id: 'ai-5',
      question: 'Which vector similarity metric computes the cosine of the angle between two embedding vectors regardless of their magnitude?',
      options: ['Cosine Similarity', 'Manhattan Distance (L1)', 'Euclidean Distance (L2)', 'Jaccard Index'],
      correctAnswerIndex: 0,
      explanation: 'Cosine similarity measures orientation rather than magnitude: cos(θ) = (A · B) / (||A|| ||B||), making it invariant to vector lengths.',
      hint: 'It ranges from -1 to 1 (or 0 to 1 for normalized non-negative vectors).',
      difficulty: 'medium',
      category: 'Vector Embeddings',
    },
  ],
  general: [
    {
      id: 'gen-1',
      question: 'Which planetary body in the Solar System possesses the highest surface atmospheric pressure?',
      options: ['Mars', 'Venus', 'Mercury', 'Titan'],
      correctAnswerIndex: 1,
      explanation: 'Venus has an extremely dense carbon dioxide atmosphere with a surface pressure about 92 times that of Earth (equivalent to being roughly 900 meters underwater).',
      hint: 'The hottest planet in our solar system, shrouded in thick sulfuric acid clouds.',
      difficulty: 'medium',
      category: 'Astronomy',
    },
    {
      id: 'gen-2',
      question: 'What is the primary function of mitochondria in eukaryotic cells?',
      options: ['Protein translation on ribosomes', 'Synthesizing ATP via oxidative phosphorylation', 'Packaging lipids in vesicles', 'Storing genetic chromosomes exclusively'],
      correctAnswerIndex: 1,
      explanation: 'Mitochondria are known as the cellular powerhouses because they produce the vast majority of cellular adenosine triphosphate (ATP) through the citric acid cycle and oxidative phosphorylation.',
      hint: 'Known colloquially as the "powerhouse of the cell".',
      difficulty: 'easy',
      category: 'Biology',
    },
    {
      id: 'gen-3',
      question: 'In cryptography, what makes asymmetric public-key cryptography fundamentally different from symmetric encryption?',
      options: [
        'It runs faster than symmetric encryption algorithms',
        'It uses a mathematically linked pair of keys (public and private) instead of a single shared secret',
        'It does not require any mathematical primes',
        'It cannot be deciphered even with the original key',
      ],
      correctAnswerIndex: 1,
      explanation: 'Asymmetric cryptography (like RSA or ECC) uses a key pair: a public key for encryption or verification, and a private key kept secret for decryption or digital signatures.',
      hint: 'Diffie-Hellman, RSA, and SSH rely on this pair concept.',
      difficulty: 'medium',
      category: 'Computer Science',
    },
    {
      id: 'gen-4',
      question: 'Who developed the general theory of relativity published in 1915?',
      options: ['Isaac Newton', 'Niels Bohr', 'Albert Einstein', 'James Clerk Maxwell'],
      correctAnswerIndex: 2,
      explanation: 'Albert Einstein published his General Theory of Relativity in 1915, describing gravity not as an invisible force, but as the curvature of spacetime caused by mass and energy.',
      hint: 'Physicist who won the 1921 Nobel Prize for explaining the photoelectric effect.',
      difficulty: 'easy',
      category: 'Physics',
    },
    {
      id: 'gen-5',
      question: 'What is the time complexity of searching for an element in a balanced Binary Search Tree (such as an AVL or Red-Black tree)?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      correctAnswerIndex: 1,
      explanation: 'In a balanced binary search tree with n nodes, the height is bounded by O(log n). Each comparison halves the remaining search space, resulting in O(log n) time complexity.',
      hint: 'Dividing the search space by half at each step.',
      difficulty: 'easy',
      category: 'Algorithms',
    },
  ],
};

export function getFallbackQuiz(
  topic: string,
  count: number = 5,
  difficulty: DifficultyLevel = 'medium',
  mode: QuizMode = 'instant',
  timePerQuestion: number = 30
): Quiz {
  const normalized = topic.toLowerCase();
  let selectedQuestions: Question[] = [];

  if (normalized.includes('js') || normalized.includes('javascript') || normalized.includes('react') || normalized.includes('web')) {
    selectedQuestions = FALLBACK_TOPIC_DATA.javascript;
  } else if (normalized.includes('ai') || normalized.includes('machine') || normalized.includes('llm') || normalized.includes('gpt') || normalized.includes('groq')) {
    selectedQuestions = FALLBACK_TOPIC_DATA.ai;
  } else {
    selectedQuestions = FALLBACK_TOPIC_DATA.general;
  }

  // If user requested more than in static pool, duplicate with modified indexes or synthesize clean items
  const questions: Question[] = [];
  const targetCount = Math.min(count, 20);

  for (let i = 0; i < targetCount; i++) {
    const base = selectedQuestions[i % selectedQuestions.length];
    questions.push({
      ...base,
      id: `q-${i + 1}-${Date.now().toString(36)}`,
      difficulty: difficulty === 'mixed' ? (i % 3 === 0 ? 'easy' : i % 3 === 1 ? 'medium' : 'hard') : difficulty,
    });
  }

  return {
    id: `quiz-${Date.now().toString(36)}`,
    title: topic.trim() ? `${topic.charAt(0).toUpperCase() + topic.slice(1)} Mastery Quiz` : 'Comprehensive Knowledge Quiz',
    description: `A carefully curated ${questions.length}-question assessment focusing on key concepts, practical scenarios, and core principles.`,
    topic: topic || 'General Knowledge',
    difficulty,
    questionType: 'multiple_choice',
    questions,
    createdAt: new Date().toISOString(),
    totalQuestions: questions.length,
    timePerQuestionSeconds: timePerQuestion,
    mode,
  };
}
