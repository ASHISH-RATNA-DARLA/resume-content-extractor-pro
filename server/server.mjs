import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import asyncHandler from 'express-async-handler';
import mammoth from 'mammoth';
import { extractPdfText } from './pdfParser.mjs';
import { createClient } from '@supabase/supabase-js';

// Get current directory (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Supabase client
const supabaseUrl = 'https://qlwyyizfvcersgxbckei.supabase.co'; // Your Supabase project URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsd3l5aXpmdmNlcnNneGJja2VpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxODk1MjQ3NywiZXhwIjoyMDM0NTI4NDc3fQ.Yd_6-TbcB62Qcw-0RqPQnA-_MWgzH1QQnBnWqZDYnqE';
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    // Accept only PDF and DOCX files
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'));
    }
  }
});

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// PDF text extraction is now handled by the imported extractPdfText function from pdfParser.mjs

// Helper function to extract text from DOCX
async function extractDocxText(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error('Error extracting DOCX text:', error);
    throw new Error('Failed to extract DOCX text');
  }
}

// Helper function to save resume data
function saveResumeData(resumeData) {
  const filePath = path.join(dataDir, 'resumes.json');
  
  let existingData = [];
  
  // Read existing data if file exists
  if (fs.existsSync(filePath)) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      existingData = JSON.parse(fileContent);
    } catch (error) {
      console.error('Error reading existing resume data:', error);
    }
  }

  // Add new resume data
  existingData.push(resumeData);

  // Save updated data
  fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));
}

// Helper function to get all resumes
function getAllResumes() {
  const filePath = path.join(dataDir, 'resumes.json');
  
  if (!fs.existsSync(filePath)) {
    // Create the file with an empty array if it doesn't exist
    fs.writeFileSync(filePath, '[]', 'utf-8');
    return [];
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    // Handle empty file or invalid JSON
    if (!fileContent.trim()) {
      fs.writeFileSync(filePath, '[]', 'utf-8');
      return [];
    }
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading resume data:', error);
    // Reset the file with an empty array if there's a parsing error
    fs.writeFileSync(filePath, '[]', 'utf-8');
    return [];
  }
}

// API Routes
// Upload and parse resume
app.post('/api/upload-resume', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileExtension = path.extname(req.file.originalname).toLowerCase();
  let extractedText = '';

  // Extract text based on file type
  if (fileExtension === '.pdf') {
    extractedText = await extractPdfText(req.file.path);
  } else if (fileExtension === '.docx') {
    extractedText = await extractDocxText(req.file.path);
  } else {
    return res.status(400).json({ error: 'Unsupported file type. Please upload PDF or DOCX files.' });
  }

  // Create resume data object with current date
  const currentDate = new Date();
  const resumeData = {
    id: Date.now().toString(),
    fileName: req.file.originalname,
    extractedText,
    parsedAt: currentDate.toISOString(),
    fileType: fileExtension,
  };

  // Save to JSON file
  saveResumeData(resumeData);

  // Clean up uploaded file
  fs.unlinkSync(req.file.path);

  res.status(200).json({
    success: true,
    message: 'Resume parsed and saved successfully',
    data: {
      id: resumeData.id,
      fileName: resumeData.fileName,
      textLength: extractedText.length,
      parsedAt: resumeData.parsedAt,
      extractedText: extractedText, // Include the extracted text in the response
    },
  });
}));

// Get all resumes
app.get('/api/get-resumes', (req, res) => {
  try {
    const resumes = getAllResumes();
    res.status(200).json({ resumes });
  } catch (error) {
    console.error('Error fetching resumes:', error);
    res.status(500).json({ error: 'Failed to fetch resumes' });
  }
});

// Technical Questions API Endpoints
// Get all technical questions
app.get('/api/tech-questions', asyncHandler(async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('technical_questions')
      .select('*');
    
    if (error) throw error;
    
    res.status(200).json({ questions: data });
  } catch (error) {
    console.error('Error fetching technical questions:', error);
    res.status(500).json({ error: 'Failed to fetch technical questions' });
  }
}));

// Get questions by tech stack
app.get('/api/tech-questions/tech-stack/:techStack', asyncHandler(async (req, res) => {
  try {
    const { techStack } = req.params;
    const { data, error } = await supabase
      .from('technical_questions')
      .select('*')
      .eq('tech_stack', techStack);
    
    if (error) throw error;
    
    res.status(200).json({ questions: data });
  } catch (error) {
    console.error(`Error fetching questions for tech stack ${req.params.techStack}:`, error);
    res.status(500).json({ error: 'Failed to fetch questions by tech stack' });
  }
}));

// Get questions by difficulty level
app.get('/api/tech-questions/difficulty/:level', asyncHandler(async (req, res) => {
  try {
    const { level } = req.params;
    const { data, error } = await supabase
      .from('technical_questions')
      .select('*')
      .eq('difficulty_level', level);
    
    if (error) throw error;
    
    res.status(200).json({ questions: data });
  } catch (error) {
    console.error(`Error fetching questions for difficulty ${req.params.level}:`, error);
    res.status(500).json({ error: 'Failed to fetch questions by difficulty' });
  }
}));

// Get a specific question with its options or expected answers
app.get('/api/tech-questions/:id', asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the question
    const { data: questionData, error: questionError } = await supabase
      .from('technical_questions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (questionError) throw questionError;
    
    // Get MCQ options if it's an MCQ question
    if (questionData.question_type === 'mcq') {
      const { data: optionsData, error: optionsError } = await supabase
        .from('mcq_options')
        .select('*')
        .eq('question_id', id);
      
      if (optionsError) throw optionsError;
      
      res.status(200).json({ 
        question: questionData,
        mcqOptions: optionsData
      });
    } 
    // Get expected answer for short/long answer questions
    else {
      const { data: answerData, error: answerError } = await supabase
        .from('expected_answers')
        .select('*')
        .eq('question_id', id)
        .single();
      
      if (answerError) throw answerError;
      
      res.status(200).json({ 
        question: questionData,
        expectedAnswer: answerData
      });
    }
  } catch (error) {
    console.error(`Error fetching question ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch question details' });
  }
}));

// Submit a user response
app.post('/api/tech-questions/submit-response', asyncHandler(async (req, res) => {
  try {
    const { user_id, question_id, user_answer, time_taken } = req.body;
    
    if (!user_id || !question_id || !user_answer) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const response = {
      user_id,
      question_id,
      user_answer,
      time_taken: time_taken || null
    };
    
    const { data, error } = await supabase
      .from('user_responses')
      .insert(response)
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json({ 
      success: true,
      message: 'Response submitted successfully',
      response: data
    });
  } catch (error) {
    console.error('Error submitting user response:', error);
    res.status(500).json({ error: 'Failed to submit response' });
  }
}));

// Get user responses for a specific user
app.get('/api/tech-questions/user-responses/:userId', asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from('user_responses')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    res.status(200).json({ responses: data });
  } catch (error) {
    console.error(`Error fetching responses for user ${req.params.userId}:`, error);
    res.status(500).json({ error: 'Failed to fetch user responses' });
  }
}));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: err.message || 'Something went wrong!',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Data directory: ${dataDir}`);
});