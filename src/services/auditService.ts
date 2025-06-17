import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export type ActionType = 
  // User actions
  | 'USER_CREATE' | 'USER_UPDATE' | 'USER_DELETE' | 'USER_VIEW' | 'USER_LOGIN' | 'USER_LOGOUT'
  // Role actions
  | 'ROLE_CREATE' | 'ROLE_UPDATE' | 'ROLE_DELETE' | 'ROLE_VIEW'
  // Permission actions
  | 'PERMISSION_CREATE' | 'PERMISSION_UPDATE' | 'PERMISSION_DELETE' | 'PERMISSION_VIEW'
  // Location actions
  | 'PROVINCE_CREATE' | 'PROVINCE_UPDATE' | 'PROVINCE_DELETE' | 'PROVINCE_VIEW'
  | 'DISTRICT_CREATE' | 'DISTRICT_UPDATE' | 'DISTRICT_DELETE' | 'DISTRICT_VIEW'
  | 'COMMUNE_CREATE' | 'COMMUNE_UPDATE' | 'COMMUNE_DELETE' | 'COMMUNE_VIEW'
  | 'VILLAGE_CREATE' | 'VILLAGE_UPDATE' | 'VILLAGE_DELETE' | 'VILLAGE_VIEW'
  | 'ORGANIZATION_CREATE' | 'ORGANIZATION_UPDATE' | 'ORGANIZATION_DELETE' | 'ORGANIZATION_VIEW'
  // Staff actions
  | 'STAFF_CREATE' | 'STAFF_UPDATE' | 'STAFF_DELETE' | 'STAFF_VIEW'
  // Level actions
  | 'LEVEL_CREATE' | 'LEVEL_UPDATE' | 'LEVEL_DELETE' | 'LEVEL_VIEW'
  | 'USER_LEVEL_CREATE' | 'USER_LEVEL_UPDATE' | 'USER_LEVEL_DELETE' | 'USER_LEVEL_VIEW';

export interface AuditLogData {
  userId: string;
  action: ActionType;
  entityId?: string;
  entityType?: string;
  details?: string;
  metadata?: Record<string, unknown>;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAudit(data: AuditLogData) {
  try {
    await prisma.auditLog.create({
      data: {
        active: data.action,
        timestamp: new Date(),
        user_id: data.userId,
        details: JSON.stringify({
          entityId: data.entityId,
          entityType: data.entityType,
          details: data.details,
          metadata: data.metadata,
          success: data.success,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent
        })
      }
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
  }
}

export interface AuditLogFilters {
  userId?: string;
  action?: ActionType;
  entityType?: string;
  startDate?: Date;
  endDate?: Date;
  success?: boolean;
}

export async function getAuditLogs(filters: AuditLogFilters) {
  try {
    const where: Prisma.AuditLogWhereInput = {};

    if (filters.userId) {
      where.user_id = filters.userId;
    }

    if (filters.action) {
      where.active = filters.action;
    }

    if (filters.startDate || filters.endDate) {
      where.timestamp = {};
      if (filters.startDate) {
        where.timestamp.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.timestamp.lte = filters.endDate;
      }
    }

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
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
    console.error('Error fetching audit logs:', error);
    throw error;
  }
}

export interface SessionLogData {
  userId: string;
  sessionId: string;
  ipAddress: string;
  userAgent?: string;
  location?: string;
}

export async function logUserSession(data: SessionLogData) {
  try {
    await prisma.activeLog.create({
      data: {
        user_id: data.userId,
        session_id: data.sessionId,
        start_at: new Date(),
        ip_address: data.ipAddress,
        location: data.location || 'Unknown',
        user_agent: data.userAgent,
        details: JSON.stringify({
          startTime: new Date().toISOString()
        })
      }
    });
  } catch (error) {
    console.error('Error logging user session:', error);
  }
}

export async function endUserSession(sessionId: string) {
  try {
    await prisma.activeLog.update({
      where: { id: sessionId },
      data: {
        ended_at: new Date(),
        details: JSON.stringify({
          endTime: new Date().toISOString()
        })
      }
    });
  } catch (error) {
    console.error('Error ending user session:', error);
  }
}

export interface SessionFilters {
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}

export async function getActiveSessions(filters: SessionFilters) {
  try {
    const where: Prisma.ActiveLogWhereInput = {};

    if (filters.userId) {
      where.user_id = filters.userId;
    }

    if (filters.startDate || filters.endDate) {
      where.start_at = {};
      if (filters.startDate) {
        where.start_at.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.start_at.lte = filters.endDate;
      }
    }

    const sessions = await prisma.activeLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      },
      orderBy: {
        start_at: 'desc'
      }
    });

    return sessions.map(session => ({
      ...session,
      details: JSON.parse(session.details || '{}')
    }));
  } catch (error) {
    console.error('Error fetching active sessions:', error);
    throw error;
  }
} 