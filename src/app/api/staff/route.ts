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

// GET all staff
export async function GET(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'STAFF_VIEW');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }

    const staff = await prisma.staff.findMany({
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

    // Log the view action
    const { ip, userAgent } = getClientInfo(request);
    await logAudit({
      userId: permissionCheck.user.id,
      action: 'STAFF_VIEW',
      success: true,
      ipAddress: ip,
      userAgent
    });

    return NextResponse.json(staff);
  } catch (error: unknown) {
    console.error('Error fetching staff:', error);
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}

// POST create new staff
export async function POST(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'STAFF_CREATE');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }

    const body = await request.json();
    const { 
      first_name, 
      last_name, 
      gender, 
      date_of_birth, 
      phone, 
      email, 
      nationality 
    } = body;

    if (!first_name || !last_name || !gender || !date_of_birth || !nationality) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      );
    }

    const staff = await prisma.staff.create({
      data: {
        code: `${first_name.charAt(0)}${last_name.charAt(0)}${Date.now().toString().slice(-4)}`,
        first_name,
        last_name,
        gender,
        date_of_birth: new Date(date_of_birth),
        phone,
        email,
        nationality,
        created_by: permissionCheck.user.id,
        updated_by: permissionCheck.user.id
      }
    });

    // Log the create action
    const { ip, userAgent } = getClientInfo(request);
    await logAudit({
      userId: permissionCheck.user.id,
      action: 'STAFF_CREATE',
      entityId: staff.id,
      entityType: 'STAFF',
      details: JSON.stringify({ first_name, last_name, gender }),
      success: true,
      ipAddress: ip,
      userAgent
    });

    return NextResponse.json(staff, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating staff:', error);
    return NextResponse.json({ error: 'Failed to create staff' }, { status: 500 });
  }
}

// PUT update staff
export async function PUT(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'STAFF_UPDATE');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }

    const body = await request.json();
    const { 
      id,
      first_name, 
      last_name, 
      gender, 
      date_of_birth, 
      phone, 
      email, 
      nationality 
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Staff ID is required' },
        { status: 400 }
      );
    }

    const staff = await prisma.staff.update({
      where: { id },
      data: {
        first_name,
        last_name,
        gender,
        date_of_birth: date_of_birth ? new Date(date_of_birth) : undefined,
        phone,
        email,
        nationality,
        updated_by: permissionCheck.user.id
      }
    });

    // Log the update action
    const { ip, userAgent } = getClientInfo(request);
    await logAudit({
      userId: permissionCheck.user.id,
      action: 'STAFF_UPDATE',
      entityId: staff.id,
      entityType: 'STAFF',
      details: JSON.stringify({ first_name, last_name, gender }),
      success: true,
      ipAddress: ip,
      userAgent
    });

    return NextResponse.json(staff);
  } catch (error: unknown) {
    console.error('Error updating staff:', error);
    return NextResponse.json({ error: 'Failed to update staff' }, { status: 500 });
  }
}

// DELETE staff
export async function DELETE(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'STAFF_DELETE');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Staff ID is required' },
        { status: 400 }
      );
    }

    // Get staff info before deletion for audit log
    const staffInfo = await prisma.staff.findUnique({
      where: { id },
      select: {
        first_name: true,
        last_name: true,
        gender: true
      }
    });

    if (!staffInfo) {
      return NextResponse.json(
        { error: 'Staff not found' },
        { status: 404 }
      );
    }

    await prisma.staff.delete({
      where: { id }
    });

    // Log the delete action
    const { ip, userAgent } = getClientInfo(request);
    await logAudit({
      userId: permissionCheck.user.id,
      action: 'STAFF_DELETE',
      entityId: id,
      entityType: 'STAFF',
      details: JSON.stringify(staffInfo),
      success: true,
      ipAddress: ip,
      userAgent
    });

    return NextResponse.json({ message: 'Staff deleted successfully' });
  } catch (error: unknown) {
    console.error('Error deleting staff:', error);
    return NextResponse.json({ error: 'Failed to delete staff' }, { status: 500 });
  }
} 