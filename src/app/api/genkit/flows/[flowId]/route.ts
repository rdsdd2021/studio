import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  {params}: {params: {flowId: string}}
) {
  // Placeholder implementation for Genkit flows
  const json = await req.json();
  console.log('Flow ID:', params.flowId, 'Data:', json);
  
  return NextResponse.json({ 
    success: true, 
    flowId: params.flowId,
    message: 'Genkit flow executed successfully'
  });
}

export async function GET(req: NextRequest) {
  return new Response('Genkit flows API is running', { status: 200 });
}
