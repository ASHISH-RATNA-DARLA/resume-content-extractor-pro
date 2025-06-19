
import { extractDocxText } from './extractDocx';
import { saveResumeData, getAllResumes, ParsedResume } from './resumeParser';
import { saveResumeToSupabase, saveQuestionsToSupabase } from './supabaseResumeService';

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

    // For PDF files, we must use server-side processing
    if (fileExtension === 'pdf') {
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
            
            // Save to localStorage as fallback
            saveResumeData(resumeData);
            
            // Save to Supabase
            const supabaseResult = await saveResumeToSupabase({
              id: resumeData.id,
              fileName: resumeData.fileName,
              extractedText: resumeData.extractedText,
              parsedAt: resumeData.parsedAt,
              fileType: resumeData.fileType
            });
            
            if (!supabaseResult.success) {
              console.warn('Failed to save to Supabase, using localStorage fallback');
            }
            
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
        
        const errorResult = await response.json();
        throw new Error(errorResult.error || 'Server processing failed');
      } catch (serverError) {
        console.error('Error with server-side PDF processing:', serverError);
        return {
          success: false,
          message: 'Failed to process PDF',
          error: 'PDF processing requires server connection. Please ensure the server is running and try again.'
        };
      }
    }

    // For DOCX files, try client-side processing first, then fallback to server
    if (fileExtension === 'docx') {
      try {
        // Try client-side DOCX extraction first
        const extractedText = await extractDocxText(file);
        
        // Create resume data object
        const resumeData: ParsedResume = {
          id: Date.now().toString(),
          fileName: file.name,
          extractedText,
          parsedAt: new Date().toISOString(),
          fileType: `.${fileExtension}`,
        };

        // Save to localStorage as fallback
        saveResumeData(resumeData);

        // Save to Supabase
        const supabaseResult = await saveResumeToSupabase({
          id: resumeData.id,
          fileName: resumeData.fileName,
          extractedText: resumeData.extractedText,
          parsedAt: resumeData.parsedAt,
          fileType: resumeData.fileType
        });
        
        if (!supabaseResult.success) {
          console.warn('Failed to save to Supabase, using localStorage fallback');
        }

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
      } catch (clientError) {
        console.error('Client-side DOCX processing failed, trying server-side:', clientError);
        
        // Fallback to server-side processing for DOCX
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
              const resumeData: ParsedResume = {
                id: result.data.id,
                fileName: result.data.fileName,
                extractedText: result.data.extractedText,
                parsedAt: result.data.parsedAt,
                fileType: `.${fileExtension}`,
              };
              
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
          
          throw new Error('Server processing also failed');
        } catch (serverError) {
          console.error('Server-side DOCX processing also failed:', serverError);
          return {
            success: false,
            message: 'Failed to process DOCX file',
            error: 'Both client and server processing failed. Please try again or contact support.'
          };
        }
      }
    }

    return {
      success: false,
      message: 'Unsupported file type',
      error: 'Please upload PDF or DOCX files only.'
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
