import { NextRequest, NextResponse } from 'next/server';
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

// POST transfer staff
export async function POST(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'STAFF_TRANSFER');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }

    const body = await request.json();
    const { 
      staffId, 
      targetOrganizationId, 
      position, 
      effectiveDate, 
      note 
    } = body;

    if (!staffId || !targetOrganizationId) {
      return NextResponse.json(
        { error: 'Staff ID and target organization ID are required' },
        { status: 400 }
      );
    }

    // Get current user's level and organization
    const currentUser = await prisma.user.findUnique({
      where: { id: permissionCheck.user.id },
      include: {
        user_level: {
          include: {
            level_type: {
              include: {
                can_manage_relations: {
                  include: {
                    location_type: true
                  }
                }
              }
            }
          }
        },
        organization: true
      }
    });

    if (!currentUser?.user_level) {
      return NextResponse.json(
        { error: 'User level not found' },
        { status: 403 }
      );
    }

    // Get target organization
    const targetOrg = await prisma.organization.findUnique({
      where: { id: targetOrganizationId },
      include: {
        location_type: true
      }
    });

    if (!targetOrg) {
      return NextResponse.json(
        { error: 'Target organization not found' },
        { status: 404 }
      );
    }

    // Check if user can manage the target organization type
    const canManage = currentUser.user_level.level_type.can_manage_relations.some(
      relation => relation.location_type.code === targetOrg.location_type.code
    );

    if (!canManage) {
      return NextResponse.json(
        { error: 'Insufficient permissions to transfer staff to this organization' },
        { status: 403 }
      );
    }

    // Get staff member
    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
      include: {
        user: true
      }
    });

    if (!staff) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
    }

    // Get current staff assignment (if any)
    const currentAssignment = await prisma.staffHistory.findFirst({
      where: {
        staff_id: staffId,
        end_date: null // Current assignment
      },
      orderBy: { start_date: 'desc' }
    });

    // End current assignment if exists
    if (currentAssignment) {
      await prisma.staffHistory.update({
        where: { id: currentAssignment.id },
        data: { 
          end_date: effectiveDate ? new Date(effectiveDate) : new Date(),
          note: note ? `${note} - Transfer initiated` : 'Transfer initiated'
        }
      });
    }

    // Create new staff assignment
    const newAssignment = await prisma.staffHistory.create({
      data: {
        staff_id: staffId,
        organization_id: targetOrganizationId,
        position: position || currentAssignment?.position,
        start_date: effectiveDate ? new Date(effectiveDate) : new Date(),
        end_date: null,
        changed_by_id: currentUser.id,
        note: note || 'Staff transfer'
      }
    });

    // Log the transfer action
    const { ip, userAgent } = getClientInfo(request);
    await logAudit({
      userId: currentUser.id,
      action: 'STAFF_TRANSFER',
      entityId: staffId,
      entityType: 'STAFF',
      details: JSON.stringify({
        staffName: `${staff.first_name} ${staff.last_name}`,
        fromOrganization: currentAssignment?.organization_id || 'Unknown',
        toOrganization: targetOrganizationId,
        position,
        effectiveDate
      }),
      success: true,
      ipAddress: ip,
      userAgent
    });

    return NextResponse.json({
      message: 'Staff transferred successfully',
      assignment: newAssignment
    }, { status: 201 });

  } catch (error) {
    console.error('Staff transfer error:', error);
    return NextResponse.json(
      { error: 'Failed to transfer staff' },
      { status: 500 }
    );
  }
}

// GET staff transfer history
export async function GET(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'STAFF_VIEW');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }

    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get('staffId');
    const organizationId = searchParams.get('organizationId');

    if (!staffId && !organizationId) {
      return NextResponse.json(
        { error: 'Staff ID or organization ID is required' },
        { status: 400 }
      );
    }

    const where: any = {};
    if (staffId) where.staff_id = staffId;
    if (organizationId) where.organization_id = organizationId;

    const history = await prisma.staffHistory.findMany({
      where,
      include: {
        staff: true,
        organization: true,
        changed_by: {
          select: {
            username: true
          }
        }
      },
      orderBy: { start_date: 'desc' }
    });

    return NextResponse.json(history);

  } catch (error) {
    console.error('Error fetching staff transfer history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff transfer history' },
      { status: 500 }
    );
  }
} 