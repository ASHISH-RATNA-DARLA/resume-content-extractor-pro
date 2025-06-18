
import pdfParse from 'pdf-parse';

/**
 * Extract text from a PDF file
 * This function tries to use the client-side pdf-parse library
 * @param file The PDF file to extract text from
 * @returns The extracted text
 */
export async function extractPdfText(file: File): Promise<string> {
  try {
    // Use client-side extraction with pdf-parse
    const arrayBuffer = await file.arrayBuffer();
    const dataBuffer = new Uint8Array(arrayBuffer);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error('Failed to extract PDF text. Please try uploading through the server instead.');
  }
}
