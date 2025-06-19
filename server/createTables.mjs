import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with the correct URL and service role key
const supabaseUrl = 'https://qlwyyizfvcersgxbckei.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsd3l5aXpmdmNlcnNneGJja2VpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxODk1MjQ3NywiZXhwIjoyMDM0NTI4NDc3fQ.Yd_6-TbcB62Qcw-0RqPQnA-_MWgzH1QQnBnWqZDYnqE';
const supabase = createClient(supabaseUrl, supabaseKey);

// Create sample technical questions
async function createSampleData() {
  console.log('Creating sample technical questions...');
  
  try {
    // First, check if data already exists
    const { data: existingQuestions, error: checkError } = await supabase
      .from('technical_questions')
      .select('id')
      .limit(1);
    
    if (!checkError && existingQuestions && existingQuestions.length > 0) {
      console.log('Sample data already exists. Skipping creation.');
      return;
    }
    
    // Create sample technical questions
    const { data: questions, error: questionsError } = await supabase
      .from('technical_questions')
      .insert([
        {
          question_text: 'What is the difference between let, const, and var in JavaScript?',
          question_type: 'long_answer',
          tech_stack: 'JavaScript',
          difficulty_level: 'medium',
          topic: 'Variables and Scoping',
          is_premium: false
        },
        {
          question_text: 'Explain the concept of React hooks and give examples of commonly used hooks.',
          question_type: 'long_answer',
          tech_stack: 'React',
          difficulty_level: 'medium',
          topic: 'React Hooks',
          is_premium: false
        },
        {
          question_text: 'What is the time complexity of quicksort in the worst case?',
          question_type: 'mcq',
          tech_stack: 'Algorithms',
          difficulty_level: 'hard',
          topic: 'Sorting Algorithms',
          is_premium: false
        }
      ])
      .select();
    
    if (questionsError) {
      throw questionsError;
    }
    
    console.log('Created sample technical questions:', questions);
    
    // Create MCQ options for the quicksort question
    if (questions && questions.length > 0) {
      const quicksortQuestion = questions.find(q => q.question_text.includes('quicksort'));
      
      if (quicksortQuestion) {
        const { data: options, error: optionsError } = await supabase
          .from('mcq_options')
          .insert([
            {
              question_id: quicksortQuestion.id,
              option_text: 'O(n)',
              is_correct: false,
              option_label: 'A'
            },
            {
              question_id: quicksortQuestion.id,
              option_text: 'O(n log n)',
              is_correct: false,
              option_label: 'B'
            },
            {
              question_id: quicksortQuestion.id,
              option_text: 'O(n²)',
              is_correct: true,
              option_label: 'C'
            },
            {
              question_id: quicksortQuestion.id,
              option_text: 'O(2ⁿ)',
              is_correct: false,
              option_label: 'D'
            }
          ])
          .select();
        
        if (optionsError) {
          throw optionsError;
        }
        
        console.log('Created MCQ options for quicksort question:', options);
      }
      
      // Create expected answers for the other questions
      const jsQuestion = questions.find(q => q.question_text.includes('JavaScript'));
      const reactQuestion = questions.find(q => q.question_text.includes('React hooks'));
      
      if (jsQuestion || reactQuestion) {
        const expectedAnswers = [];
        
        if (jsQuestion) {
          expectedAnswers.push({
            question_id: jsQuestion.id,
            sample_answer: 'let allows block-scoped variables that can be reassigned. const declares block-scoped constants that cannot be reassigned. var declares function-scoped variables that can be reassigned and are hoisted.',
            key_points: ['Block scope vs function scope', 'Reassignment capabilities', 'Hoisting behavior', 'Temporal dead zone'],
            scoring_criteria: 'Accuracy, completeness, and examples provided'
          });
        }
        
        if (reactQuestion) {
          expectedAnswers.push({
            question_id: reactQuestion.id,
            sample_answer: 'React hooks are functions that let you use state and other React features in functional components. Common hooks include useState for state management, useEffect for side effects, useContext for context API, useRef for references, and useReducer for complex state logic.',
            key_points: ['useState', 'useEffect', 'useContext', 'useRef', 'useReducer', 'Custom hooks'],
            scoring_criteria: 'Understanding of hooks concept, examples, and use cases'
          });
        }
        
        const { data: answers, error: answersError } = await supabase
          .from('expected_answers')
          .insert(expectedAnswers)
          .select();
        
        if (answersError) {
          throw answersError;
        }
        
        console.log('Created expected answers:', answers);
      }
    }
    
    console.log('Sample data creation completed successfully!');
  } catch (error) {
    console.error('Error creating sample data:', error);
  }
}

// Run the function
createSampleData();