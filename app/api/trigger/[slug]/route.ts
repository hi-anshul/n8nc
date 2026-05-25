import { NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase/server';
import { runWorkflow } from '@/lib/executor';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // We use the Service Role client because external webhooks are unauthenticated
    const supabase = createServiceSupabaseClient();

    // 1. Find the workflow
    const { data: workflow, error: findError } = await supabase
      .from('workflows')
      .select('*')
      .eq('trigger_slug', slug)
      .single();

    if (findError || !workflow) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }

    if (!workflow.is_active) {
      return NextResponse.json({ error: 'Workflow is not active' }, { status: 400 });
    }

    // 2. Extract payload
    let triggerData: Record<string, any> = {};
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      triggerData = await req.json();
    } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      formData.forEach((value, key) => {
        triggerData[key] = value;
      });
    }

    // 3. Execute Workflow Asynchronously
    // We intentionally don't await this so the webhook responds immediately (fire-and-forget).
    // Note: In a serverless environment like Vercel, fire-and-forget might get killed early. 
    // If you deploy to Vercel, you should wrap this in `waitUntil(runWorkflow(...))` 
    // or just await it if the execution is fast. For local testing, awaiting is safer.
    await runWorkflow(supabase, workflow, triggerData);

    return NextResponse.json({ success: true, message: 'Execution started' });
  } catch (error: any) {
    console.error('[POST /api/trigger/[slug]] Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
