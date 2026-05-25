import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateWorkflowFromPrompt } from '@/lib/ai/generateWorkflow';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Invalid prompt provided' }, { status: 400 });
    }

    const result = await generateWorkflowFromPrompt(prompt);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[POST /api/ai/generate] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
