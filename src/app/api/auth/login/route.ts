import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/middleware/auth';

// Specify Node.js runtime
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {

  try {
    const body = await request.json();
    const { username, password, location } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const result = await login(username, password, location);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 