import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkSupabaseServerClient } from '@/lib/supabase/server';
import { decryptToken } from '@/lib/crypto';
import { createNotionPage } from '@/lib/notion/client';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClerkSupabaseServerClient();
    
    const body = await req.json();
    const { credentialId, databaseId } = body;
    
    if (!credentialId || !databaseId) {
      return NextResponse.json({ error: 'Missing credentialId or databaseId' }, { status: 400 });
    }

    // 1. Fetch credential
    const { data: credData, error: credError } = await supabase
      .from('credentials')
      .select('encrypted_token')
      .eq('id', credentialId)
      .eq('user_id', userId)
      .single();

    if (credError || !credData) {
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 });
    }

    // 2. Decrypt token
    const token = decryptToken(credData.encrypted_token);

    // 3. Create dummy page in Notion
    // Note: This assumes the target database has a standard "Name" property as the primary title column.
    const properties = {
      'Name': {
        title: [
          {
            text: {
              content: 'Hello from n8nc Test!',
            },
          },
        ],
      },
    };

    const result = await createNotionPage(token, databaseId, properties);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('[POST /api/test-notion] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
