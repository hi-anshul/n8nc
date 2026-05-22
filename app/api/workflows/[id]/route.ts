import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkSupabaseServerClient } from '@/lib/supabase/server';
import { UpdateWorkflowInput } from '@/types/workflow';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ─── GET /api/workflows/[id] ──────────────────────────────────────────────────
// Returns a single workflow. RLS ensures the requesting user owns it.

export async function GET(_request: Request, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = await createClerkSupabaseServerClient();

  const { data, error } = await supabase
    .from('workflows')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
  }

  return NextResponse.json({ workflow: data });
}

// ─── PUT /api/workflows/[id] ──────────────────────────────────────────────────
// Updates allowed fields on an owned workflow. Bumps updated_at.

export async function PUT(request: Request, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: UpdateWorkflowInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { id } = await params;

  // Build the update payload — only include fields that were provided
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.name !== undefined) update.name = body.name.trim();
  if (body.description !== undefined) update.description = body.description.trim() || null;
  if (body.graph !== undefined) update.graph = body.graph;
  if (body.is_active !== undefined) update.is_active = body.is_active;

  const supabase = await createClerkSupabaseServerClient();

  const { data, error } = await supabase
    .from('workflows')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    console.error('[PUT /api/workflows/[id]] Supabase error:', error?.message);
    return NextResponse.json({ error: 'Workflow not found or update failed' }, { status: 404 });
  }

  return NextResponse.json({ workflow: data });
}

// ─── DELETE /api/workflows/[id] ───────────────────────────────────────────────
// Hard-deletes a workflow. Executions cascade-delete automatically (FK).

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = await createClerkSupabaseServerClient();

  const { error } = await supabase
    .from('workflows')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[DELETE /api/workflows/[id]] Supabase error:', error.message);
    return NextResponse.json({ error: 'Failed to delete workflow' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
