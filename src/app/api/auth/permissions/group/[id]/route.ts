import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkPermission } from '@/middleware/checkPermission';

// GET - Get permission group by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.name) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { username: session.user.name } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const permissionGroup = await prisma.permissionGroup.findUnique({
      where: { id: params.id },
      include: {
        permissions: {
          orderBy: { name_en: 'asc' },
        },
      },
    });

    if (!permissionGroup) {
      return NextResponse.json(
        { error: 'Permission group not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: permissionGroup });
  } catch (error) {
    console.error('Error fetching permission group:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update permission group
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.name) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { username: session.user.name } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check permission
    const { allowed: updateAllowed, response: updateResponse } = await checkPermission(request, 'permission_group_update');
    if (!updateAllowed) return updateResponse;

    const body = await request.json();
    const { name_en, name_kh, code, description, is_active } = body;

    // Check if permission group exists
    const existingGroup = await prisma.permissionGroup.findUnique({
      where: { id: params.id },
    });

    if (!existingGroup) {
      return NextResponse.json(
        { error: 'Permission group not found' },
        { status: 404 }
      );
    }

    // Check if code already exists (excluding current group)
    if (code && code !== existingGroup.code) {
      const codeExists = await prisma.permissionGroup.findUnique({
        where: { code },
      });

      if (codeExists) {
        return NextResponse.json(
          { error: 'Permission group with this code already exists' },
          { status: 400 }
        );
      }
    }

    // Update permission group
    const updatedGroup = await prisma.permissionGroup.update({
      where: { id: params.id },
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
        active: 'UPDATE',
        timestamp: new Date(),
        user_id: user.id,
        details: `Updated permission group: ${name_en} (${code})`,
      },
    });

    return NextResponse.json({
      message: 'Permission group updated successfully',
      data: updatedGroup,
    });
  } catch (error) {
    console.error('Error updating permission group:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete permission group
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.name) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { username: session.user.name } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check permission
    const { allowed: deleteAllowed, response: deleteResponse } = await checkPermission(request, 'permission_group_delete');
    if (!deleteAllowed) return deleteResponse;

    // Check if permission group exists
    const existingGroup = await prisma.permissionGroup.findUnique({
      where: { id: params.id },
      include: {
        permissions: true,
      },
    });

    if (!existingGroup) {
      return NextResponse.json(
        { error: 'Permission group not found' },
        { status: 404 }
      );
    }

    // Check if group has permissions
    if (existingGroup.permissions.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete permission group that has permissions assigned' },
        { status: 400 }
      );
    }

    // Delete permission group
    await prisma.permissionGroup.delete({
      where: { id: params.id },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        active: 'DELETE',
        timestamp: new Date(),
        user_id: user.id,
        details: `Deleted permission group: ${existingGroup.name_en} (${existingGroup.code})`,
      },
    });

    return NextResponse.json({
      message: 'Permission group deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting permission group:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 