import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { checkPermission } from '@/middleware/checkPermission';

const prisma = new PrismaClient();

// GET all communes
export async function GET(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'LOCATION_VIEW');
    if (!permissionCheck.allowed) {
      return permissionCheck.response;
    }

    const communes = await prisma.commune.findMany({
      where: { is_active: true },
      include: {
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
    return NextResponse.json(communes);
  } catch (error) {
    console.error('Error fetching communes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST new commune
export async function POST(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'LOCATION_CREATE');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }

    const body = await request.json();
    const { name_en, name_kh, code, description, district_id } = body;

    if (!name_en || !name_kh || !code || !district_id) {
      return NextResponse.json(
        { error: 'Name (English), Name (Khmer), Code, and District ID are required' },
        { status: 400 }
      );
    }

    const commune = await prisma.commune.create({
      data: {
        name_en,
        name_kh,
        code,
        description,
        is_active: true,
        district_id,
        created_by: permissionCheck.user.id,
        updated_by: permissionCheck.user.id
      }
    });

    await prisma.auditLog.create({
      data: {
        active: 'CREATE_COMMUNE',
        timestamp: new Date(),
        user_id: permissionCheck.user.id,
        details: `Created new commune: ${name_en} (${code})`
      }
    });

    return NextResponse.json(commune);
  } catch (error) {
    console.error('Commune creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update commune
export async function PUT(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'LOCATION_UPDATE');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }

    const body = await request.json();
    const { id, name_en, name_kh, code, description, is_active, district_id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Commune ID is required' },
        { status: 400 }
      );
    }

    const commune = await prisma.commune.update({
      where: { id },
      data: {
        name_en,
        name_kh,
        code,
        description,
        is_active,
        district_id,
        updated_by: permissionCheck.user.id
      }
    });

    await prisma.auditLog.create({
      data: {
        active: 'UPDATE_COMMUNE',
        timestamp: new Date(),
        user_id: permissionCheck.user.id,
        details: `Updated commune: ${name_en} (${code})`
      }
    });

    return NextResponse.json(commune);
  } catch (error) {
    console.error('Commune update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE commune (soft delete)
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
        { error: 'Commune ID is required' },
        { status: 400 }
      );
    }

    // Start a transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // Soft delete all villages in this commune
      await tx.village.updateMany({
        where: { commune_id: id },
        data: {
          is_active: false,
          updated_by: permissionCheck.user.id
        }
      });

      // Finally, soft delete the commune
      const commune = await tx.commune.update({
        where: { id },
        data: {
          is_active: false,
          updated_by: permissionCheck.user.id
        }
      });

      return commune;
    });

    await prisma.auditLog.create({
      data: {
        active: 'DELETE_COMMUNE',
        timestamp: new Date(),
        user_id: permissionCheck.user.id,
        details: `Deleted commune and all related villages: ${result.name_en} (${result.code})`
      }
    });

    return NextResponse.json({ 
      message: 'Commune and all related locations deleted successfully' 
    });
  } catch (error) {
    console.error('Commune deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 