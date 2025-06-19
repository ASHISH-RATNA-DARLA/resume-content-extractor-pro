
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadResume } from '@/lib/resumeService';

interface UploadState {
  isDragging: boolean;
  isUploading: boolean;
  uploadSuccess: boolean;
  uploadError: string | null;
  generatedQuestions: any[];
}

interface ResumeUploadProps {
  onUploadSuccess?: (resumeData: any) => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onUploadSuccess }) => {
  const [uploadState, setUploadState] = useState<UploadState>({
    isDragging: false,
    isUploading: false,
    uploadSuccess: false,
    uploadError: null,
    generatedQuestions: [],
  });
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setUploadState(prev => ({ ...prev, isDragging: true }));
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setUploadState(prev => ({ ...prev, isDragging: false }));
  }, []);

  const generateQuestionsFromResume = (extractedText: string) => {
    // Simple question generation based on common resume keywords
    const questions = [];
    const lowerText = extractedText.toLowerCase();
    
    // Check for programming languages
    if (lowerText.includes('javascript') || lowerText.includes('js')) {
      questions.push({
        category: 'JavaScript',
        question: 'Explain the difference between var, let, and const in JavaScript.',
        difficulty: 'Medium'
      });
    }
    
    if (lowerText.includes('react')) {
      questions.push({
        category: 'React',
        question: 'What are React Hooks and how do they differ from class components?',
        difficulty: 'Medium'
      });
    }
    
    if (lowerText.includes('python')) {
      questions.push({
        category: 'Python',
        question: 'Explain the difference between lists and tuples in Python.',
        difficulty: 'Easy'
      });
    }
    
    if (lowerText.includes('java')) {
      questions.push({
        category: 'Java',
        question: 'What is the difference between abstract classes and interfaces in Java?',
        difficulty: 'Medium'
      });
    }
    
    if (lowerText.includes('database') || lowerText.includes('sql')) {
      questions.push({
        category: 'Database',
        question: 'Explain ACID properties in database transactions.',
        difficulty: 'Hard'
      });
    }
    
    if (lowerText.includes('aws') || lowerText.includes('cloud')) {
      questions.push({
        category: 'Cloud Computing',
        question: 'What are the different types of cloud service models (IaaS, PaaS, SaaS)?',
        difficulty: 'Medium'
      });
    }
    
    // Add some general questions
    questions.push({
      category: 'General',
      question: 'Describe your most challenging project and how you overcame the difficulties.',
      difficulty: 'Medium'
    });
    
    questions.push({
      category: 'Problem Solving',
      question: 'How do you approach debugging a complex issue in your code?',
      difficulty: 'Medium'
    });
    
    return questions;
  };

  const uploadFile = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setUploadState(prev => ({ 
        ...prev, 
        uploadError: 'Please upload only PDF or DOCX files.' 
      }));
      return;
    }

    setUploadState(prev => ({ 
      ...prev, 
      isUploading: true, 
      uploadError: null, 
      uploadSuccess: false,
      generatedQuestions: []
    }));

    try {
      const result = await uploadResume(file);

      if (result.success) {
        // Generate questions based on extracted text
        const questions = generateQuestionsFromResume(result.data?.extractedText || '');
        
        setUploadState(prev => ({ 
          ...prev, 
          isUploading: false, 
          uploadSuccess: true,
          generatedQuestions: questions
        }));
        
        toast({
          title: "Resume analyzed successfully!",
          description: `Generated ${questions.length} personalized interview questions.`,
        });
        
        // Call the onUploadSuccess callback if provided
        if (onUploadSuccess) {
          onUploadSuccess({
            ...result.data,
            questions
          });
        }
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      setUploadState(prev => ({ 
        ...prev, 
        isUploading: false, 
        uploadError: error instanceof Error ? error.message : 'Upload failed' 
      }));
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: "destructive",
      });
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setUploadState(prev => ({ ...prev, isDragging: false }));
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  return (
    <div>
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200
          ${uploadState.isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
          ${uploadState.isUploading ? 'opacity-50 pointer-events-none' : 'hover:border-primary hover:bg-primary/5'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {uploadState.isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-base font-medium">Analyzing resume...</p>
            <p className="text-sm text-muted-foreground">Extracting skills and generating questions</p>
          </div>
        ) : uploadState.uploadSuccess ? (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle className="h-10 w-10 text-green-500" />
            <p className="text-base font-medium text-green-700">Resume analyzed successfully!</p>
            <p className="text-sm text-muted-foreground">
              Generated {uploadState.generatedQuestions.length} personalized questions
            </p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl">
              {uploadState.generatedQuestions.slice(0, 4).map((q, index) => (
                <div key={index} className="text-left p-3 bg-blue-50 rounded border">
                  <div className="flex items-center gap-2 mb-1">
                    <Brain className="h-4 w-4 text-blue-500" />
                    <span className="text-xs font-medium text-blue-700">{q.category}</span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">{q.question}</p>
                </div>
              ))}
            </div>
            <Button 
              onClick={() => setUploadState(prev => ({ ...prev, uploadSuccess: false, generatedQuestions: [] }))}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Upload Another Resume
            </Button>
          </div>
        ) : uploadState.uploadError ? (
          <div className="flex flex-col items-center gap-3">
            <AlertCircle className="h-10 w-10 text-red-500" />
            <p className="text-base font-medium text-red-700">Upload failed</p>
            <p className="text-sm text-muted-foreground">{uploadState.uploadError}</p>
            <Button 
              onClick={() => setUploadState(prev => ({ ...prev, uploadError: null }))}
              variant="outline"
              size="sm"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="text-base font-medium">Drop your resume here</p>
              <p className="text-sm text-muted-foreground">to generate personalized interview questions</p>
            </div>
            <div className="flex gap-2 text-xs text-muted-foreground">
              <span className="bg-muted px-2 py-1 rounded">PDF</span>
              <span className="bg-muted px-2 py-1 rounded">DOCX</span>
            </div>
          </div>
        )}
        
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploadState.isUploading}
        />
      </div>
    </div>
  );
};

export default ResumeUpload;
