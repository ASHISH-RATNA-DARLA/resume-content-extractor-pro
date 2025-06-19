import React, { useState, useEffect } from 'react';
import { useToast } from '../hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import { TechnicalQuestion, MCQOption } from '../lib/techQuestionsService';

const TechnicalQuestions: React.FC = () => {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<TechnicalQuestion[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<TechnicalQuestion[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<TechnicalQuestion | null>(null);
  const [mcqOptions, setMcqOptions] = useState<MCQOption[]>([]);
  const [expectedAnswer, setExpectedAnswer] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [techStackFilter, setTechStackFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [techStacks, setTechStacks] = useState<string[]>([]);

  // Fetch all questions on component mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('/api/tech-questions');
        const data = await response.json();
        
        if (data.questions) {
          setQuestions(data.questions);
          setFilteredQuestions(data.questions);
          
          // Extract unique tech stacks with proper type checking
          const uniqueTechStacks = [...new Set(data.questions.map((q: TechnicalQuestion) => q.tech_stack))].filter((stack): stack is string => typeof stack === 'string');
          setTechStacks(uniqueTechStacks);
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
        
        // Use sample data if API fails
        const sampleQuestions: TechnicalQuestion[] = [
          {
            id: '1',
            question_text: 'What is the difference between let, const, and var in JavaScript?',
            question_type: 'long_answer',
            tech_stack: 'JavaScript',
            difficulty_level: 'medium',
            topic: 'Variables and Scoping',
            is_premium: false,
          },
          {
            id: '2',
            question_text: 'Explain the concept of React hooks and give examples of commonly used hooks.',
            question_type: 'long_answer',
            tech_stack: 'React',
            difficulty_level: 'medium',
            topic: 'React Hooks',
            is_premium: false,
          },
          {
            id: '3',
            question_text: 'What is the time complexity of quicksort in the worst case?',
            question_type: 'mcq',
            tech_stack: 'Algorithms',
            difficulty_level: 'hard',
            topic: 'Sorting Algorithms',
            is_premium: false,
          }
        ];
        
        setQuestions(sampleQuestions);
        setFilteredQuestions(sampleQuestions);
        
        // Extract unique tech stacks
        const uniqueTechStacks = [...new Set(sampleQuestions.map((q) => q.tech_stack))];
        setTechStacks(uniqueTechStacks);
        
        toast({
          title: 'Using sample data',
          description: 'Could not connect to the questions database. Using sample questions instead.',
          variant: 'default',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [toast]);

  // Apply filters when filter values change
  useEffect(() => {
    let filtered = [...questions];
    
    if (techStackFilter) {
      filtered = filtered.filter(q => q.tech_stack === techStackFilter);
    }
    
    if (difficultyFilter) {
      filtered = filtered.filter(q => q.difficulty_level === difficultyFilter);
    }
    
    setFilteredQuestions(filtered);
  }, [techStackFilter, difficultyFilter, questions]);

  // Fetch question details when a question is selected
  const handleQuestionSelect = async (question: TechnicalQuestion) => {
    setSelectedQuestion(question);
    setUserAnswer('');
    setSelectedOption('');
    
    try {
      const response = await fetch(`/api/tech-questions/${question.id}`);
      const data = await response.json();
      
      if (question.question_type === 'mcq' && data.mcqOptions) {
        setMcqOptions(data.mcqOptions);
        setExpectedAnswer(null);
      } else if (data.expectedAnswer) {
        setExpectedAnswer(data.expectedAnswer);
        setMcqOptions([]);
      }
    } catch (error) {
      console.error('Error fetching question details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load question details',
        variant: 'destructive',
      });
    }
  };

  // Submit user's answer
  const handleSubmitAnswer = async () => {
    if (!selectedQuestion) return;
    
    // Validate answer
    if (selectedQuestion.question_type === 'mcq' && !selectedOption) {
      toast({
        title: 'Error',
        description: 'Please select an option',
        variant: 'destructive',
      });
      return;
    }
    
    if (selectedQuestion.question_type !== 'mcq' && !userAnswer.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide an answer',
        variant: 'destructive',
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/tech-questions/submit-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'demo-user', // Replace with actual user ID in a real app
          question_id: selectedQuestion.id,
          user_answer: selectedQuestion.question_type === 'mcq' ? selectedOption : userAnswer,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Your answer has been submitted',
        });
        
        // Show correct answer for MCQ
        if (selectedQuestion.question_type === 'mcq') {
          const correctOption = mcqOptions.find(option => option.is_correct);
          if (correctOption) {
            toast({
              title: 'Correct Answer',
              description: `The correct answer is ${correctOption.option_label}: ${correctOption.option_text}`,
              variant: selectedOption === correctOption.id ? 'default' : 'destructive',
            });
          }
        }
      } else {
        throw new Error(data.error || 'Failed to submit answer');
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit your answer',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setTechStackFilter('');
    setDifficultyFilter('');
  };

  // Render difficulty badge with appropriate color
  const renderDifficultyBadge = (difficulty: string) => {
    let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
    
    switch (difficulty) {
      case 'easy':
        variant = 'default';
        break;
      case 'medium':
        variant = 'secondary';
        break;
      case 'hard':
        variant = 'destructive';
        break;
      default:
        variant = 'outline';
    }
    
    return <Badge variant={variant}>{difficulty}</Badge>;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading technical questions...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Technical Interview Questions</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Technical Interview Simulator</CardTitle>
          <CardDescription>Practice technical interview questions across different tech stacks and difficulty levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filter controls and question list components would go here */}
            <div className="text-center py-8">
              <p className="text-muted-foreground">Technical questions interface coming soon...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TechnicalQuestions;
