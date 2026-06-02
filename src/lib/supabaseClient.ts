import { createClient } from '@supabase/supabase-js';

// Default user-provided credentials
const DEFAULT_PROJECT_ID = 'savzqksbvknxrcxctfto';
const DEFAULT_ANON_KEY = 'sb_publishable_oRrGv5TW-0LU6xE5N2aHiA_jSO-hMea';

// Retrieve credentials from localStorage or use the default
export const getSupabaseConfig = () => {
  const savedId = localStorage.getItem('supabase_project_id');
  const savedKey = localStorage.getItem('supabase_anon_key');
  
  const projectId = savedId || DEFAULT_PROJECT_ID;
  const anonKey = savedKey || DEFAULT_ANON_KEY;
  const url = `https://${projectId}.supabase.co`;
  
  return { projectId, anonKey, url };
};

export const setSupabaseConfig = (projectId: string, anonKey: string) => {
  localStorage.setItem('supabase_project_id', projectId);
  localStorage.setItem('supabase_anon_key', anonKey);
};

export const resetSupabaseConfig = () => {
  localStorage.removeItem('supabase_project_id');
  localStorage.removeItem('supabase_anon_key');
};

const config = getSupabaseConfig();

// Create initial client
export const supabase = createClient(config.url, config.anonKey, {
  auth: {
    persistSession: false
  }
});

// Helper to recreate client dynamically if config changes
export const recreateSupabaseClient = (projectId: string, anonKey: string) => {
  const url = `https://${projectId}.supabase.co`;
  return createClient(url, anonKey, {
    auth: {
      persistSession: false
    }
  });
};
