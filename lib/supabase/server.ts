import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Creates a Supabase client that uses the authenticated user's Clerk JWT token.
 * This client respects Postgres Row-Level Security (RLS) policies.
 */
export async function createClerkSupabaseServerClient() {
  const { getToken } = await auth();
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    accessToken: async () => {
      try {
        return await getToken();
      } catch (err) {
        console.error('Error fetching Clerk token for Supabase server client:', err);
        return null;
      }
    }
  });
}

/**
 * Creates a Supabase client using the service role key.
 * This client bypasses RLS policies and should only be used for system actions.
 */
export function createServiceSupabaseClient() {
  if (!supabaseServiceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables.');
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  });
}

