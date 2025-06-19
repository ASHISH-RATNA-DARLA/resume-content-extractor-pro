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
import { 
  Brain, 
  Upload, 
  FileText, 
  ArrowLeft, 
  CheckCircle, 
  XCircle,
  Star,
  Clock,
  Target
} from "lucide-react";
import { useNavigate } from 'react-router-dom';

const CombinedPage: React.FC = () => {
  const navigate = useNavigate();
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('/api/tech-questions');
        const data = await response.json();
        
        if (data.questions) {
          setQuestions(data.questions);
          setFilteredQuestions(data.questions);
          
          const uniqueTechStacks = [...new Set(data.questions.map((q: TechnicalQuestion) => q.tech_stack))].filter((stack): stack is string => typeof stack === 'string');
          setTechStacks(uniqueTechStacks);
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
        
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

  useEffect(() => {
    let filtered = [...questions];
    
    if (techStackFilter) {
      filtered = filtered.filter(q => q.tech_stack === techStackFilter);
    }
    
    if (difficultyFilter) {
      filtered = filtered.filter(q => q.difficulty_level === difficultyFilter);
    }
    
    setFilteredQuestions(filtered);
    setCurrentQuestionIndex(0);
  }, [techStackFilter, difficultyFilter, questions]);

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
      
      if (question.question_type === 'mcq') {
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

  const handleSubmitAnswer = async () => {
    if (!selectedQuestion) return;
    
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
          user_id: 'demo-user',
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
        
        if (selectedQuestion.question_type === 'mcq') {
          const correctOption = mcqOptions.find(option => option.is_correct);
          if (correctOption) {
            const isCorrect = selectedOption === correctOption.id;
            if (isCorrect) {
              setScore(prev => prev + 1);
            }
            toast({
              title: isCorrect ? 'Correct!' : 'Incorrect',
              description: `The correct answer is ${correctOption.option_label}: ${correctOption.option_text}`,
              variant: isCorrect ? 'default' : 'destructive',
            });
          }
        }
      } else {
        throw new Error(data.error || 'Failed to submit answer');
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      
      toast({
        title: 'Answer Received',
        description: 'Your answer has been recorded locally (demo mode)',
      });
      
      if (selectedQuestion.question_type === 'mcq') {
        const correctOption = mcqOptions.find(option => option.is_correct);
        if (correctOption) {
          const isCorrect = selectedOption === correctOption.id;
          if (isCorrect) {
            setScore(prev => prev + 1);
          }
          toast({
            title: isCorrect ? 'Correct!' : 'Incorrect',
            description: `The correct answer is ${correctOption.option_label}: ${correctOption.option_text}`,
            variant: isCorrect ? 'default' : 'destructive',
          });
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetFilters = () => {
    setTechStackFilter('');
    setDifficultyFilter('');
  };

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

  const handleResumeUploadSuccess = (newResume: any) => {
    toast({
      title: 'Success',
      description: 'Resume uploaded and parsed successfully',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Technical Interview Simulator</h1>
                  <p className="text-sm text-gray-600">Practice & Perfect Your Skills</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Questions: {currentQuestionIndex + 1}/{filteredQuestions.length}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4 text-green-500" />
                <span className="text-gray-600">Score: {score}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="practice" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="practice" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Practice Questions
            </TabsTrigger>
            <TabsTrigger value="resume" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Resume Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="practice">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Filters Sidebar */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Filter Questions
                    </CardTitle>
                    <CardDescription>Choose your focus area</CardDescription>
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

                    {/* Quick Stats */}
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-3">Session Stats</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Questions Available:</span>
                          <span className="font-medium">{filteredQuestions.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Current Score:</span>
                          <span className="font-medium text-green-600">{score}/{currentQuestionIndex}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-2">
                {loading ? (
                  <Card>
                    <CardContent className="flex justify-center items-center h-64">
                      <div className="text-center">
                        <Brain className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                        <p>Loading questions...</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : selectedQuestion ? (
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {selectedQuestion.question_type === 'mcq' ? (
                              <CheckCircle className="h-5 w-5 text-blue-600" />
                            ) : (
                              <FileText className="h-5 w-5 text-green-600" />
                            )}
                            {selectedQuestion.question_type.toUpperCase()} Question
                          </CardTitle>
                          <CardDescription>{selectedQuestion.topic}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline">{selectedQuestion.tech_stack}</Badge>
                          {renderDifficultyBadge(selectedQuestion.difficulty_level)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                        <p className="font-medium text-gray-900">{selectedQuestion.question_text}</p>
                      </div>
                      
                      <Separator />
                      
                      {selectedQuestion.question_type === 'mcq' ? (
                        <div className="space-y-3">
                          <Label className="text-base font-medium">Choose your answer:</Label>
                          <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                            {mcqOptions.map(option => (
                              <div key={option.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 border">
                                <RadioGroupItem value={option.id} id={option.id} />
                                <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                                  <span className="font-semibold text-blue-600">{option.option_label}:</span> {option.option_text}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Label htmlFor="answer" className="text-base font-medium">Your Answer:</Label>
                          <Textarea
                            id="answer"
                            placeholder="Type your detailed answer here..."
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            rows={8}
                            className="min-h-[200px]"
                          />
                          <p className="text-sm text-gray-500">
                            Tip: Include key concepts, examples, and explain your reasoning for better evaluation.
                          </p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button 
                        onClick={handleSubmitAnswer} 
                        disabled={submitting}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        size="lg"
                      >
                        {submitting ? (
                          <>
                            <Brain className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Submit Answer
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Brain className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium mb-2">Ready to Practice?</h3>
                        <p className="text-gray-600 mb-6">Select a question from the list below to begin your technical interview practice.</p>
                        
                        <div className="grid gap-4 max-h-96 overflow-y-auto">
                          {filteredQuestions.length > 0 ? (
                            filteredQuestions.map((question, index) => (
                              <Card 
                                key={question.id} 
                                className="cursor-pointer hover:border-blue-500 hover:shadow-md transition-all"
                                onClick={() => {
                                  handleQuestionSelect(question);
                                  setCurrentQuestionIndex(index);
                                }}
                              >
                                <CardHeader className="pb-2">
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                      {question.question_type === 'mcq' ? (
                                        <CheckCircle className="h-4 w-4 text-blue-600" />
                                      ) : (
                                        <FileText className="h-4 w-4 text-green-600" />
                                      )}
                                      <CardTitle className="text-base">{question.question_type.toUpperCase()}</CardTitle>
                                    </div>
                                    <div className="flex gap-2">
                                      <Badge variant="outline" className="text-xs">{question.tech_stack}</Badge>
                                      {renderDifficultyBadge(question.difficulty_level)}
                                    </div>
                                  </div>
                                  <CardDescription className="text-left">{question.topic}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-sm text-left">{question.question_text}</p>
                                </CardContent>
                              </Card>
                            ))
                          ) : (
                            <div className="text-center py-8">
                              <XCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                              <p className="text-gray-600">No questions found matching the selected filters.</p>
                              <Button variant="outline" onClick={handleResetFilters} className="mt-4">
                                Reset Filters
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="resume">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Resume Analysis & Personalized Questions
                </CardTitle>
                <CardDescription>
                  Upload your resume to get AI-generated questions based on your experience and skills
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResumeUpload onUploadSuccess={handleResumeUploadSuccess} />
                
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <Upload className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Upload Resume</h3>
                    <p className="text-sm text-gray-600">
                      Support for PDF and DOCX formats
                    </p>
                  </div>
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <Brain className="h-8 w-8 text-green-600 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">AI Analysis</h3>
                    <p className="text-sm text-gray-600">
                      Extract skills, experience, and projects
                    </p>
                  </div>
                  <div className="text-center p-6 bg-purple-50 rounded-lg">
                    <Star className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Custom Questions</h3>
                    <p className="text-sm text-gray-600">
                      Generate personalized interview questions
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CombinedPage;
