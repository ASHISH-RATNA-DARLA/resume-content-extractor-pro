# Supabase Integration for Technical Questions Database

This document explains how to set up and use the Supabase integration for the technical questions database.

## Overview

We've integrated Supabase to store and manage technical interview questions. The integration includes:

1. A database schema for technical questions, MCQ options, expected answers, and user responses
2. API endpoints to interact with the questions database
3. A React component to display and interact with the questions
4. A script to initialize the database with sample data

## Setup Instructions

### 1. Install Dependencies

The Supabase client library has been added to the project. If you need to install it manually, run:

```bash
npm install @supabase/supabase-js
```

### 2. Configure Supabase Connection

The Supabase connection is configured in `src/lib/supabase.ts` and `server/server.mjs`. Make sure to update the Supabase URL to your actual Supabase project URL:

```typescript
// In src/lib/supabase.ts and server/server.mjs
const supabaseUrl = 'https://supabase.co'; // Replace with your actual Supabase URL
const supabaseKey = 'sb_secret_FIjfX4w7fuLMSEidCd2QpQ_PGkc0bHU';
```

### 3. Initialize the Database

To initialize the database with the schema and sample data from `tech_questions_db.sql`, run:

```bash
npm run init-db
```

This will create the necessary tables and populate them with sample technical questions.

## Features

### Technical Questions Page

A new page has been added at `/tech-questions` that allows users to:

- Browse technical questions
- Filter questions by tech stack and difficulty level
- View question details
- Submit answers to questions
- See correct answers for MCQ questions

### API Endpoints

The following API endpoints have been added to interact with the technical questions database:

- `GET /api/tech-questions` - Get all technical questions
- `GET /api/tech-questions/tech-stack/:techStack` - Get questions by tech stack
- `GET /api/tech-questions/difficulty/:level` - Get questions by difficulty level
- `GET /api/tech-questions/:id` - Get a specific question with its options or expected answers
- `POST /api/tech-questions/submit-response` - Submit a user response
- `GET /api/tech-questions/user-responses/:userId` - Get user responses for a specific user

### Client-Side Service

A TypeScript service has been created at `src/lib/techQuestionsService.ts` to interact with the Supabase database from the client side. This service provides methods to:

- Get all questions
- Get questions by tech stack or difficulty
- Get question details
- Submit user responses
- Get user responses

## Usage

1. Start the development server:

```bash
npm run dev:all
```

2. Navigate to the Technical Questions page:
   - Click on the "Technical Questions" card on the home page, or
   - Click the "Explore Technical Questions" button, or
   - Go directly to `/tech-questions`

3. Browse and interact with the technical questions.

## Troubleshooting

If you encounter issues with the Supabase connection:

1. Make sure your Supabase URL and key are correct
2. Check that the database has been initialized with `npm run init-db`
3. Verify that the Supabase service is running and accessible
4. Check the browser console and server logs for error messages