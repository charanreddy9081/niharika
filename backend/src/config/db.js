const { createClient } = require('@supabase/supabase-js');

// Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in environment
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';

const supabase = createClient(supabaseUrl, supabaseKey);

// Log warning if placeholders are used
if (supabaseUrl === 'https://placeholder-project.supabase.co') {
  console.warn('⚠️ SUPABASE_URL is not set. Using placeholder. Database operations will fail.');
}

const connectDB = async () => {
  console.log('🚀 Supabase client initialized.');
};

module.exports = {
  supabase,
  connectDB,
  getIsConnected: () => true // For backward compatibility if used in middleware
};
