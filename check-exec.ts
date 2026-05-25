import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  const { data, error } = await supabase
    .from('executions')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(5);
    
  console.log('Error:', error);
  console.log('Data:', JSON.stringify(data, null, 2));
}

check();
