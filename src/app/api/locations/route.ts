import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/middleware/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Verify admin role
    const isAdmin = user.roles.some(ur => ur.role.code === 'ADMIN');
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name_en, name_kh, code, description } = body;

    // Validate required fields
    if (!name_en || !name_kh || !code) {
      return NextResponse.json(
        { error: 'Name (English), Name (Khmer), and Code are required' },
        { status: 400 }
      );
    }

    // Create location
    const location = await prisma.province.create({
      data: {
        name_en,
        name_kh,
        code,
        description,
        is_active: true,
        created_by: user.id,
        updated_by: user.id
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        active: 'CREATE_LOCATION',
        timestamp: new Date(),
        user_id: user.id,
        details: `Created new location: ${name_en} (${code})`
      }
    });

    return NextResponse.json(location);
  } catch (error) {
    console.error('Location creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 