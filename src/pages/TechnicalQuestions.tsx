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
          
          // Extract unique tech stacks
          const uniqueTechStacks = [...new Set(data.questions.map((q: TechnicalQuestion) => q.tech_stack))];
          setTechStacks(uniqueTechStacks);
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
        toast({
          title: 'Error',
          description: 'Failed to load technical questions',
          variant: 'destructive',
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
      <h1 className="text-3xl font-bold mb-6">Technical Interview Questions</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filters */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Filter questions by category</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
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
              
              <div className="space-y-2">
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
              
              <Button variant="outline" onClick={handleResetFilters} className="w-full">
                Reset Filters
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Questions and Answer Section */}
        <div className="md:col-span-3">
          <Tabs defaultValue="questions">
            <TabsList className="mb-4">
              <TabsTrigger value="questions">Questions</TabsTrigger>
              <TabsTrigger value="answer" disabled={!selectedQuestion}>Answer</TabsTrigger>
            </TabsList>
            
            <TabsContent value="questions">
              <div className="grid grid-cols-1 gap-4">
                {filteredQuestions.length > 0 ? (
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
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default TechnicalQuestions;