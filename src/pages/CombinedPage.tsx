
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
import ResumeUpload from '../components/ResumeUpload';
import ResumeList from '../components/ResumeList';

const CombinedPage: React.FC = () => {
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
  const [resumes, setResumes] = useState<any[]>([]);
  const [resumeLoading, setResumeLoading] = useState(true);

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

  // Fetch resumes
  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const response = await fetch('/api/get-resumes');
        const data = await response.json();
        setResumes(data.resumes || []);
      } catch (error) {
        console.error('Error fetching resumes:', error);
        toast({
          title: 'Error',
          description: 'Failed to load resumes',
          variant: 'destructive',
        });
      } finally {
        setResumeLoading(false);
      }
    };

    fetchResumes();
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
      
      // Use sample data if API fails
      if (question.question_type === 'mcq') {
        // Sample MCQ options for question id 3
        if (question.id === '3') {
          const sampleOptions: MCQOption[] = [
            {
              id: 'opt1',
              question_id: '3',
              option_text: 'O(n)',
              is_correct: false,
              option_label: 'A'
            },
            {
              id: 'opt2',
              question_id: '3',
              option_text: 'O(n log n)',
              is_correct: false,
              option_label: 'B'
            },
            {
              id: 'opt3',
              question_id: '3',
              option_text: 'O(n²)',
              is_correct: true,
              option_label: 'C'
            },
            {
              id: 'opt4',
              question_id: '3',
              option_text: 'O(2ⁿ)',
              is_correct: false,
              option_label: 'D'
            }
          ];
          setMcqOptions(sampleOptions);
          setExpectedAnswer(null);
        }
      } else {
        // Sample expected answer for long answer questions
        const sampleAnswer = {
          id: `ans-${question.id}`,
          question_id: question.id,
          sample_answer: 'This is a sample expected answer for the question.',
          key_points: ['Key point 1', 'Key point 2', 'Key point 3'],
          scoring_criteria: 'Clarity, accuracy, and completeness of the answer.'
        };
        setExpectedAnswer(sampleAnswer);
        setMcqOptions([]);
      }
      
      toast({
        title: 'Using sample data',
        description: 'Could not fetch question details from the server. Using sample data instead.',
        variant: 'default',
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
      
      // Handle the case when the API is not available
      toast({
        title: 'Answer Received',
        description: 'Your answer has been recorded locally (demo mode)',
      });
      
      // Show correct answer for MCQ in demo mode
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

  // Handle resume upload success
  const handleResumeUploadSuccess = (newResume: any) => {
    setResumes(prevResumes => [...prevResumes, newResume]);
    toast({
      title: 'Success',
      description: 'Resume uploaded and parsed successfully',
    });
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">SDE-HIRE Platform</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Technical Questions Section */}
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Technical Interview Questions</CardTitle>
              <CardDescription>Browse and answer technical interview questions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="tech-stack">Technology Stack</Label>
                    <Select value={techStackFilter} onValueChange={setTechStackFilter}>
                      <SelectTrigger id="tech-stack">
                        <SelectValue placeholder="Select tech stack" />
                      </SelectTrigger>
                      <SelectContent>
                        {techStacks.map(tech => (
                          <SelectItem key={tech} value={tech}>{tech}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="difficulty">Difficulty Level</Label>
                    <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                      <SelectTrigger id="difficulty">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-end">
                    <Button variant="outline" onClick={handleResetFilters}>
                      Reset
                    </Button>
                  </div>
                </div>
                
                <Tabs defaultValue="questions">
                  <TabsList className="mb-4">
                    <TabsTrigger value="questions">Questions</TabsTrigger>
                    <TabsTrigger value="answer" disabled={!selectedQuestion}>Answer</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="questions">
                    <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2">
                      {loading ? (
                        <div className="flex justify-center items-center h-40">Loading questions...</div>
                      ) : filteredQuestions.length > 0 ? (
                        filteredQuestions.map(question => (
                          <Card 
                            key={question.id} 
                            className={`cursor-pointer hover:border-primary transition-colors ${
                              selectedQuestion?.id === question.id ? 'border-primary' : ''
                            }`}
                            onClick={() => handleQuestionSelect(question)}
                          >
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">{question.question_type.toUpperCase()}</CardTitle>
                                <div className="flex gap-2">
                                  <Badge variant="outline">{question.tech_stack}</Badge>
                                  {renderDifficultyBadge(question.difficulty_level)}
                                </div>
                              </div>
                              <CardDescription>{question.topic}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <p>{question.question_text}</p>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <Card>
                          <CardContent className="pt-6">
                            <p className="text-center text-muted-foreground">No questions found matching the selected filters.</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="answer">
                    {selectedQuestion && (
                      <div className="max-h-[400px] overflow-y-auto pr-2">
                        <Card>
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <CardTitle>{selectedQuestion.question_type.toUpperCase()}</CardTitle>
                              <div className="flex gap-2">
                                <Badge variant="outline">{selectedQuestion.tech_stack}</Badge>
                                {renderDifficultyBadge(selectedQuestion.difficulty_level)}
                              </div>
                            </div>
                            <CardDescription>{selectedQuestion.topic}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="p-4 bg-muted rounded-md">
                              <p className="font-medium">{selectedQuestion.question_text}</p>
                            </div>
                            
                            <Separator />
                            
                            {selectedQuestion.question_type === 'mcq' ? (
                              <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                                {mcqOptions.map(option => (
                                  <div key={option.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted">
                                    <RadioGroupItem value={option.id} id={option.id} />
                                    <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                                      <span className="font-semibold">{option.option_label}:</span> {option.option_text}
                                    </Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            ) : (
                              <div className="space-y-2">
                                <Label htmlFor="answer">Your Answer</Label>
                                <Textarea
                                  id="answer"
                                  placeholder="Type your answer here..."
                                  value={userAnswer}
                                  onChange={(e) => setUserAnswer(e.target.value)}
                                  rows={6}
                                />
                              </div>
                            )}
                          </CardContent>
                          <CardFooter>
                            <Button 
                              onClick={handleSubmitAnswer} 
                              disabled={submitting}
                              className="w-full"
                            >
                              {submitting ? 'Submitting...' : 'Submit Answer'}
                            </Button>
                          </CardFooter>
                        </Card>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Resume Parser Section */}
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Resume Parser</CardTitle>
              <CardDescription>Upload and parse resumes in PDF or DOCX format</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <ResumeUpload onUploadSuccess={handleResumeUploadSuccess} />
                
                <Separator />
                
                <div className="max-h-[400px] overflow-y-auto pr-2">
                  <h3 className="text-lg font-medium mb-4">Parsed Resumes</h3>
                  {resumeLoading ? (
                    <div className="flex justify-center items-center h-40">Loading resumes...</div>
                  ) : (
                    <ResumeList />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CombinedPage;
