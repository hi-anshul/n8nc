import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkSupabaseServerClient } from '@/lib/supabase/server';
import { encryptToken } from '@/lib/crypto';
import { CreateCredentialInput } from '@/types/credential';

export async function GET() {
  try {
    const supabase = await createClerkSupabaseServerClient();
    
    // Explicitly select fields, omitting encrypted_token
    const { data, error } = await supabase
      .from('credentials')
      .select('id, user_id, service, label, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[GET /api/credentials] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[GET /api/credentials] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const supabase = await createClerkSupabaseServerClient();
    const body: CreateCredentialInput = await req.json();
    
    if (!body.service || !body.label || !body.token) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Encrypt the sensitive token
    const encryptedToken = encryptToken(body.token);

    const { data, error } = await supabase
      .from('credentials')
      .insert({
        user_id: userId,
        service: body.service,
        label: body.label,
        encrypted_token: encryptedToken,
      })
      .select('id, user_id, service, label, created_at')
      .single();

    if (error) {
      console.error('[POST /api/credentials] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[POST /api/credentials] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
