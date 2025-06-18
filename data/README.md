
# Resume Data Storage

This directory contains the extracted resume data in JSON format.

## File Structure

- `resumes.json` - Contains all parsed resume data with the following structure:

```json
[
  {
    "id": "unique_timestamp_id",
    "fileName": "original_file_name.pdf",
    "extractedText": "full_extracted_text_content",
    "parsedAt": "2024-01-01T00:00:00.000Z",
    "fileType": ".pdf"
  }
]
```

## Data Fields

- **id**: Unique identifier for each resume (timestamp-based)
- **fileName**: Original name of the uploaded file
- **extractedText**: Full text content extracted from the resume
- **parsedAt**: ISO timestamp of when the resume was processed
- **fileType**: File extension (.pdf or .docx)

## Usage

The resume data can be accessed through the `/api/get-resumes` endpoint or by reading the JSON file directly for further processing or analysis.
