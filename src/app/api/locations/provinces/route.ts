import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { checkPermission } from '@/middleware/checkPermission';

const prisma = new PrismaClient();

// GET all provinces
export async function GET(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'LOCATION_VIEW');
    if (!permissionCheck.allowed) {
      return permissionCheck.response;
    }

    const provinces = await prisma.province.findMany({
      where: { is_active: true },
      include: {
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
        // --- ADD CACHE-CONTROL HEADERS HERE ---
    const response = NextResponse.json(provinces);
    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    // --- END CACHE-CONTROL HEADERS ---
    return NextResponse.json(provinces);
  } catch (error) {
    console.error('Error fetching provinces:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST new province
export async function POST(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'LOCATION_CREATE');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }

    const body = await request.json();
    const { name_en, name_kh, code, description } = body;

    if (!name_en || !name_kh || !code) {
      return NextResponse.json(
        { error: 'Name (English), Name (Khmer), and Code are required' },
        { status: 400 }
      );
    }

    const province = await prisma.province.create({
      data: {
        name_en,
        name_kh,
        code,
        description,
        is_active: true,
        created_by: permissionCheck.user.id,
        updated_by: permissionCheck.user.id
      }
    });

    await prisma.auditLog.create({
      data: {
        active: 'CREATE_PROVINCE',
        timestamp: new Date(),
        user_id: permissionCheck.user.id,
        details: `Created new province: ${name_en} (${code})`
      }
    });

    return NextResponse.json(province);
  } catch (error) {
    console.error('Province creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update province
export async function PUT(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'LOCATION_UPDATE');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }

    const body = await request.json();
    const { id, name_en, name_kh, code, description, is_active } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Province ID is required' },
        { status: 400 }
      );
    }

    const province = await prisma.province.update({
      where: { id },
      data: {
        name_en,
        name_kh,
        code,
        description,
        is_active,
        updated_by: permissionCheck.user.id
      }
    });

    await prisma.auditLog.create({
      data: {
        active: 'UPDATE_PROVINCE',
        timestamp: new Date(),
        user_id: permissionCheck.user.id,
        details: `Updated province: ${name_en} (${code})`
      }
    });

    return NextResponse.json(province);
  } catch (error) {
    console.error('Province update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE province (soft delete)
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
        { error: 'Province ID is required' },
        { status: 400 }
      );
    }

    // Start a transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // Get all districts in this province
      const districts = await tx.district.findMany({
        where: { province_id: id },
        select: { id: true }
      });

      const districtIds = districts.map(d => d.id);

      // Get all communes in these districts
      const communes = await tx.commune.findMany({
        where: { district_id: { in: districtIds } },
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
        where: { district_id: { in: districtIds } },
        data: {
          is_active: false,
          updated_by: permissionCheck.user.id
        }
      });

      // Soft delete all districts
      await tx.district.updateMany({
        where: { province_id: id },
        data: {
          is_active: false,
          updated_by: permissionCheck.user.id
        }
      });

      // Finally, soft delete the province
      const province = await tx.province.update({
        where: { id },
        data: {
          is_active: false,
          updated_by: permissionCheck.user.id
        }
      });

      return province;
    });

    await prisma.auditLog.create({
      data: {
        active: 'DELETE_PROVINCE',
        timestamp: new Date(),
        user_id: permissionCheck.user.id,
        details: `Deleted province and all related districts, communes, and villages: ${result.name_en} (${result.code})`
      }
    });

    return NextResponse.json({ 
      message: 'Province and all related locations deleted successfully' 
    });
  } catch (error) {
    console.error('Province deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 