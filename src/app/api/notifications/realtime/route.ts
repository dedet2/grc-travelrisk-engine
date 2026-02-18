import { NextRequest, NextResponse } from 'next/server';
import { notificationEngine } from '@/lib/notifications/notification-engine';
import { NotificationFilter } from '@/types/notifications';

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id') || 'user_1';
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');
  const severity = searchParams.get('severity');
  const read = searchParams.get('read');
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  const filters: NotificationFilter = {
    limit,
    offset
  };

  if (type) {
    filters.type = type as any;
  }
  if (severity) {
    filters.severity = severity as any;
  }
  if (read !== null) {
    filters.read = read === 'true';
  }

  const notifications = notificationEngine.getNotificationHistory(userId, filters);
  const stats = notificationEngine.getNotificationStats(userId);

  return NextResponse.json(
    {
      success: true,
      notifications,
      stats
    },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id') || 'user_1';

  try {
    const body = await request.json();
    const { type, title, message, severity, actionUrl, metadata } = body;

    if (!type || !title || !message || !severity) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const notification = notificationEngine.sendNotification(
      userId,
      type,
      title,
      message,
      severity,
      actionUrl,
      metadata
    );

    return NextResponse.json(
      { success: true, notification },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to send notification' },
      { status: 400 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const userId = request.headers.get('x-user-id') || 'user_1';

  try {
    const body = await request.json();
    const { notificationId, markAllAsRead } = body;

    if (markAllAsRead) {
      const count = notificationEngine.markAllRead(userId);
      return NextResponse.json(
        { success: true, markedCount: count },
        { status: 200 }
      );
    }

    if (notificationId) {
      const notification = notificationEngine.markAsRead(notificationId);
      if (!notification) {
        return NextResponse.json(
          { success: false, error: 'Notification not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: true, notification },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Missing required parameters' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update notification' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const userId = request.headers.get('x-user-id') || 'user_1';

  try {
    const count = notificationEngine.clearNotifications(userId);

    return NextResponse.json(
      { success: true, clearedCount: count },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to clear notifications' },
      { status: 400 }
    );
  }
}
