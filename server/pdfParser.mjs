import fs from 'fs';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

/**
 * Extract text from a PDF file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} - Extracted text from the PDF
 */
export async function extractPdfText(filePath) {
  try {
    // Read the PDF file
    const dataBuffer = fs.readFileSync(filePath);
    
    // Parse the PDF content
    const data = await pdfParse(dataBuffer);
    
    // Return the extracted text
    return data.text;
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error(`Failed to extract PDF text: ${error.message}`);
  }
}