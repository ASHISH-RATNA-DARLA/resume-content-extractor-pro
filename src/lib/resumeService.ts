import { extractPdfText } from './extractPdf';
import { extractDocxText } from './extractDocx';
import { saveResumeData, getAllResumes, ParsedResume } from './resumeParser';

export async function uploadResume(file: File): Promise<{
  success: boolean;
  message: string;
  data?: {
    id: string;
    fileName: string;
    textLength: number;
    parsedAt: string;
    extractedText?: string;
  };
  error?: string;
}> {
  try {
    // Validate file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !['pdf', 'docx'].includes(fileExtension)) {
      return {
        success: false,
        message: 'Invalid file type',
        error: 'Unsupported file type. Please upload PDF or DOCX files.'
      };
    }

    // Try server-side processing first
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Create resume data object from server response
          const resumeData: ParsedResume = {
            id: result.data.id,
            fileName: result.data.fileName,
            extractedText: result.data.extractedText,
            parsedAt: result.data.parsedAt,
            fileType: `.${fileExtension}`,
          };
          
          // Save to localStorage
          saveResumeData(resumeData);
          
          return {
            success: true,
            message: 'Resume parsed and saved successfully (server-side)',
            data: {
              id: resumeData.id,
              fileName: resumeData.fileName,
              textLength: resumeData.extractedText.length,
              parsedAt: resumeData.parsedAt,
              extractedText: resumeData.extractedText,
            },
          };
        }
      }
      
      // If server processing failed, continue with client-side processing
      console.log('Server-side processing failed, falling back to client-side');
    } catch (serverError) {
      console.error('Error with server-side processing:', serverError);
      // Continue with client-side processing
    }

    // Extract text based on file type (client-side fallback)
    let extractedText = '';
    if (fileExtension === 'pdf') {
      extractedText = await extractPdfText(file);
    } else if (fileExtension === 'docx') {
      extractedText = await extractDocxText(file);
    }

    // Create resume data object
    const resumeData: ParsedResume = {
      id: Date.now().toString(),
      fileName: file.name,
      extractedText,
      parsedAt: new Date().toISOString(),
      fileType: `.${fileExtension}`,
    };

    // Save to localStorage
    saveResumeData(resumeData);

    return {
      success: true,
      message: 'Resume parsed and saved successfully (client-side)',
      data: {
        id: resumeData.id,
        fileName: resumeData.fileName,
        textLength: extractedText.length,
        parsedAt: resumeData.parsedAt,
        extractedText: extractedText,
      },
    };
  } catch (error) {
    console.error('Error processing resume:', error);
    return {
      success: false,
      message: 'Failed to process resume',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export function getResumes(): {
  resumes: ParsedResume[];
} {
  return {
    resumes: getAllResumes()
  };
}