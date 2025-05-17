import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallbacks for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Flag to indicate if we're using mock data
export const isUsingMockData = !supabaseUrl || !supabaseAnonKey;

// Create a single supabase client for the browser
export const supabase = createClient(
  isUsingMockData ? 'https://mock.supabase.co' : supabaseUrl,
  isUsingMockData ? 'mock-anon-key' : supabaseAnonKey
);

// Log the current mode for debugging
console.log(`Supabase client initialized in ${isUsingMockData ? 'MOCK' : 'REAL'} mode`);

// Mock data implementations
export const mockData = {
  // Mock user data
  user: {
    id: 'mock-user-id',
    email: 'user@example.com',
    plan: 'free',
    aiTokensRemaining: 2,
    aiTokensUsed: 0
  },
  
  // Mock questions data
  questions: Array(50).fill(null).map((_, index) => ({
    id: `question-${index}`,
    stem: `This is a sample question #${index + 1}. It tests your knowledge about a specific topic related to the GED exam. What is the correct answer?`,
    choices: [
      { label: 'A', text: 'First possible answer that could be correct or incorrect.' },
      { label: 'B', text: 'Second possible answer with different wording and approach.' },
      { label: 'C', text: 'Third option that presents another perspective on the question.' },
      { label: 'D', text: 'Fourth and final option to consider for this question.' },
    ],
    correct_choice: Math.floor(Math.random() * 4),
    difficulty: Math.floor(Math.random() * 5) + 1,
    subject: {
      id: `subject-${Math.floor(index / 10)}`,
      name: ['Mathematical Reasoning', 'Reasoning Through Language Arts', 'Science', 'Social Studies', 'General'][Math.floor(index / 10)]
    }
  })),
  
  // Mock user answers
  userAnswers: Array(30).fill(null).map((_, index) => ({
    id: `answer-${index}`,
    question_id: `question-${index}`,
    user_id: 'mock-user-id',
    selected_choice: Math.floor(Math.random() * 4),
    is_correct: Math.random() > 0.3, // 70% correct answers for demo
    response_time: Math.floor(Math.random() * 60) + 10, // 10-70 seconds
    created_at: new Date(Date.now() - (index * 86400000)).toISOString(), // Last 30 days
    question: {
      id: `question-${index}`,
      stem: `This is a sample question #${index + 1} that the user has answered.`,
      choices: [
        { label: 'A', text: 'First possible answer that could be correct or incorrect.' },
        { label: 'B', text: 'Second possible answer with different wording and approach.' },
        { label: 'C', text: 'Third option that presents another perspective on the question.' },
        { label: 'D', text: 'Fourth and final option to consider for this question.' },
      ],
      correct_choice: Math.floor(Math.random() * 4),
      difficulty: Math.floor(Math.random() * 5) + 1,
      subject: {
        id: `subject-${Math.floor(index / 6)}`,
        name: ['Mathematical Reasoning', 'Reasoning Through Language Arts', 'Science', 'Social Studies', 'General'][Math.floor(index / 6) % 5]
      }
    }
  })),
  
  // Mock subjects
  subjects: [
    { id: 'subject-0', name: 'Mathematical Reasoning' },
    { id: 'subject-1', name: 'Reasoning Through Language Arts' },
    { id: 'subject-2', name: 'Science' },
    { id: 'subject-3', name: 'Social Studies' },
    { id: 'subject-4', name: 'General' }
  ]
};
