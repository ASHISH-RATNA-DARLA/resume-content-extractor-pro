import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
console.log('Data directory path:', dataDir);
console.log('Data directory exists:', fs.existsSync(dataDir));

// Create a test resume entry with current date
const currentDate = new Date();
console.log('Current date:', currentDate);

const testResume = {
  id: Date.now().toString(),
  fileName: 'test-resume.pdf',
  extractedText: 'This is a test resume content for verification purposes.',
  parsedAt: currentDate.toISOString(),
  fileType: '.pdf',
};

// Save to JSON file
const filePath = path.join(dataDir, 'resumes.json');
let existingData = [];

// Read existing data if file exists
if (fs.existsSync(filePath)) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    existingData = JSON.parse(fileContent);
    console.log('Existing resumes:', existingData.length);
  } catch (error) {
    console.error('Error reading existing resume data:', error);
  }
}

// Add new resume data
existingData.push(testResume);

// Save updated data
fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));
console.log('Test resume added successfully!');
console.log('Total resumes:', existingData.length);