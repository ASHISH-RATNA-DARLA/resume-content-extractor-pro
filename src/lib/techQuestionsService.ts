import { supabase } from './supabase';

// Types for our technical questions data
export interface TechnicalQuestion {
  id: string;
  question_text: string;
  question_type: 'mcq' | 'short_answer' | 'long_answer';
  tech_stack: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  topic: string;
  is_premium: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MCQOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  option_label: 'A' | 'B' | 'C' | 'D';
}

export interface ExpectedAnswer {
  id: string;
  question_id: string;
  sample_answer: string;
  key_points?: any;
  scoring_criteria?: string;
}

export interface UserResponse {
  id: string;
  user_id: string;
  question_id: string;
  user_answer: string;
  ai_score?: number;
  ai_feedback?: string;
  time_taken?: number;
  created_at?: string;
}

// Service functions for technical questions
export const techQuestionsService = {
  // Get all technical questions
  async getAllQuestions(): Promise<TechnicalQuestion[]> {
    const { data, error } = await supabase
      .from('technical_questions')
      .select('*');
    
    if (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
    
    return data || [];
  },
  
  // Get questions by tech stack
  async getQuestionsByTechStack(techStack: string): Promise<TechnicalQuestion[]> {
    const { data, error } = await supabase
      .from('technical_questions')
      .select('*')
      .eq('tech_stack', techStack);
    
    if (error) {
      console.error(`Error fetching questions for tech stack ${techStack}:`, error);
      throw error;
    }
    
    return data || [];
  },
  
  // Get questions by difficulty level
  async getQuestionsByDifficulty(level: 'easy' | 'medium' | 'hard'): Promise<TechnicalQuestion[]> {
    const { data, error } = await supabase
      .from('technical_questions')
      .select('*')
      .eq('difficulty_level', level);
    
    if (error) {
      console.error(`Error fetching questions for difficulty ${level}:`, error);
      throw error;
    }
    
    return data || [];
  },
  
  // Get a specific question with its options or expected answers
  async getQuestionWithDetails(questionId: string): Promise<{
    question: TechnicalQuestion;
    mcqOptions?: MCQOption[];
    expectedAnswer?: ExpectedAnswer;
  }> {
    // Get the question
    const { data: questionData, error: questionError } = await supabase
      .from('technical_questions')
      .select('*')
      .eq('id', questionId)
      .single();
    
    if (questionError) {
      console.error(`Error fetching question ${questionId}:`, questionError);
      throw questionError;
    }
    
    const question = questionData as TechnicalQuestion;
    
    // Get MCQ options if it's an MCQ question
    if (question.question_type === 'mcq') {
      const { data: optionsData, error: optionsError } = await supabase
        .from('mcq_options')
        .select('*')
        .eq('question_id', questionId);
      
      if (optionsError) {
        console.error(`Error fetching MCQ options for question ${questionId}:`, optionsError);
        throw optionsError;
      }
      
      return {
        question,
        mcqOptions: optionsData as MCQOption[]
      };
    } 
    // Get expected answer for short/long answer questions
    else {
      const { data: answerData, error: answerError } = await supabase
        .from('expected_answers')
        .select('*')
        .eq('question_id', questionId)
        .single();
      
      if (answerError) {
        console.error(`Error fetching expected answer for question ${questionId}:`, answerError);
        throw answerError;
      }
      
      return {
        question,
        expectedAnswer: answerData as ExpectedAnswer
      };
    }
  },
  
  // Submit a user response
  async submitUserResponse(response: Omit<UserResponse, 'id' | 'created_at'>): Promise<UserResponse> {
    const { data, error } = await supabase
      .from('user_responses')
      .insert(response)
      .select()
      .single();
    
    if (error) {
      console.error('Error submitting user response:', error);
      throw error;
    }
    
    return data as UserResponse;
  },
  
  // Get user responses for a specific user
  async getUserResponses(userId: string): Promise<UserResponse[]> {
    const { data, error } = await supabase
      .from('user_responses')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error(`Error fetching responses for user ${userId}:`, error);
      throw error;
    }
    
    return data || [];
  }
};