
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, Brain, Eye, Loader2, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getResumes } from '@/lib/resumeService';

interface ParsedResume {
  id: string;
  fileName: string;
  extractedText: string;
  parsedAt: string;
  fileType: string;
}

interface Question {
  category: string;
  question: string;
  difficulty: string;
}

const ResumeList: React.FC = () => {
  const [resumes, setResumes] = useState<ParsedResume[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const result = getResumes();
      setResumes(result.resumes);
    } catch (error) {
      console.error('Error fetching resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQuestionsFromResume = (extractedText: string): Question[] => {
    const questions: Question[] = [];
    const lowerText = extractedText.toLowerCase();
    
    // Check for programming languages and technologies
    if (lowerText.includes('javascript') || lowerText.includes('js')) {
      questions.push(
        {
          category: 'JavaScript',
          question: 'Explain the difference between var, let, and const in JavaScript.',
          difficulty: 'Medium'
        },
        {
          category: 'JavaScript',
          question: 'What is event delegation and why is it useful?',
          difficulty: 'Hard'
        }
      );
    }
    
    if (lowerText.includes('react')) {
      questions.push(
        {
          category: 'React',
          question: 'What are React Hooks and how do they differ from class components?',
          difficulty: 'Medium'
        },
        {
          category: 'React',
          question: 'Explain the React component lifecycle methods.',
          difficulty: 'Hard'
        }
      );
    }
    
    if (lowerText.includes('python')) {
      questions.push(
        {
          category: 'Python',
          question: 'Explain the difference between lists and tuples in Python.',
          difficulty: 'Easy'
        },
        {
          category: 'Python',
          question: 'What are Python decorators and how do you use them?',
          difficulty: 'Hard'
        }
      );
    }
    
    if (lowerText.includes('java')) {
      questions.push(
        {
          category: 'Java',
          question: 'What is the difference between abstract classes and interfaces in Java?',
          difficulty: 'Medium'
        },
        {
          category: 'Java',
          question: 'Explain Java memory management and garbage collection.',
          difficulty: 'Hard'
        }
      );
    }
    
    if (lowerText.includes('database') || lowerText.includes('sql')) {
      questions.push(
        {
          category: 'Database',
          question: 'Explain ACID properties in database transactions.',
          difficulty: 'Hard'
        },
        {
          category: 'Database',
          question: 'What is the difference between SQL and NoSQL databases?',
          difficulty: 'Medium'
        }
      );
    }
    
    if (lowerText.includes('aws') || lowerText.includes('cloud')) {
      questions.push(
        {
          category: 'Cloud Computing',
          question: 'What are the different types of cloud service models (IaaS, PaaS, SaaS)?',
          difficulty: 'Medium'
        },
        {
          category: 'AWS',
          question: 'Explain the difference between EC2, Lambda, and ECS.',
          difficulty: 'Hard'
        }
      );
    }
    
    if (lowerText.includes('docker') || lowerText.includes('container')) {
      questions.push({
        category: 'DevOps',
        question: 'What are the benefits of containerization with Docker?',
        difficulty: 'Medium'
      });
    }
    
    if (lowerText.includes('kubernetes') || lowerText.includes('k8s')) {
      questions.push({
        category: 'DevOps',
        question: 'Explain Kubernetes pods, services, and deployments.',
        difficulty: 'Hard'
      });
    }
    
    // Add some general questions based on experience level
    const experienceKeywords = ['senior', 'lead', 'manager', 'architect'];
    const hasExperience = experienceKeywords.some(keyword => lowerText.includes(keyword));
    
    if (hasExperience) {
      questions.push(
        {
          category: 'Leadership',
          question: 'How do you handle technical disagreements within your team?',
          difficulty: 'Medium'
        },
        {
          category: 'Architecture',
          question: 'Describe how you would design a scalable system for high traffic.',
          difficulty: 'Hard'
        }
      );
    }
    
    // Always add some general questions
    questions.push(
      {
        category: 'General',
        question: 'Describe your most challenging project and how you overcame the difficulties.',
        difficulty: 'Medium'
      },
      {
        category: 'Problem Solving',
        question: 'How do you approach debugging a complex issue in your code?',
        difficulty: 'Medium'
      },
      {
        category: 'Best Practices',
        question: 'What are some code review best practices you follow?',
        difficulty: 'Easy'
      }
    );
    
    return questions;
  };

  const handleViewQuestions = (resume: ParsedResume) => {
    setSelectedResumeId(resume.id);
    const questions = generateQuestionsFromResume(resume.extractedText);
    setGeneratedQuestions(questions);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading resumes...</span>
      </div>
    );
  }

  return (
    <div>
      {resumes.length === 0 ? (
        <div className="text-center py-8">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground mb-2">No resumes analyzed yet</p>
          <p className="text-sm text-muted-foreground">Upload a resume to generate personalized interview questions</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Your Analyzed Resumes</h2>
          {resumes.map((resume) => (
            <Card key={resume.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{resume.fileName}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4" />
                        Analyzed on {formatDate(resume.parsedAt)}
                        <Badge variant="secondary" className="ml-2">
                          {resume.fileType.toUpperCase()}
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                  <Dialog onOpenChange={(open) => {
                    if (open) handleViewQuestions(resume);
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        View Questions
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <MessageSquare className="h-5 w-5" />
                          Interview Questions for {resume.fileName}
                        </DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="h-[60vh] w-full pr-4">
                        {selectedResumeId === resume.id && (
                          <div className="space-y-4">
                            {generatedQuestions.map((question, index) => (
                              <Card key={index} className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <Badge variant="outline" className="text-xs">
                                    {question.category}
                                  </Badge>
                                  <Badge className={`text-xs ${getDifficultyColor(question.difficulty)}`}>
                                    {question.difficulty}
                                  </Badge>
                                </div>
                                <p className="text-sm font-medium text-gray-900">
                                  {question.question}
                                </p>
                              </Card>
                            ))}
                            
                            {generatedQuestions.length === 0 && (
                              <div className="text-center py-8">
                                <Brain className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">
                                  No specific questions generated. Upload a more detailed resume for better results.
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Brain className="h-4 w-4" />
                  <span>Ready to generate personalized interview questions</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResumeList;
