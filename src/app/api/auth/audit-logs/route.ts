import { NextRequest, NextResponse } from 'next/server';
import { getAuditLogs, ActionType } from '@/services/auditService';
import { checkPermission } from '@/middleware/checkPermission';

export async function GET(request: NextRequest) {
  try {
    // Check if user has permission to view logs
    const permissionCheck = await checkPermission(request, 'LOG_VIEW');
    if (!permissionCheck.allowed) {
      return permissionCheck.response;
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || undefined;
    const action = searchParams.get('action') as ActionType | undefined;
    const entityType = searchParams.get('entityType') || undefined;
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;
    const success = searchParams.get('success') ? searchParams.get('success') === 'true' : undefined;

    // Get audit logs with filters
    const logs = await getAuditLogs({
      userId,
      action,
      entityType,
      startDate,
      endDate,
      success
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
} 