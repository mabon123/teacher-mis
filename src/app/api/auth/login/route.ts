import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/middleware/auth'; // Assuming this path is correct

// Specify Node.js runtime
export const runtime = 'nodejs';

// Define allowed origin(s)
const allowedOrigin = 'http://localhost:5173'; // For development

// In production, change this to your actual deployed frontend URL, e.g.:
// const allowedOrigin = 'https://your-production-frontend.com';
// Or, for multiple origins:
// const allowedOrigins = ['http://localhost:5173', 'https://your-production-frontend.com'];


// --- NEW: Handle OPTIONS (Preflight) requests specifically ---
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    {}, // Empty body for OPTIONS response
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', // Crucial for preflight
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',     // Crucial for preflight
        'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours (optional but good)
      },
    }
  );
}
// --- END NEW OPTIONS Handler ---

export async function POST(request: NextRequest) {
  // You no longer need the `if (request.method === 'OPTIONS')` block inside POST
  // as the OPTIONS request is now handled by the separate OPTIONS function above.

  try {
    const body = await request.json();
    const { username, password, location } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': allowedOrigin, // Still need for the actual POST response
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
            'Access-Control-Allow-Origin': allowedOrigin, // Still need for the actual POST response
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin, // Still need for the actual POST response
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
          'Access-Control-Allow-Origin': allowedOrigin, // Still need for the actual POST response
          'Content-Type': 'application/json',
        },
      }
    );
  }
}