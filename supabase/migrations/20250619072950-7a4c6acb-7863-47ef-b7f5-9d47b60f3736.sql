
-- Create a table to store resume data
CREATE TABLE public.resumes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  extracted_text TEXT NOT NULL,
  parsed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only see their own resumes
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT their own resumes
CREATE POLICY "Users can view their own resumes" 
  ON public.resumes 
  FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Create policy that allows users to INSERT their own resumes
CREATE POLICY "Users can create their own resumes" 
  ON public.resumes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Create policy that allows users to UPDATE their own resumes
CREATE POLICY "Users can update their own resumes" 
  ON public.resumes 
  FOR UPDATE 
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Create policy that allows users to DELETE their own resumes
CREATE POLICY "Users can delete their own resumes" 
  ON public.resumes 
  FOR DELETE 
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Create a table to store generated questions for each resume
CREATE TABLE public.resume_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS to resume_questions table
ALTER TABLE public.resume_questions ENABLE ROW LEVEL SECURITY;

-- Create policy for resume_questions
CREATE POLICY "Users can view questions for their own resumes" 
  ON public.resume_questions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.resumes 
      WHERE resumes.id = resume_questions.resume_id 
      AND (resumes.user_id = auth.uid() OR resumes.user_id IS NULL)
    )
  );

CREATE POLICY "Users can create questions for their own resumes" 
  ON public.resume_questions 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.resumes 
      WHERE resumes.id = resume_questions.resume_id 
      AND (resumes.user_id = auth.uid() OR resumes.user_id IS NULL)
    )
  );
