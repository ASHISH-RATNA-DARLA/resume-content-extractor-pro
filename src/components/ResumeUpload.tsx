
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UploadState {
  isDragging: boolean;
  isUploading: boolean;
  uploadSuccess: boolean;
  uploadError: string | null;
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
      uploadSuccess: false 
    }));

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadState(prev => ({ 
          ...prev, 
          isUploading: false, 
          uploadSuccess: true 
        }));
        toast({
          title: "Resume uploaded successfully!",
          description: `${result.data.fileName} has been parsed and saved.`,
        });
        
        // Call the onUploadSuccess callback if provided
        if (onUploadSuccess) {
          onUploadSuccess(result.data);
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
            <p className="text-base font-medium">Processing resume...</p>
            <p className="text-sm text-muted-foreground">Extracting text content</p>
          </div>
        ) : uploadState.uploadSuccess ? (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle className="h-10 w-10 text-green-500" />
            <p className="text-base font-medium text-green-700">Resume uploaded successfully!</p>
            <Button 
              onClick={() => setUploadState(prev => ({ ...prev, uploadSuccess: false }))}
              variant="outline"
              size="sm"
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
              <p className="text-sm text-muted-foreground">or click to browse files</p>
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
