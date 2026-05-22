import { NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { slug } = await params;
  try {
    const triggerData = await request.json();
    return NextResponse.json({ success: true, triggerSlug: slug, status: "triggered", data: triggerData });
  } catch (error) {
    // If not JSON, process as empty/raw or throw
    return NextResponse.json({ success: true, triggerSlug: slug, status: "triggered", data: {} });
  }
}
