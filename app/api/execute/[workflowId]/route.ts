import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkSupabaseServerClient, createServiceSupabaseClient } from '@/lib/supabase/server';
import { runWorkflow } from '@/lib/executor';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  try {
    const { workflowId } = await params;
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClerkSupabaseServerClient();

    // 1. Find the workflow
    const { data: workflow, error: findError } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', workflowId)
      .eq('user_id', userId)
      .single();

    if (findError || !workflow) {
      return NextResponse.json({ error: 'Workflow not found or access denied' }, { status: 404 });
    }

    // 2. Extract manual trigger payload (if any)
    let triggerData: Record<string, any> = {};
    try {
      const body = await req.json();
      triggerData = body || {};
    } catch {
      // Body might be empty, ignore
    }

    // 3. Execute Workflow synchronously so we can return the result
    // We pass the Service Role client to the engine so it has permission to update the executions table
    // (since our RLS policies currently don't allow authenticated users to UPDATE executions)
    const adminSupabase = createServiceSupabaseClient();
    await runWorkflow(adminSupabase, workflow, triggerData);

    // Fetch the latest execution for this workflow to return
    const { data: latestExecution } = await supabase
      .from('executions')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('started_at', { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({ success: true, execution: latestExecution });
  } catch (error: any) {
    console.error('[POST /api/execute/[workflowId]] Manual execute error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
