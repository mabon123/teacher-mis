import { prisma } from './prisma';

export async function checkUserAccess(userId: string, targetOrganizationId: string): Promise<boolean> {
  try {
    // 1. Get user's level and organization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        user_level: {
          include: {
            level_type: true,
            organization: true
          }
        }
      }
    });

    if (!user || !user.user_level) return false;

    // 2. Get target organization
    const targetOrg = await prisma.organization.findUnique({
      where: { id: targetOrganizationId }
    });

    if (!targetOrg) return false;

    // 3. Check if user's level can manage target organization's type
    const canManage = user.user_level.level_type.can_manage.includes(targetOrg.type);

    // 4. Check if user's organization is in the hierarchy
    const isInHierarchy = await checkOrganizationHierarchy(
      user.user_level.organization_id,
      targetOrganizationId
    );

    return canManage && isInHierarchy;
  } catch (error) {
    console.error('Access control check failed:', error);
    return false;
  }
}

async function checkOrganizationHierarchy(userOrgId: string, targetOrgId: string): Promise<boolean> {
  try {
    const userOrg = await prisma.organization.findUnique({
      where: { id: userOrgId }
    });

    const targetOrg = await prisma.organization.findUnique({
      where: { id: targetOrgId }
    });

    if (!userOrg || !targetOrg) return false;

    // Check if target org is under user's org in the hierarchy
    return (
      targetOrg.province_id === userOrg.province_id &&
      targetOrg.district_id === userOrg.district_id
    );
  } catch (error) {
    console.error('Hierarchy check failed:', error);
    return false;
  }
} 