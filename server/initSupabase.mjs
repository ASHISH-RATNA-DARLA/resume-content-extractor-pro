import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client with the correct URL and service role key
const supabaseUrl = 'https://mlqmtqzwronhxiuzelcs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1scW10cXp3cm9uaHhpdXplbGNzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDMxNDIxNCwiZXhwIjoyMDY1ODkwMjE0fQ.AMdQS1AJ3AgpEYaFvn6vqu0liFoNMs0FaFBHsln8ZYI';
const supabase = createClient(supabaseUrl, supabaseKey);

// Read SQL file
const sqlFilePath = path.join(__dirname, '..', 'tech_questions_db.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// Split SQL into individual statements
const statements = sqlContent
  .replace(/--.*$/gm, '') // Remove comments
  .split(';')
  .filter(statement => statement.trim() !== '');

// Execute each SQL statement
async function initializeDatabase() {
  console.log('Starting database initialization...');
  
  try {
    // First, check if tables already exist
    const { data: existingTables, error: tablesError } = await supabase
      .from('technical_questions')
      .select('id')
      .limit(1);
    
    if (!tablesError && existingTables && existingTables.length > 0) {
      console.log('Database already initialized. Skipping initialization.');
      return;
    }
    
    // Create tables first
    const createTableStatements = statements.filter(stmt => 
      stmt.trim().toUpperCase().startsWith('CREATE TABLE')
    );
    
    console.log(`Found ${createTableStatements.length} CREATE TABLE statements`);
    
    for (const statement of createTableStatements) {
      console.log(`Executing: ${statement.substring(0, 60)}...`);
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      
      if (error) {
        console.error('Error creating table:', error);
        console.error('Statement:', statement);
      }
    }
    
    // Then insert data
    const insertStatements = statements.filter(stmt => 
      stmt.trim().toUpperCase().startsWith('INSERT INTO')
    );
    
    console.log(`Found ${insertStatements.length} INSERT statements`);
    
    for (const statement of insertStatements) {
      console.log(`Executing: ${statement.substring(0, 60)}...`);
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      
      if (error) {
        console.error('Error inserting data:', error);
        console.error('Statement:', statement);
      }
    }
    
    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Run the initialization
initializeDatabase();