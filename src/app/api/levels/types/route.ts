import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { checkPermission } from '@/middleware/checkPermission';
import { logAudit } from '@/services/auditService';

const prisma = new PrismaClient();

// Helper function to get client info
function getClientInfo(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return { ip, userAgent };
}

// GET all level types
export async function GET(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'LEVEL_VIEW');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }

    const levelTypes = await prisma.levelType.findMany({
      where: { is_active: true },
      include: {
        can_manage_levels: true,
        managed_by_levels: true,
        creator: {
          select: {
            username: true
          }
        },
        updater: {
          select: {
            username: true
          }
        }
      }
    });

    // Log the view action
    const { ip, userAgent } = getClientInfo(request);
    await logAudit({
      userId: permissionCheck.user.id,
      action: 'LEVEL_VIEW',
      success: true,
      ipAddress: ip,
      userAgent
    });

    return NextResponse.json(levelTypes);
  } catch (error) {
    console.error('Error fetching level types:', error);
    return NextResponse.json({ error: 'Failed to fetch level types' }, { status: 500 });
  }
}

// POST create new level type
export async function POST(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'LEVEL_CREATE');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }

    const body = await request.json();
    const { name_en, name_kh, code, level_order, can_manage_levels_ids, description } = body;

    // Validate required fields
    if (!name_en || !name_kh || !code || !level_order) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const levelType = await prisma.levelType.create({
      data: {
        name_en,
        name_kh,
        code,
        level_order,
        can_manage_levels_ids: can_manage_levels_ids || [],
        description,
        created_by: permissionCheck.user.id,
        updated_by: permissionCheck.user.id
      }
    });

    // Log the creation action
    const { ip, userAgent } = getClientInfo(request);
    await logAudit({
      userId: permissionCheck.user.id,
      action: 'LEVEL_CREATE',
      success: true,
      ipAddress: ip,
      userAgent,
      details: `Created level type: ${levelType.name_en}`
    });

    return NextResponse.json(levelType);
  } catch (error) {
    console.error('Error creating level type:', error);
    return NextResponse.json({ error: 'Failed to create level type' }, { status: 500 });
  }
}

// PUT update level type
export async function PUT(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'LEVEL_UPDATE');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }

    const body = await request.json();
    const { id, name_en, name_kh, code, level_order, can_manage_levels_ids, description } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Level type ID is required' },
        { status: 400 }
      );
    }

    // Check if level type exists
    const existingLevelType = await prisma.levelType.findUnique({
      where: { id }
    });

    if (!existingLevelType) {
      return NextResponse.json(
        { error: 'Level type not found' },
        { status: 404 }
      );
    }

    const updatedLevelType = await prisma.levelType.update({
      where: { id },
      data: {
        name_en,
        name_kh,
        code,
        level_order,
        can_manage_levels_ids: can_manage_levels_ids || [],
        description,
        updated_by: permissionCheck.user.id
      }
    });

    // Log the update action
    const { ip, userAgent } = getClientInfo(request);
    await logAudit({
      userId: permissionCheck.user.id,
      action: 'LEVEL_UPDATE',
      success: true,
      ipAddress: ip,
      userAgent,
      details: `Updated level type: ${updatedLevelType.name_en}`
    });

    return NextResponse.json(updatedLevelType);
  } catch (error) {
    console.error('Error updating level type:', error);
    return NextResponse.json({ error: 'Failed to update level type' }, { status: 500 });
  }
}

// DELETE level type
export async function DELETE(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'LEVEL_DELETE');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Level type ID is required' },
        { status: 400 }
      );
    }

    // Check if level type exists
    const existingLevelType = await prisma.levelType.findUnique({
      where: { id }
    });

    if (!existingLevelType) {
      return NextResponse.json(
        { error: 'Level type not found' },
        { status: 404 }
      );
    }

    // Soft delete by setting is_active to false
    await prisma.levelType.update({
      where: { id },
      data: {
        is_active: false,
        updated_by: permissionCheck.user.id
      }
    });

    // Log the deletion action
    const { ip, userAgent } = getClientInfo(request);
    await logAudit({
      userId: permissionCheck.user.id,
      action: 'LEVEL_DELETE',
      success: true,
      ipAddress: ip,
      userAgent,
      details: `Deleted level type: ${existingLevelType.name_en}`
    });

    return NextResponse.json({ message: 'Level type deleted successfully' });
  } catch (error) {
    console.error('Error deleting level type:', error);
    return NextResponse.json({ error: 'Failed to delete level type' }, { status: 500 });
  }
} 