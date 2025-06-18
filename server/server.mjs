import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import asyncHandler from 'express-async-handler';
import mammoth from 'mammoth';
import { extractPdfText } from './pdfParser.mjs';

// Get current directory (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

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
    return [];
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading resume data:', error);
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