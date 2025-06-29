import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/middleware/checkPermission';

// GET - Get all permission groups
export async function GET(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'PERMISSION_GROUP_VIEW');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const isActive = searchParams.get('is_active');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (search) {
      where.OR = [
        { name_en: { contains: search, mode: 'insensitive' } },
        { name_kh: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (isActive !== null && isActive !== undefined) {
      where.is_active = isActive === 'true';
    }

    const [permissionGroups, total] = await Promise.all([
      prisma.permissionGroup.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name_en: 'asc' },
        include: {
          permissions: {
            orderBy: { name_en: 'asc' },
          },
        },
      }),
      prisma.permissionGroup.count({ where }),
    ]);

    return NextResponse.json({
      data: permissionGroups,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching permission groups:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new permission group
export async function POST(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'PERMISSION_GROUP_CREATE');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }
    const user = permissionCheck.user;

    const body = await request.json();
    const { name_en, name_kh, code, description, is_active = true } = body;

    // Validate required fields
    if (!name_en || !name_kh || !code) {
      return NextResponse.json(
        { error: 'Name (English), Name (Khmer), and Code are required' },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existingGroup = await prisma.permissionGroup.findUnique({
      where: { code },
    });

    if (existingGroup) {
      return NextResponse.json(
        { error: 'Permission group with this code already exists' },
        { status: 400 }
      );
    }

    // Create permission group
    const permissionGroup = await prisma.permissionGroup.create({
      data: {
        name_en,
        name_kh,
        code,
        description,
        is_active,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        active: 'CREATE',
        timestamp: new Date(),
        user_id: user.id,
        details: `Created permission group: ${name_en} (${code})`,
      },
    });

    return NextResponse.json(
      { message: 'Permission group created successfully', data: permissionGroup },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating permission group:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update permission group
export async function PUT(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'PERMISSION_GROUP_UPDATE');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }
    const { id, name_en, name_kh, code, description } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    const group = await prisma.permissionGroup.update({
      where: { id },
      data: { name_en, name_kh, code, description },
    });
    return NextResponse.json(group);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update permission group' }, { status: 500 });
  }
}

// DELETE permission group
export async function DELETE(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'PERMISSION_GROUP_DELETE');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    await prisma.permissionGroup.delete({ where: { id } });
    return NextResponse.json({ message: 'Permission group deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete permission group' }, { status: 500 });
  }
}

// PATCH: Add or update permissions in a group
export async function PATCH(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'PERMISSION_GROUP_UPDATE');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }
    const { id, permissionIds } = await request.json();
    if (!id || !Array.isArray(permissionIds)) {
      return NextResponse.json({ error: 'ID and permissionIds are required' }, { status: 400 });
    }
    const group = await prisma.permissionGroup.update({
      where: { id },
      data: {
        permissions: {
          set: permissionIds.map((pid: string) => ({ id: pid }))
        }
      },
      include: { permissions: true }
    });
    return NextResponse.json(group);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update group permissions', details: String(error) }, { status: 500 });
  }
} 