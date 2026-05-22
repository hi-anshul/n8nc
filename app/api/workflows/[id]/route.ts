import { NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return NextResponse.json({ success: true, workflow: { id, name: "Workflow detail" } });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  try {
    const body = await request.json();
    return NextResponse.json({ success: true, workflow: { id, ...body } });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Invalid request payload" }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return NextResponse.json({ success: true, message: `Workflow ${id} deleted` });
}
