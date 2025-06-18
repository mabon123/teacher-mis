import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/middleware/auth'; // Assuming this path is correct

// Specify Node.js runtime
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  // Define allowed origin(s)
  const allowedOrigin = 'http://localhost:5173'; // For development

  // In production, change this to your actual deployed frontend URL, e.g.:
  // const allowedOrigin = 'https://your-production-frontend.com';
  // Or, for multiple origins:
  // const allowedOrigins = ['http://localhost:5173', 'https://your-production-frontend.com'];
  // const origin = request.headers.get('origin');
  // if (origin && allowedOrigins.includes(origin)) {
  //   res.setHeader('Access-Control-Allow-Origin', origin);
  // }


  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    return NextResponse.json(
      {},
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': allowedOrigin, // Allow your frontend origin
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', // Methods your API supports
          'Access-Control-Allow-Headers': 'Content-Type, Authorization', // Headers your API expects
          'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
        },
      }
    );
  }

  // Handle the actual POST request
  try {
    const body = await request.json();
    const { username, password, location } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': allowedOrigin,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const result = await login(username, password, location);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        {
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': allowedOrigin,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': allowedOrigin,
          'Content-Type': 'application/json',
        },
      }
    );
  }
}