import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export async function logLocationAccess(
  userId: string,
  locationType: 'PROVINCE' | 'DISTRICT' | 'COMMUNE' | 'VILLAGE',
  locationId: string,
  action: 'VIEW' | 'CREATE' | 'UPDATE' | 'DELETE',
  success: boolean,
  details?: string
) {
  try {
    await prisma.auditLog.create({
      data: {
        active: `${locationType}_${action}`,
        timestamp: new Date(),
        user_id: userId,
        details: JSON.stringify({
          locationType,
          locationId,
          action,
          success,
          details
        })
      }
    });
  } catch (error) {
    console.error('Error logging location access:', error);
  }
}

export async function getLocationAccessLogs(
  userId?: string,
  locationType?: string,
  startDate?: Date,
  endDate?: Date
) {
  try {
    const where: Prisma.AuditLogWhereInput = {
      active: {
        startsWith: 'PROVINCE_'
      }
    };

    if (userId) {
      where.user_id = userId;
    }

    if (locationType) {
      where.active = {
        startsWith: `${locationType.toUpperCase()}_`
      };
    }

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp.gte = startDate;
      }
      if (endDate) {
        where.timestamp.lte = endDate;
      }
    }

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: true
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    return logs.map(log => ({
      ...log,
      details: JSON.parse(log.details || '{}')
    }));
  } catch (error) {
    console.error('Error fetching location access logs:', error);
    throw error;
  }
} 