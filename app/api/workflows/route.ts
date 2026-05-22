import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkSupabaseServerClient } from '@/lib/supabase/server';
import { CreateWorkflowInput } from '@/types/workflow';

// ─── GET /api/workflows ───────────────────────────────────────────────────────
// Returns all workflows owned by the authenticated user, ordered by last update.

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClerkSupabaseServerClient();

  const { data, error } = await supabase
    .from('workflows')
    .select('id, user_id, name, description, is_active, trigger_slug, created_at, updated_at')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('[GET /api/workflows] Supabase error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch workflows' }, { status: 500 });
  }

  return NextResponse.json({ workflows: data ?? [] });
}

// ─── POST /api/workflows ──────────────────────────────────────────────────────
// Creates a new workflow row. Generates a unique trigger_slug automatically.

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: CreateWorkflowInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
    return NextResponse.json({ error: 'Workflow name is required' }, { status: 422 });
  }

  // Generate a short random trigger slug (8 hex chars)
  const trigger_slug = crypto.randomUUID().replace(/-/g, '').slice(0, 8);

  const supabase = await createClerkSupabaseServerClient();

  const { data, error } = await supabase
    .from('workflows')
    .insert({
      user_id: userId,
      name: body.name.trim(),
      description: body.description?.trim() ?? null,
      graph: body.graph ?? { nodes: [], edges: [] },
      is_active: false,
      trigger_slug,
    })
    .select()
    .single();

  if (error) {
    console.error('[POST /api/workflows] Supabase error:', error.message);
    return NextResponse.json({ error: 'Failed to create workflow' }, { status: 500 });
  }

  return NextResponse.json({ workflow: data }, { status: 201 });
}
