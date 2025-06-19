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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Filters */}
            <div className="md:col-span-1 space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Filters</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tech-stack">Tech Stack</Label>
                    <Select value={techStackFilter} onValueChange={setTechStackFilter}>
                      <SelectTrigger id="tech-stack">
                        <SelectValue placeholder="All Tech Stacks" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Tech Stacks</SelectItem>
                        {techStacks.map((stack) => (
                          <SelectItem key={stack} value={stack}>{stack}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                      <SelectTrigger id="difficulty">
                        <SelectValue placeholder="All Difficulties" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Difficulties</SelectItem>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button variant="outline" onClick={handleResetFilters} className="w-full">
                    Reset Filters
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-2">Question Types</h3>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center justify-between">
                    <span>Multiple Choice</span>
                    <Badge variant="outline">MCQ</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Short Answer</span>
                    <Badge variant="outline">50-100 words</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Long Answer</span>
                    <Badge variant="outline">150-300 words</Badge>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Questions List and Details */}
            <div className="md:col-span-2">
              <Tabs defaultValue="questions" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="questions">Questions</TabsTrigger>
                  <TabsTrigger value="selected" disabled={!selectedQuestion}>Selected Question</TabsTrigger>
                </TabsList>
                
                <TabsContent value="questions" className="space-y-4">
                  <div className="rounded-md border">
                    <div className="p-4">
                      <h3 className="text-lg font-medium">Available Questions ({filteredQuestions.length})</h3>
                      <p className="text-sm text-muted-foreground">
                        Click on a question to view details and answer
                      </p>
                    </div>
                    
                    <div className="max-h-[500px] overflow-y-auto">
                      {filteredQuestions.length > 0 ? (
                        filteredQuestions.map((question) => (
                          <div 
                            key={question.id}
                            className="border-t p-4 cursor-pointer hover:bg-muted transition-colors"
                            onClick={() => handleQuestionSelect(question)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">{question.question_text}</h4>
                              <div className="flex space-x-2">
                                <Badge variant="outline">{question.question_type}</Badge>
                                {renderDifficultyBadge(question.difficulty_level)}
                              </div>
                            </div>
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>{question.tech_stack}</span>
                              <span>{question.topic}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <p className="text-muted-foreground">No questions match your filters</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="selected">
                  {selectedQuestion && (
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{selectedQuestion.question_text}</CardTitle>
                            <CardDescription>
                              {selectedQuestion.tech_stack} - {selectedQuestion.topic}
                            </CardDescription>
                          </div>
                          <div className="flex space-x-2">
                            <Badge variant="outline">{selectedQuestion.question_type}</Badge>
                            {renderDifficultyBadge(selectedQuestion.difficulty_level)}
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        {selectedQuestion.question_type === 'mcq' ? (
                          <div className="space-y-4">
                            <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                              {mcqOptions.map((option) => (
                                <div key={option.id} className="flex items-center space-x-2">
                                  <RadioGroupItem value={option.id} id={option.id} />
                                  <Label htmlFor={option.id} className="cursor-pointer">
                                    {option.option_label}. {option.option_text}
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <Label htmlFor="answer">Your Answer</Label>
                            <Textarea
                              id="answer"
                              placeholder="Type your answer here..."
                              value={userAnswer}
                              onChange={(e) => setUserAnswer(e.target.value)}
                              rows={6}
                            />
                            <p className="text-sm text-muted-foreground">
                              {selectedQuestion.question_type === 'short_answer' 
                                ? 'Provide a brief explanation (50-100 words)' 
                                : 'Provide a detailed explanation (150-300 words)'}
                            </p>
                          </div>
                        )}
                      </CardContent>
                      
                      <CardFooter className="flex justify-between">
                        <Button 
                          variant="outline" 
                          onClick={() => setSelectedQuestion(null)}
                        >
                          Back to Questions
                        </Button>
                        <Button 
                          onClick={handleSubmitAnswer}
                          disabled={submitting}
                        >
                          {submitting ? 'Submitting...' : 'Submit Answer'}
                        </Button>
                      </CardFooter>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TechnicalQuestions;
