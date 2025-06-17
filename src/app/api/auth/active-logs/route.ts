import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { checkPermission } from '@/middleware/checkPermission';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Check if user has permission to view logs
    const permissionCheck = await checkPermission(request, 'LOG_VIEW');
    if (!permissionCheck.allowed) {
      return permissionCheck.response;
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;

    const where: Prisma.ActiveLogWhereInput = {};
    if (userId) {
      where.user_id = userId;
    }
    if (startDate || endDate) {
      where.start_at = {};
      if (startDate) {
        where.start_at.gte = startDate;
      }
      if (endDate) {
        where.start_at.lte = endDate;
      }
    }

    const logs = await prisma.activeLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      },
      orderBy: {
        start_at: 'desc'
      }
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching active logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active logs' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check if user has permission to update logs
    const permissionCheck = await checkPermission(request, 'LOG_UPDATE');
    if (!permissionCheck.allowed) {
      return permissionCheck.response;
    }

    const body = await request.json();
    const { sessionId, endedAt } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const log = await prisma.activeLog.update({
      where: {
        id: sessionId
      },
      data: {
        ended_at: endedAt || new Date()
      }
    });

    return NextResponse.json(log);
  } catch (error) {
    console.error('Error updating active log:', error);
    return NextResponse.json(
      { error: 'Failed to update active log' },
      { status: 500 }
    );
  }
} 