/**
 * Notifications API Endpoint
 * GET: Retrieve notifications with filtering by category and read status
 * POST: Create new notification
 * PATCH: Mark notifications as read
 */

import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

// ===== Types =====

export type NotificationCategory = 'compliance' | 'risk' | 'agent' | 'system';
export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface Notification {
  id: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  message: string;
  read: boolean;
  timestamp: Date;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

// ===== In-Memory Store =====

class NotificationStore {
  private notifications: Map<string, Notification> = new Map();

  constructor() {
    this.initializeDemoNotifications();
  }

  /**
   * Initialize with realistic GRC-related demo notifications
   */
  private initializeDemoNotifications(): void {
    const now = new Date();

    // Compliance notifications
    this.createNotification(
      'compliance',
      'high',
      'NIST CSF 2.0 assessment due in 3 days',
      'Annual compliance assessment for NIST Cybersecurity Framework 2.0 is due on March 15, 2026. Ensure all control evidence is documented.',
      '/dashboard/compliance',
      { daysUntilDue: 3, framework: 'NIST CSF 2.0' }
    );

    this.createNotification(
      'compliance',
      'info',
      'Compliance framework update: ISO 27001:2025 draft published',
      'The ISO 27001:2025 draft specification is now available. Review the changes and begin planning implementation updates.',
      '/dashboard/frameworks',
      { version: '2025 draft', framework: 'ISO 27001' }
    );

    this.createNotification(
      'compliance',
      'high',
      'Security training certification expires in 7 days',
      'Annual security awareness training certification expires for 5 employees. Mandatory renewal required.',
      '/dashboard/training',
      { employeeCount: 5, certType: 'Security Awareness' }
    );

    // Risk notifications
    this.createNotification(
      'risk',
      'critical',
      'High-risk travel advisory: Israel updated to Level 4',
      'US State Department issued Level 4 (Do Not Travel) advisory for Israel. All travel to this destination is prohibited.',
      '/dashboard/travel-risk',
      { country: 'Israel', level: 4, advisoryType: 'state-department' }
    );

    this.createNotification(
      'risk',
      'medium',
      'Weekly risk score improved: 78 → 82 (+4)',
      'Your GRC risk score has improved from 78 to 82 this week. Continue efforts to maintain this positive trend.',
      '/dashboard',
      { previousScore: 78, currentScore: 82, improvement: 4 },
      true // mark as read
    );

    this.createNotification(
      'risk',
      'high',
      'Risk score increase detected',
      'Overall GRC risk score increased from 72 to 78 due to 3 new compliance findings and 2 unresolved security incidents.',
      '/dashboard/risks',
      { findingsCount: 3, incidentsCount: 2 }
    );

    // Agent notifications
    this.createNotification(
      'agent',
      'high',
      'Agent A-03 completed SOC 2 gap analysis - 12 findings',
      'SOC 2 Compliance Agent (A-03) completed gap analysis. Identified 12 findings: 2 critical, 5 high priority, 5 medium priority.',
      '/dashboard/agents',
      { agentId: 'A-03', findingsCritical: 2, findingsHigh: 5, findingsMedium: 5, assessmentType: 'SOC 2' }
    );

    this.createNotification(
      'agent',
      'medium',
      'Workflow execution failed: Regulatory Report Generator',
      'The Regulatory Report Generator workflow failed after 3 retries. Last error: Timeout connecting to document service. Retry scheduled in 5 minutes.',
      '/dashboard/workflows',
      { workflowName: 'Regulatory Report Generator', retries: 3 }
    );

    this.createNotification(
      'agent',
      'info',
      'Lead Scoring Agent run completed',
      'Lead Scoring Agent (C-01) run completed successfully. Processed 247 leads, qualified 34 new opportunities for sales team.',
      '/dashboard/leads',
      { agentId: 'C-01', leadsProcessed: 247, qualified: 34 },
      true // mark as read
    );

    // System notifications
    this.createNotification(
      'system',
      'info',
      'New CISO prospect: Scott Kennedy (AppViewX) added to pipeline',
      'Sales team added Scott Kennedy from AppViewX as a new CISO prospect. Marketing outreach sequence initiated.',
      '/dashboard/crm',
      { prospect: 'Scott Kennedy', company: 'AppViewX', role: 'CISO' },
      true // mark as read
    );

    this.createNotification(
      'system',
      'info',
      '3 deals progressed to Negotiation stage',
      'CRM sync detected 3 deals advancing to Negotiation stage this week. Total pipeline value: $1.2M.',
      '/dashboard/sales',
      { dealsCount: 3, stageFrom: 'Qualification', stageTo: 'Negotiation', pipelineValue: '$1.2M' },
      true // mark as read
    );

    this.createNotification(
      'system',
      'medium',
      'Database maintenance scheduled for tonight',
      'Planned maintenance window scheduled for tonight at 11 PM - 1 AM UTC. Expected downtime: 15 minutes. No impact to data or backups.',
      '/dashboard/infrastructure',
      { maintenanceTime: '11 PM - 1 AM UTC', expectedDowntime: '15 minutes' }
    );

    this.createNotification(
      'system',
      'info',
      'Weekly system health report ready',
      'This week\'s system health report shows 99.97% uptime across all services. All infrastructure metrics within normal ranges.',
      '/dashboard/health',
      { uptime: '99.97%' },
      true // mark as read
    );
  }

  /**
   * Create a new notification
   */
  createNotification(
    category: NotificationCategory,
    priority: NotificationPriority,
    title: string,
    message: string,
    actionUrl?: string,
    metadata?: Record<string, unknown>,
    isRead: boolean = false
  ): Notification {
    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category,
      priority,
      title,
      message,
      read: isRead,
      timestamp: new Date(),
      actionUrl,
      metadata,
    };

    this.notifications.set(notification.id, notification);
    return notification;
  }

  /**
   * Get all notifications
   */
  getNotifications(): Notification[] {
    return Array.from(this.notifications.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  /**
   * Get notifications filtered by category
   */
  getByCategory(category: NotificationCategory): Notification[] {
    return this.getNotifications().filter((n) => n.category === category);
  }

  /**
   * Get unread notifications
   */
  getUnread(): Notification[] {
    return this.getNotifications().filter((n) => !n.read);
  }

  /**
   * Get notifications by priority
   */
  getByPriority(priority: NotificationPriority): Notification[] {
    return this.getNotifications().filter((n) => n.priority === priority);
  }

  /**
   * Get a single notification by ID
   */
  getById(id: string): Notification | undefined {
    return this.notifications.get(id);
  }

  /**
   * Mark a notification as read
   */
  markAsRead(id: string): boolean {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.read = true;
      return true;
    }
    return false;
  }

  /**
   * Mark multiple notifications as read
   */
  markManyAsRead(ids: string[]): number {
    let count = 0;
    for (const id of ids) {
      if (this.markAsRead(id)) {
        count++;
      }
    }
    return count;
  }

  /**
   * Mark all notifications of a category as read
   */
  markCategoryAsRead(category: NotificationCategory): number {
    let count = 0;
    for (const notification of this.notifications.values()) {
      if (notification.category === category && !notification.read) {
        notification.read = true;
        count++;
      }
    }
    return count;
  }

  /**
   * Delete a notification
   */
  delete(id: string): boolean {
    return this.notifications.delete(id);
  }

  /**
   * Delete multiple notifications
   */
  deleteMany(ids: string[]): number {
    let count = 0;
    for (const id of ids) {
      if (this.delete(id)) {
        count++;
      }
    }
    return count;
  }

  /**
   * Get statistics
   */
  getStats() {
    const all = this.getNotifications();
    const unread = this.getUnread();

    return {
      total: all.length,
      unread: unread.length,
      byCategory: {
        compliance: all.filter((n) => n.category === 'compliance').length,
        risk: all.filter((n) => n.category === 'risk').length,
        agent: all.filter((n) => n.category === 'agent').length,
        system: all.filter((n) => n.category === 'system').length,
      },
      byPriority: {
        critical: all.filter((n) => n.priority === 'critical').length,
        high: all.filter((n) => n.priority === 'high').length,
        medium: all.filter((n) => n.priority === 'medium').length,
        low: all.filter((n) => n.priority === 'low').length,
        info: all.filter((n) => n.priority === 'info').length,
      },
    };
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.notifications.clear();
  }
}

/**
 * Singleton instance
 */
const store = new NotificationStore();

// ===== API Handlers =====

/**
 * GET /api/notifications
 * Query params:
 *   ?category=compliance|risk|agent|system
 *   ?unread=true|false
 *   ?priority=critical|high|medium|low|info
 *   ?limit=20 (default 50)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as NotificationCategory | null;
    const unreadOnly = searchParams.get('unread') === 'true';
    const priority = searchParams.get('priority') as NotificationPriority | null;
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    let notifications = store.getNotifications();

    // Filter by category
    if (category) {
      notifications = notifications.filter((n) => n.category === category);
    }

    // Filter unread only
    if (unreadOnly) {
      notifications = notifications.filter((n) => !n.read);
    }

    // Filter by priority
    if (priority) {
      notifications = notifications.filter((n) => n.priority === priority);
    }

    // Apply limit
    const limited = notifications.slice(0, limit);

    const stats = store.getStats();

    const responseData = {
      notifications: limited,
      stats,
      total: notifications.length,
      returned: limited.length,
      filters: {
        category: category || 'all',
        unreadOnly,
        priority: priority || 'all',
        limit,
      },
    };

    return NextResponse.json(
      {
        success: true,
        data: responseData,
        timestamp: new Date(),
      } as ApiResponse<typeof responseData>,
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[Notifications API] GET Error:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: `Failed to retrieve notifications: ${errorMessage}`,
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications
 * Create a new notification
 *
 * Request body:
 * {
 *   "category": "compliance|risk|agent|system",
 *   "priority": "critical|high|medium|low|info",
 *   "title": "string",
 *   "message": "string",
 *   "actionUrl": "string (optional)",
 *   "metadata": "object (optional)"
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { category, priority, title, message, actionUrl, metadata } = body;

    // Validate required fields
    if (!category || !priority || !title || !message) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: category, priority, title, message',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Validate category
    const validCategories: NotificationCategory[] = ['compliance', 'risk', 'agent', 'system'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Validate priority
    const validPriorities: NotificationPriority[] = ['critical', 'high', 'medium', 'low', 'info'];
    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}`,
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const notification = store.createNotification(
      category,
      priority,
      title,
      message,
      actionUrl,
      metadata
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          action: 'create',
          notification,
        },
        timestamp: new Date(),
      } as ApiResponse<any>,
      { status: 201 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[Notifications API] POST Error:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: `Failed to create notification: ${errorMessage}`,
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications
 * Mark notifications as read
 *
 * Request body options:
 *
 * 1. Mark specific notification(s) as read:
 *    { "action": "mark_read", "id": "string" }
 *    { "action": "mark_read", "ids": ["id1", "id2"] }
 *
 * 2. Mark entire category as read:
 *    { "action": "mark_category_read", "category": "compliance|risk|agent|system" }
 *
 * 3. Mark all as read:
 *    { "action": "mark_all_read" }
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: action',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    if (action === 'mark_read') {
      const { id, ids } = body;

      if (id) {
        const success = store.markAsRead(id);
        return NextResponse.json(
          {
            success: true,
            data: {
              action: 'mark_read',
              id,
              marked: success,
            },
            timestamp: new Date(),
          } as ApiResponse<any>,
          { status: 200 }
        );
      }

      if (ids && Array.isArray(ids)) {
        const count = store.markManyAsRead(ids);
        return NextResponse.json(
          {
            success: true,
            data: {
              action: 'mark_read',
              ids,
              marked: count,
            },
            timestamp: new Date(),
          } as ApiResponse<any>,
          { status: 200 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Must provide either id or ids array',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    if (action === 'mark_category_read') {
      const { category } = body;

      if (!category) {
        return NextResponse.json(
          {
            success: false,
            error: 'Missing required field: category',
          } as ApiResponse<null>,
          { status: 400 }
        );
      }

      const validCategories: NotificationCategory[] = ['compliance', 'risk', 'agent', 'system'];
      if (!validCategories.includes(category)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
          } as ApiResponse<null>,
          { status: 400 }
        );
      }

      const count = store.markCategoryAsRead(category);
      return NextResponse.json(
        {
          success: true,
          data: {
            action: 'mark_category_read',
            category,
            marked: count,
          },
          timestamp: new Date(),
        } as ApiResponse<any>,
        { status: 200 }
      );
    }

    if (action === 'mark_all_read') {
      const allNotifications = store.getNotifications();
      let count = 0;
      for (const notification of allNotifications) {
        if (!notification.read) {
          store.markAsRead(notification.id);
          count++;
        }
      }

      return NextResponse.json(
        {
          success: true,
          data: {
            action: 'mark_all_read',
            marked: count,
          },
          timestamp: new Date(),
        } as ApiResponse<any>,
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: `Invalid action: ${action}. Valid actions: mark_read, mark_category_read, mark_all_read`,
      } as ApiResponse<null>,
      { status: 400 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[Notifications API] PATCH Error:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: `Failed to update notifications: ${errorMessage}`,
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications
 * Delete notifications
 *
 * Query params:
 *   ?id=string (delete specific notification)
 *   ?ids=id1,id2,id3 (delete multiple)
 *   ?all=true (delete all)
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const ids = searchParams.get('ids')?.split(',');
    const all = searchParams.get('all') === 'true';

    if (all) {
      store.clearAll();
      return NextResponse.json(
        {
          success: true,
          data: {
            action: 'delete_all',
            deleted: true,
          },
          timestamp: new Date(),
        } as ApiResponse<any>,
        { status: 200 }
      );
    }

    if (id) {
      const success = store.delete(id);
      return NextResponse.json(
        {
          success: true,
          data: {
            action: 'delete',
            id,
            deleted: success,
          },
          timestamp: new Date(),
        } as ApiResponse<any>,
        { status: 200 }
      );
    }

    if (ids && ids.length > 0) {
      const count = store.deleteMany(ids);
      return NextResponse.json(
        {
          success: true,
          data: {
            action: 'delete_many',
            ids,
            deleted: count,
          },
          timestamp: new Date(),
        } as ApiResponse<any>,
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Must provide either id, ids (comma-separated), or all=true',
      } as ApiResponse<null>,
      { status: 400 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[Notifications API] DELETE Error:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: `Failed to delete notifications: ${errorMessage}`,
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
