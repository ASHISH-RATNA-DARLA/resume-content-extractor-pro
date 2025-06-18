
export interface ParsedResume {
  id: string;
  fileName: string;
  extractedText: string;
  parsedAt: string;
  fileType: string;
}

const STORAGE_KEY = 'parsed_resumes';

export function saveResumeData(resumeData: ParsedResume): void {
  let existingData: ParsedResume[] = [];
  
  // Read existing data from localStorage
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      existingData = JSON.parse(storedData);
    }
  } catch (error) {
    console.error('Error reading existing resume data:', error);
  }

  // Add new resume data
  existingData.push(resumeData);

  // Save updated data to localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existingData));
}

export function getAllResumes(): ParsedResume[] {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (error) {
    console.error('Error reading resume data:', error);
  }
  
  return [];
}

// Helper function to clear all stored resumes (for testing)
export function clearAllResumes(): void {
  localStorage.removeItem(STORAGE_KEY);
}
