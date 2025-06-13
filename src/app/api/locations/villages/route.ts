import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { checkPermission } from '@/middleware/checkPermission';

const prisma = new PrismaClient();

// GET all villages
export async function GET(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'LOCATION_VIEW');
    if (!permissionCheck.allowed) {
      return permissionCheck.response;
    }

    const villages = await prisma.village.findMany({
      where: { is_active: true },
      include: {
        commune: {
          select: {
            name_en: true,
            name_kh: true,
            code: true,
            district: {
              select: {
                name_en: true,
                name_kh: true,
                code: true,
                province: {
                  select: {
                    name_en: true,
                    name_kh: true,
                    code: true
                  }
                }
              }
            }
          }
        },
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
    return NextResponse.json(villages);
  } catch (error) {
    console.error('Error fetching villages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST new village
export async function POST(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'LOCATION_CREATE');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }

    const body = await request.json();
    const { name_en, name_kh, code, description, commune_id } = body;

    if (!name_en || !name_kh || !code || !commune_id) {
      return NextResponse.json(
        { error: 'Name (English), Name (Khmer), Code, and Commune ID are required' },
        { status: 400 }
      );
    }

    const village = await prisma.village.create({
      data: {
        name_en,
        name_kh,
        code,
        description,
        is_active: true,
        commune_id,
        created_by: permissionCheck.user.id,
        updated_by: permissionCheck.user.id
      }
    });

    await prisma.auditLog.create({
      data: {
        active: 'CREATE_VILLAGE',
        timestamp: new Date(),
        user_id: permissionCheck.user.id,
        details: `Created new village: ${name_en} (${code})`
      }
    });

    return NextResponse.json(village);
  } catch (error) {
    console.error('Village creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update village
export async function PUT(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'LOCATION_UPDATE');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }

    const body = await request.json();
    const { id, name_en, name_kh, code, description, is_active, commune_id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Village ID is required' },
        { status: 400 }
      );
    }

    const village = await prisma.village.update({
      where: { id },
      data: {
        name_en,
        name_kh,
        code,
        description,
        is_active,
        commune_id,
        updated_by: permissionCheck.user.id
      }
    });

    await prisma.auditLog.create({
      data: {
        active: 'UPDATE_VILLAGE',
        timestamp: new Date(),
        user_id: permissionCheck.user.id,
        details: `Updated village: ${name_en} (${code})`
      }
    });

    return NextResponse.json(village);
  } catch (error) {
    console.error('Village update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE village (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'LOCATION_DELETE');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Village ID is required' },
        { status: 400 }
      );
    }

    const village = await prisma.village.update({
      where: { id },
      data: {
        is_active: false,
        updated_by: permissionCheck.user.id
      }
    });

    await prisma.auditLog.create({
      data: {
        active: 'DELETE_VILLAGE',
        timestamp: new Date(),
        user_id: permissionCheck.user.id,
        details: `Deleted village: ${village.name_en} (${village.code})`
      }
    });

    return NextResponse.json({ message: 'Village deleted successfully' });
  } catch (error) {
    console.error('Village deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 