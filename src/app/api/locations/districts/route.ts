import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { checkPermission } from '@/middleware/checkPermission';

const prisma = new PrismaClient();

// GET all districts
export async function GET(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'LOCATION_VIEW');
    if (!permissionCheck.allowed) {
      return permissionCheck.response;
    }

    const districts = await prisma.district.findMany({
      where: { is_active: true },
      include: {
        province: {
          select: {
            name_en: true,
            name_kh: true,
            code: true
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
    return NextResponse.json(districts);
  } catch (error) {
    console.error('Error fetching districts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST new district
export async function POST(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'LOCATION_CREATE');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }

    const body = await request.json();
    const { name_en, name_kh, code, description, province_id } = body;

    if (!name_en || !name_kh || !code || !province_id) {
      return NextResponse.json(
        { error: 'Name (English), Name (Khmer), Code, and Province ID are required' },
        { status: 400 }
      );
    }

    const district = await prisma.district.create({
      data: {
        name_en,
        name_kh,
        code,
        description,
        is_active: true,
        province_id,
        created_by: permissionCheck.user.id,
        updated_by: permissionCheck.user.id
      }
    });

    await prisma.auditLog.create({
      data: {
        active: 'CREATE_DISTRICT',
        timestamp: new Date(),
        user_id: permissionCheck.user.id,
        details: `Created new district: ${name_en} (${code})`
      }
    });

    return NextResponse.json(district);
  } catch (error) {
    console.error('District creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update district
export async function PUT(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'LOCATION_UPDATE');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }

    const body = await request.json();
    const { id, name_en, name_kh, code, description, is_active, province_id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'District ID is required' },
        { status: 400 }
      );
    }

    const district = await prisma.district.update({
      where: { id },
      data: {
        name_en,
        name_kh,
        code,
        description,
        is_active,
        province_id,
        updated_by: permissionCheck.user.id
      }
    });

    await prisma.auditLog.create({
      data: {
        active: 'UPDATE_DISTRICT',
        timestamp: new Date(),
        user_id: permissionCheck.user.id,
        details: `Updated district: ${name_en} (${code})`
      }
    });

    return NextResponse.json(district);
  } catch (error) {
    console.error('District update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE district (soft delete)
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
        { error: 'District ID is required' },
        { status: 400 }
      );
    }

    // Start a transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // Get all communes in this district
      const communes = await tx.commune.findMany({
        where: { district_id: id },
        select: { id: true }
      });

      const communeIds = communes.map(c => c.id);

      // Soft delete all villages in these communes
      await tx.village.updateMany({
        where: { commune_id: { in: communeIds } },
        data: {
          is_active: false,
          updated_by: permissionCheck.user.id
        }
      });

      // Soft delete all communes
      await tx.commune.updateMany({
        where: { district_id: id },
        data: {
          is_active: false,
          updated_by: permissionCheck.user.id
        }
      });

      // Finally, soft delete the district
      const district = await tx.district.update({
        where: { id },
        data: {
          is_active: false,
          updated_by: permissionCheck.user.id
        }
      });

      return district;
    });

    await prisma.auditLog.create({
      data: {
        active: 'DELETE_DISTRICT',
        timestamp: new Date(),
        user_id: permissionCheck.user.id,
        details: `Deleted district and all related communes and villages: ${result.name_en} (${result.code})`
      }
    });

    return NextResponse.json({ 
      message: 'District and all related locations deleted successfully' 
    });
  } catch (error) {
    console.error('District deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 