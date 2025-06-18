# Resume Content Extractor Pro

A modern web application for extracting and managing content from resume files (PDF and DOCX).

## Features

- Upload and parse resume files (PDF and DOCX)
- Extract text content from resumes
- View and manage parsed resumes
- Download extracted data in JSON format

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Shadcn UI, Tailwind CSS
- **Backend**: Express.js, Node.js
- **File Processing**: Mammoth (DOCX parsing)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

### Running the Application

#### Start both frontend and backend:

```bash
npm run dev:all
```

Or use the provided batch file:

```bash
start-all.bat
```

#### Start only the backend server:

```bash
npm run server
```

Or use the provided batch file:

```bash
start-server.bat
```

#### Start only the frontend:

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

## API Endpoints

- `POST /api/upload-resume` - Upload and parse a resume file
- `GET /api/get-resumes` - Get all parsed resumes
- `GET /api/get-resume/:id` - Get a specific resume by ID

## Project Structure

- `/src` - Frontend React application
- `/server` - Backend Express server
- `/data` - Parsed resume data storage
- `/public` - Static assets

## Original Project Info

This project was originally created with [Lovable](https://lovable.dev/projects/5b1cca8f-02b3-4b14-b9e5-28d7768ab915).

## License

MIT
