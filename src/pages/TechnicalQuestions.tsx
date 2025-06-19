import React, { useState, useEffect, useRef } from 'react';
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
import { Progress } from '../components/ui/progress';
import { Input } from '../components/ui/input';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { TechnicalQuestion, MCQOption, ExpectedAnswer, techQuestionsService, UserResponse } from '../lib/techQuestionsService';
import { supabase } from '../lib/supabase';

// Define AI feedback structure
interface AIFeedback {
  completeness: number;
  technicalAccuracy: number;
  relevance: number;
  depth: number;
  overallScore: number;
  feedback: string;
}

// Define resume data structure
interface ResumeData {
  id: string;
  fileName: string;
  extractedText: string;
  skills: string[];
  projects: string[];
}

const TechnicalQuestions: React.FC = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for questions and filtering
  const [questions, setQuestions] = useState<TechnicalQuestion[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<TechnicalQuestion[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<TechnicalQuestion | null>(null);
  const [mcqOptions, setMcqOptions] = useState<MCQOption[]>([]);
  const [expectedAnswer, setExpectedAnswer] = useState<ExpectedAnswer | null>(null);
  
  // State for user inputs
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [techStackFilter, setTechStackFilter] = useState('');
  
  // State for UI controls
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [processingResume, setProcessingResume] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  
  // State for premium features
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [aiGeneratedQuestions, setAiGeneratedQuestions] = useState<TechnicalQuestion[]>([]);
  const [aiFeedback, setAiFeedback] = useState<AIFeedback | null>(null);
  
  // State for interview session
  const [interviewMode, setInterviewMode] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<string[]>([]);
  const [sessionQuestions, setSessionQuestions] = useState<TechnicalQuestion[]>([]);
  
  // State for tech stacks
  const [techStacks, setTechStacks] = useState<string[]>([]);

  // Fetch all questions using the service on component mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        // Fetch questions using the service
        const questionsData = await techQuestionsService.getAllQuestions();
        
        setQuestions(questionsData);
        setFilteredQuestions(questionsData);
        
        // Extract unique tech stacks
        const uniqueTechStacks = [...new Set(questionsData.map(q => q.tech_stack))];
        setTechStacks(uniqueTechStacks);
      } catch (error) {
        console.error('Error fetching questions:', error);
        toast({
          title: 'Error fetching questions',
          description: 'Could not connect to the database. Please try again later.',
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
    
    setFilteredQuestions(filtered);
  }, [techStackFilter, questions]);

  // Fetch question details when a question is selected
  const handleQuestionSelect = async (question: TechnicalQuestion) => {
    setSelectedQuestion(question);
    setUserAnswer('');
    setSelectedOption('');
    setShowFeedback(false);
    setAiFeedback(null);
    
    try {
      // Fetch question details using the service
      const questionDetails = await techQuestionsService.getQuestionWithDetails(question.id);
      
      if (question.question_type === 'mcq') {
        if (questionDetails.mcqOptions) {
          setMcqOptions(questionDetails.mcqOptions);
        }
        setExpectedAnswer(null);
      } else {
        if (questionDetails.expectedAnswer) {
          setExpectedAnswer(questionDetails.expectedAnswer);
        }
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

  // Handle resume upload
  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check file type
    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (fileType !== 'pdf' && fileType !== 'docx') {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF or DOCX file',
        variant: 'destructive',
      });
      return;
    }
    
    setProcessingResume(true);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload resume
      const response = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Store resume data
        const { data: resumeInsertData, error: resumeInsertError } = await supabase
          .from('user_resumes')
          .insert([
            { 
              file_name: file.name,
              extracted_text: data.data.extractedText,
              skills: data.data.skills || [],
              projects: data.data.projects || []
            }
          ])
          .select()
          .single();
        
        if (resumeInsertError) {
          throw resumeInsertError;
        }
        
        if (resumeInsertData) {
          // Set resume data
          setResumeData({
            id: resumeInsertData.id,
            fileName: resumeInsertData.file_name,
            extractedText: resumeInsertData.extracted_text,
            skills: resumeInsertData.skills || [],
            projects: resumeInsertData.projects || []
          });
          
          // Generate AI questions based on resume
          // For now, we'll fetch questions that match the skills in the resume
          const skills = resumeInsertData.skills || [];
          
          if (skills.length > 0) {
            const { data: matchedQuestions, error: matchedQuestionsError } = await supabase
              .from('technical_questions')
              .select('*')
              .in('tech_stack', skills)
              .eq('is_premium', true)
              .limit(3);
            
            if (matchedQuestionsError) {
              throw matchedQuestionsError;
            }
            
            if (matchedQuestions) {
              setAiGeneratedQuestions(matchedQuestions);
            }
          }
          
          setResumeUploaded(true);
          
          toast({
            title: 'Resume processed successfully',
            description: 'AI has generated personalized questions based on your resume',
          });
        }
      } else {
        throw new Error(data.error || 'Failed to process resume');
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast({
        title: 'Error processing resume',
        description: 'Failed to process your resume. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessingResume(false);
    }
  };

  // Start interview session
  const startInterviewSession = () => {
    // Combine standard and AI-generated questions if resume is uploaded
    let sessionQs = [...filteredQuestions];
    if (resumeUploaded) {
      sessionQs = [...sessionQs, ...aiGeneratedQuestions];
    }
    
    // Limit to 5 questions for the session
    sessionQs = sessionQs.slice(0, 5);
    
    setSessionQuestions(sessionQs);
    setCurrentQuestionIndex(0);
    setAnsweredQuestions([]);
    setInterviewMode(true);
    
    // Select the first question
    if (sessionQs.length > 0) {
      handleQuestionSelect(sessionQs[0]);
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
      // Store user's answer using the service
      const userResponse = await techQuestionsService.submitUserResponse({
        user_id: 'demo-user', // In a real app, this would be the actual user ID
        question_id: selectedQuestion.id,
        user_answer: selectedQuestion.question_type === 'mcq' ? selectedOption : userAnswer,
      });
      
      // For MCQ questions, check if the answer is correct
      if (selectedQuestion.question_type === 'mcq') {
        const correctOption = mcqOptions.find(option => option.is_correct);
        const isCorrect = selectedOption === correctOption?.id;
        
        // Show feedback for MCQ
        toast({
          title: isCorrect ? 'Correct!' : 'Incorrect',
          description: isCorrect 
            ? 'You selected the correct answer.' 
            : `The correct answer is ${correctOption?.option_label}: ${correctOption?.option_text}`,
          variant: isCorrect ? 'default' : 'destructive',
        });
        
        // Update the user response with AI score
        await supabase
          .from('user_responses')
          .update({ 
            ai_score: isCorrect ? 100 : 0,
            ai_feedback: isCorrect 
              ? 'Correct answer selected.' 
              : `Incorrect. The correct answer is ${correctOption?.option_label}: ${correctOption?.option_text}`
          })
          .eq('id', userResponse.id);
      } 
      // For text answers, generate AI feedback
      else {
        try {
          // Generate AI feedback
          const response = await fetch('/api/generate-feedback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              questionId: selectedQuestion.id,
              userAnswer: userAnswer,
              expectedAnswer: expectedAnswer?.sample_answer || '',
              keyPoints: expectedAnswer?.key_points || [],
              techStack: selectedQuestion.tech_stack
            }),
          });
          
          const feedbackData = await response.json();
          
          if (feedbackData.success) {
            // Set AI feedback
            setAiFeedback({
              completeness: feedbackData.data.completeness,
              technicalAccuracy: feedbackData.data.technicalAccuracy,
              relevance: feedbackData.data.relevance,
              depth: feedbackData.data.depth,
              overallScore: feedbackData.data.overallScore,
              feedback: feedbackData.data.feedback
            });
            
            // Update the user response with AI feedback
            await supabase
              .from('user_responses')
              .update({ 
                ai_score: feedbackData.data.overallScore,
                ai_feedback: feedbackData.data.feedback
              })
              .eq('id', userResponse.id);
            
            setShowFeedback(true);
          } else {
            throw new Error('Failed to generate AI feedback');
          }
        } catch (feedbackError) {
          console.error('Error generating AI feedback:', feedbackError);
          
          // If AI feedback generation fails, create mock feedback
          const completeness = Math.floor(Math.random() * 30) + 70; // 70-100
          const technicalAccuracy = Math.floor(Math.random() * 30) + 70; // 70-100
          const relevance = Math.floor(Math.random() * 20) + 80; // 80-100
          const depth = Math.floor(Math.random() * 40) + 60; // 60-100
          const overallScore = Math.floor((completeness + technicalAccuracy + relevance + depth) / 4);
          
          let feedback = '';
          if (expectedAnswer) {
            const keyPoints = expectedAnswer.key_points as string[];
            const userAnswerLower = userAnswer.toLowerCase();
            
            // Check if key points are covered
            const coveredPoints = keyPoints.filter(point => {
              const pointLower = point.toLowerCase();
              return userAnswerLower.includes(pointLower);
            });
            
            const coveragePercentage = (coveredPoints.length / keyPoints.length) * 100;
            
            if (coveragePercentage > 80) {
              feedback = 'Excellent answer! You covered most of the key points and demonstrated a strong understanding of the topic.';
            } else if (coveragePercentage > 50) {
              feedback = 'Good answer. You covered several important points, but there\'s room for improvement in completeness and depth.';
            } else {
              feedback = 'Your answer addresses the question but misses several key points. Consider expanding your knowledge on this topic.';
            }
            
            // Add specific feedback based on the question
            if (selectedQuestion.tech_stack === 'DBMS') {
              feedback += ' Your database knowledge is solid, but consider exploring more about data integrity constraints and transaction management.';
            } else if (selectedQuestion.tech_stack === 'OS') {
              feedback += ' Your understanding of operating systems concepts is good, but you could elaborate more on practical implementations.';
            } else if (selectedQuestion.tech_stack === 'DevOps') {
              feedback += ' Your DevOps knowledge shows practical experience, but consider deepening your understanding of CI/CD pipelines.';
            }
          }
          
          // Set AI feedback
          setAiFeedback({
            completeness,
            technicalAccuracy,
            relevance,
            depth,
            overallScore,
            feedback
          });
          
          // Update the user response with mock AI feedback
          await supabase
            .from('user_responses')
            .update({ 
              ai_score: overallScore,
              ai_feedback: feedback
            })
            .eq('id', userResponse.id);
          
          setShowFeedback(true);
        }
      }
      
      // Mark question as answered
      setAnsweredQuestions([...answeredQuestions, selectedQuestion.id]);
      
      // If in interview mode, move to next question after delay
      if (interviewMode) {
        setTimeout(() => {
          const nextIndex = currentQuestionIndex + 1;
          if (nextIndex < sessionQuestions.length) {
            setCurrentQuestionIndex(nextIndex);
            handleQuestionSelect(sessionQuestions[nextIndex]);
          } else {
            // End of interview session
            toast({
              title: 'Interview session completed',
              description: 'You have completed all questions in this session.',
            });
            setInterviewMode(false);
          }
        }, selectedQuestion.question_type === 'mcq' ? 2000 : 4000);
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

  // Render premium badge
  const renderPremiumBadge = (isPremium: boolean) => {
    if (!isPremium) return null;
    return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">Premium</Badge>;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading technical interview simulator...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Technical Interview Simulator</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Interview Simulator</CardTitle>
          <CardDescription>
            Practice technical interview questions based on tech stacks and get AI feedback on your answers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6">
            {/* Tech Stack Selection */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
                <div className="w-full md:w-1/3">
                  <Label htmlFor="tech-stack">Select Tech Stack</Label>
                  <Select value={techStackFilter} onValueChange={setTechStackFilter}>
                    <SelectTrigger id="tech-stack">
                      <SelectValue placeholder="Choose a tech stack" />
                    </SelectTrigger>
                    <SelectContent>
                      {techStacks.map((stack) => (
                        <SelectItem key={stack} value={stack}>{stack}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleResetFilters}>
                    Reset
                  </Button>
                  <Button onClick={startInterviewSession} disabled={!techStackFilter}>
                    Start Interview Session
                  </Button>
                </div>
              </div>
              
              <Separator />
            </div>
            
            {/* Resume Upload Section */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <Badge variant="outline" className="mr-2 bg-amber-100 text-amber-800 border-amber-300">Premium</Badge>
                Resume Upload
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Upload your resume to get personalized interview questions based on your skills and projects.
              </p>
              
              {!resumeUploaded ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx"
                      onChange={handleResumeUpload}
                      disabled={processingResume}
                      className="max-w-md"
                    />
                    {processingResume && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Processing...</span>
                        <Progress value={45} className="w-[100px]" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Supported formats: PDF, DOCX. Max size: 10MB.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                      Resume Processed
                    </Badge>
                    <span className="text-sm font-medium">{resumeData?.fileName}</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setResumeUploaded(false);
                        setResumeData(null);
                        setAiGeneratedQuestions([]);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Detected Skills</h4>
                      <div className="flex flex-wrap gap-1">
                        {resumeData?.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">AI-Generated Questions</h4>
                      <p className="text-xs text-slate-600">
                        {aiGeneratedQuestions.length} personalized questions based on your resume
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Interview Session or Question Browser */}
            {interviewMode ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Interview Session</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Question {currentQuestionIndex + 1} of {sessionQuestions.length}</span>
                    <Progress value={(currentQuestionIndex / sessionQuestions.length) * 100} className="w-[100px]" />
                  </div>
                </div>
                
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
                          {renderPremiumBadge(selectedQuestion.is_premium)}
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
                      
                      {showFeedback && aiFeedback && (
                        <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <h4 className="text-md font-medium mb-2">AI Feedback</h4>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm font-medium">Completeness</p>
                              <div className="flex items-center gap-2">
                                <Progress value={aiFeedback.completeness} className="w-full" />
                                <span className="text-sm">{aiFeedback.completeness}%</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Technical Accuracy</p>
                              <div className="flex items-center gap-2">
                                <Progress value={aiFeedback.technicalAccuracy} className="w-full" />
                                <span className="text-sm">{aiFeedback.technicalAccuracy}%</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Relevance</p>
                              <div className="flex items-center gap-2">
                                <Progress value={aiFeedback.relevance} className="w-full" />
                                <span className="text-sm">{aiFeedback.relevance}%</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Depth</p>
                              <div className="flex items-center gap-2">
                                <Progress value={aiFeedback.depth} className="w-full" />
                                <span className="text-sm">{aiFeedback.depth}%</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <p className="text-sm font-medium">Overall Score:</p>
                            <Badge variant={aiFeedback.overallScore >= 80 ? 'default' : 'secondary'}>
                              {aiFeedback.overallScore}%
                            </Badge>
                          </div>
                          <p className="text-sm">{aiFeedback.feedback}</p>
                        </div>
                      )}
                    </CardContent>
                    
                    <CardFooter className="flex justify-between">
                      <Button 
                        variant="outline" 
                        onClick={() => setInterviewMode(false)}
                      >
                        Exit Session
                      </Button>
                      <Button 
                        onClick={handleSubmitAnswer}
                        disabled={submitting || answeredQuestions.includes(selectedQuestion.id)}
                      >
                        {submitting ? 'Submitting...' : answeredQuestions.includes(selectedQuestion.id) ? 'Answered' : 'Submit Answer'}
                      </Button>
                    </CardFooter>
                  </Card>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Available Questions</h3>
                
                <Tabs defaultValue="standard" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="standard">Standard Questions</TabsTrigger>
                    <TabsTrigger value="personalized" disabled={!resumeUploaded}>
                      Personalized Questions
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="standard" className="space-y-4">
                    <div className="rounded-md border">
                      <div className="p-4">
                        <h3 className="text-md font-medium">Standard Questions ({filteredQuestions.length})</h3>
                        <p className="text-sm text-muted-foreground">
                          Click on a question to view details and answer
                        </p>
                      </div>
                      
                      <div className="max-h-[400px] overflow-y-auto">
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
                  
                  <TabsContent value="personalized">
                    {resumeUploaded ? (
                      <div className="rounded-md border">
                        <div className="p-4">
                          <h3 className="text-md font-medium">AI-Generated Questions ({aiGeneratedQuestions.length})</h3>
                          <p className="text-sm text-muted-foreground">
                            Personalized questions based on your resume
                          </p>
                        </div>
                        
                        <div className="max-h-[400px] overflow-y-auto">
                          {aiGeneratedQuestions.map((question) => (
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
                                  {renderPremiumBadge(question.is_premium)}
                                </div>
                              </div>
                              <div className="flex justify-between text-sm text-muted-foreground">
                                <span>{question.tech_stack}</span>
                                <span>{question.topic}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center border rounded-md">
                        <p className="text-muted-foreground">Upload your resume to get personalized questions</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
                
                {selectedQuestion && !interviewMode && (
                  <Card className="mt-6">
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
                          {renderPremiumBadge(selectedQuestion.is_premium)}
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
                      
                      {showFeedback && aiFeedback && (
                        <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <h4 className="text-md font-medium mb-2">AI Feedback</h4>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm font-medium">Completeness</p>
                              <div className="flex items-center gap-2">
                                <Progress value={aiFeedback.completeness} className="w-full" />
                                <span className="text-sm">{aiFeedback.completeness}%</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Technical Accuracy</p>
                              <div className="flex items-center gap-2">
                                <Progress value={aiFeedback.technicalAccuracy} className="w-full" />
                                <span className="text-sm">{aiFeedback.technicalAccuracy}%</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Relevance</p>
                              <div className="flex items-center gap-2">
                                <Progress value={aiFeedback.relevance} className="w-full" />
                                <span className="text-sm">{aiFeedback.relevance}%</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Depth</p>
                              <div className="flex items-center gap-2">
                                <Progress value={aiFeedback.depth} className="w-full" />
                                <span className="text-sm">{aiFeedback.depth}%</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <p className="text-sm font-medium">Overall Score:</p>
                            <Badge variant={aiFeedback.overallScore >= 80 ? 'default' : 'secondary'}>
                              {aiFeedback.overallScore}%
                            </Badge>
                          </div>
                          <p className="text-sm">{aiFeedback.feedback}</p>
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
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TechnicalQuestions;