const fs = require('fs');
const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres.epauoqhfzpjccvldxasa:Niharikartist@11@aws-0-ap-south-1.pooler.supabase.com:6543/postgres'
});

async function runMigration() {
  try {
    // Try to connect with pooler URL or direct DB url
    // Let's try direct DB URL first
    const client = new Client({
      host: 'db.epauoqhfzpjccvldxasa.supabase.co',
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: 'Niharikartist@11'
    });

    await client.connect();
    console.log('Connected to PostgreSQL database');

    const sql = fs.readFileSync('../supabase/migrations/001_initial_schema.sql', 'utf8');
    await client.query(sql);
    console.log('Migration executed successfully');
    
    await client.end();
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

runMigration();
