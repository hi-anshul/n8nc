import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  accessToken: async () => {
    if (typeof window !== 'undefined') {
      const Clerk = (window as any).Clerk;
      if (Clerk?.session) {
        try {
          return await Clerk.session.getToken();
        } catch (e) {
          console.error('Error getting Supabase token from Clerk:', e);
        }
      }
    }
    return null;
  }
});

