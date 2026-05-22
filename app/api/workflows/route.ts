import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  return NextResponse.json({ success: true, workflows: [] });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({ success: true, workflow: { id: "new-workflow", ...body } });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Invalid request payload" }, { status: 400 });
  }
}
