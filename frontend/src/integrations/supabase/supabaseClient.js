import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Manage user ID persistence
export const getUserId = () => {
  let userId = localStorage.getItem('cropsay_user_id');
  if (!userId) {
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('cropsay_user_id', userId);
  }
  console.log('Current user ID:', userId);
  return userId;
};

// Helper function to check if tables exist using REST API
export const ensureTablesExist = async () => {
  try {
    console.log('Checking if tables exist in Supabase...');
    
    // Check if chat_sessions table exists by trying to query it
    const { data: sessionData, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('id')
      .limit(1);
      
    if (sessionError) {
      if (sessionError.code === '42P01') { // Table doesn't exist
        console.log('chat_sessions table does not exist.');
        return false;
      } else {
        console.error('Error checking chat_sessions:', sessionError);
        return false;
      }
    }
    
    // Check if chat_messages table exists
    const { data: messageData, error: messageError } = await supabase
      .from('chat_messages')
      .select('id')
      .limit(1);
      
    if (messageError) {
      if (messageError.code === '42P01') { // Table doesn't exist
        console.log('chat_messages table does not exist.');
        return false;
      } else {
        console.error('Error checking chat_messages:', messageError);
        return false;
      }
    }
    
    // Both tables exist
    console.log('All tables exist in Supabase.');
    return true;
  } catch (error) {
    console.error('Error checking if tables exist:', error);
    return false;
  }
};

// Create fallback tables in memory if Supabase tables don't exist
export const createMemoryTables = () => {
  console.log('Creating fallback memory tables for this session');
  
  // Create memory storage
  if (!window.memoryStorage) {
    window.memoryStorage = {
      chat_sessions: [],
      chat_messages: []
    };
  }
  
  return true;
};
