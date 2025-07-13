import {run} from '@genkit-ai/next';
import {NextRequest, NextResponse} from 'next/server';

export async function POST(
  req: NextRequest,
  {params}: {params: {flowId: string}}
) {
  const json = await req.json();
  const output = await run(params.flowId, () => json);
  return NextResponse.json(output);
}
