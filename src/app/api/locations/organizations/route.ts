import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { checkPermission } from '@/middleware/checkPermission';
import { logAudit } from '@/services/auditService';

const prisma = new PrismaClient();

// Helper function to get client info
function getClientInfo(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return { ip, userAgent };
}

// GET all organizations
export async function GET(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'ORGANIZATION_VIEW');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const provinceId = searchParams.get('provinceId');
    const districtId = searchParams.get('districtId');

    const where: Prisma.OrganizationWhereInput = { is_active: true };
    if (type) where.type = type as Prisma.EnumLocationTypeFilter<"Organization">;
    if (provinceId) where.province_id = provinceId;
    if (districtId) where.district_id = districtId;

    const organizations = await prisma.organization.findMany({
      where,
      include: {
        province: true,
        district: true,
        commune: true,
        village: true,
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
      action: 'ORGANIZATION_VIEW',
      success: true,
      ipAddress: ip,
      userAgent
    });

    return NextResponse.json(organizations);
  } catch (error) {
    console.error('Organization fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create organization
export async function POST(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'ORGANIZATION_CREATE');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }

    const body = await request.json();
    const { 
      name_en, 
      name_kh, 
      code, 
      description, 
      type, 
      province_id, 
      district_id, 
      commune_id, 
      village_id 
    } = body;

    // Validate required fields
    if (!name_en || !name_kh || !code || !type || !province_id || !district_id) {
      return NextResponse.json(
        { error: 'Required fields: name_en, name_kh, code, type, province_id, district_id' },
        { status: 400 }
      );
    }

    // Validate location hierarchy
    if (commune_id) {
      const commune = await prisma.commune.findUnique({
        where: { id: commune_id },
        include: { district: true }
      });
      if (!commune || commune.district_id !== district_id) {
        return NextResponse.json(
          { error: 'Invalid commune for the selected district' },
          { status: 400 }
        );
      }
    }

    if (village_id) {
      const village = await prisma.village.findUnique({
        where: { id: village_id },
        include: { commune: true }
      });
      if (!village || village.commune_id !== commune_id) {
        return NextResponse.json(
          { error: 'Invalid village for the selected commune' },
          { status: 400 }
        );
      }
    }

    // Check for duplicate code
    const existingOrg = await prisma.organization.findFirst({
      where: { code }
    });
    if (existingOrg) {
      return NextResponse.json(
        { error: 'Organization code already exists' },
        { status: 400 }
      );
    }

    const organization = await prisma.organization.create({
      data: {
        name_en,
        name_kh,
        code,
        is_active: true,
        description,
        type,
        province_id,
        district_id,
        commune_id,
        village_id,
        created_by: permissionCheck.user.id,
        updated_by: permissionCheck.user.id
      },
      include: {
        province: true,
        district: true,
        commune: true,
        village: true
      }
    });

    // Log the create action
    const { ip, userAgent } = getClientInfo(request);
    await logAudit({
      userId: permissionCheck.user.id,
      action: 'ORGANIZATION_CREATE',
      entityId: organization.id,
      entityType: 'ORGANIZATION',
      details: JSON.stringify({ name_en, code, type }),
      success: true,
      ipAddress: ip,
      userAgent
    });

    return NextResponse.json(organization, { status: 201 });
  } catch (error) {
    console.error('Organization creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT update organization
export async function PUT(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'ORGANIZATION_UPDATE');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }

    const body = await request.json();
    const { 
      id, 
      name_en, 
      name_kh, 
      code, 
      description, 
      type, 
      province_id, 
      district_id, 
      commune_id, 
      village_id, 
      is_active 
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    // Get current organization
    const currentOrg = await prisma.organization.findUnique({
      where: { id },
      include: {
        province: true,
        district: true,
        commune: true,
        village: true
      }
    });

    if (!currentOrg) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Check for duplicate code if code is being changed
    if (code && code !== currentOrg.code) {
      const existingOrg = await prisma.organization.findFirst({
        where: { code }
      });
      if (existingOrg) {
        return NextResponse.json(
          { error: 'Organization code already exists' },
          { status: 400 }
        );
      }
    }

    // Validate location hierarchy if locations are being changed
    if (commune_id && commune_id !== currentOrg.commune_id) {
      const commune = await prisma.commune.findUnique({
        where: { id: commune_id },
        include: { district: true }
      });
      if (!commune || commune.district_id !== district_id) {
        return NextResponse.json(
          { error: 'Invalid commune for the selected district' },
          { status: 400 }
        );
      }
    }

    if (village_id && village_id !== currentOrg.village_id) {
      const village = await prisma.village.findUnique({
        where: { id: village_id },
        include: { commune: true }
      });
      if (!village || village.commune_id !== commune_id) {
        return NextResponse.json(
          { error: 'Invalid village for the selected commune' },
          { status: 400 }
        );
      }
    }

    const organization = await prisma.organization.update({
      where: { id },
      data: {
        name_en,
        name_kh,
        code,
        description,
        type,
        province_id,
        district_id,
        commune_id,
        village_id,
        is_active,
        updated_by: permissionCheck.user.id
      },
      include: {
        province: true,
        district: true,
        commune: true,
        village: true
      }
    });

    // Log the update action
    const { ip, userAgent } = getClientInfo(request);
    await logAudit({
      userId: permissionCheck.user.id,
      action: 'ORGANIZATION_UPDATE',
      entityId: organization.id,
      entityType: 'ORGANIZATION',
      details: JSON.stringify({
        name_en,
        code,
        type,
        is_active,
        changes: {
          name: name_en !== currentOrg.name_en,
          code: code !== currentOrg.code,
          type: type !== currentOrg.type,
          location: province_id !== currentOrg.province_id || 
                   district_id !== currentOrg.district_id ||
                   commune_id !== currentOrg.commune_id ||
                   village_id !== currentOrg.village_id
        }
      }),
      success: true,
      ipAddress: ip,
      userAgent
    });

    return NextResponse.json(organization);
  } catch (error) {
    console.error('Organization update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE organization (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'ORGANIZATION_DELETE');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    // Get organization info before deletion
    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        province: true,
        district: true,
        commune: true,
        village: true
      }
    });

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Check if organization has any active users
    const activeUsers = await prisma.user.findFirst({
      where: {
        organization_id: id,
        is_active: true
      }
    });

    if (activeUsers) {
      return NextResponse.json(
        { error: 'Cannot delete organization with active users' },
        { status: 400 }
      );
    }

    await prisma.organization.update({
      where: { id },
      data: {
        is_active: false,
        updated_by: permissionCheck.user.id
      }
    });

    // Log the delete action
    const { ip, userAgent } = getClientInfo(request);
    await logAudit({
      userId: permissionCheck.user.id,
      action: 'ORGANIZATION_DELETE',
      entityId: id,
      entityType: 'ORGANIZATION',
      details: JSON.stringify({
        name_en: organization.name_en,
        code: organization.code,
        type: organization.type,
        location: {
          province: organization.province?.name_en,
          district: organization.district?.name_en,
          commune: organization.commune?.name_en,
          village: organization.village?.name_en
        }
      }),
      success: true,
      ipAddress: ip,
      userAgent
    });

    return NextResponse.json({ message: 'Organization deleted successfully' });
  } catch (error) {
    console.error('Organization deletion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 