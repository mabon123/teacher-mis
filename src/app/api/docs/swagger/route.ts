import { NextRequest, NextResponse } from 'next/server';
import { getApiDocs } from '@/docs/swagger/swagger';

export async function GET(request: NextRequest) {
  const spec = getApiDocs();
  return NextResponse.json(spec);
} 