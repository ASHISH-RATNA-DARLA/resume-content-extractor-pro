
import { supabase } from '@/integrations/supabase/client';

interface ResumeData {
  id: string;
  fileName: string;
  extractedText: string;
  parsedAt: string;
  fileType: string;
  userId?: string;
}

interface Question {
  category: string;
  question: string;
  difficulty: string;
}

export async function saveResumeToSupabase(resumeData: ResumeData): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Insert resume data
    const { data, error } = await supabase
      .from('resumes')
      .insert({
        id: resumeData.id,
        file_name: resumeData.fileName,
        file_type: resumeData.fileType,
        extracted_text: resumeData.extractedText,
        parsed_at: resumeData.parsedAt,
        user_id: user?.id || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving resume to Supabase:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error saving resume:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function saveQuestionsToSupabase(resumeId: string, questions: Question[]): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const questionInserts = questions.map(q => ({
      resume_id: resumeId,
      category: q.category,
      question: q.question,
      difficulty: q.difficulty
    }));

    const { error } = await supabase
      .from('resume_questions')
      .insert(questionInserts);

    if (error) {
      console.error('Error saving questions to Supabase:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error saving questions:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function getResumesFromSupabase(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('resumes')
      .select(`
        *,
        resume_questions (
          id,
          category,
          question,
          difficulty
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching resumes from Supabase:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error fetching resumes:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
