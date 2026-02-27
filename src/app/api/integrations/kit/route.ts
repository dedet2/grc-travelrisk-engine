import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';
import { KitConnector } from '@/lib/integrations/kit-connector';

interface KitStatus extends ApiResponse<{
  connected: boolean;
  subscriberCount: number;
  tagCount: number;
  formCount: number;
  sequenceCount: number;
  lastSync: string;
}> {
  success: boolean;
  message?: string;
}

export async function GET(): Promise<NextResponse<KitStatus>> {
  try {
    const connector = new KitConnector(process.env.KIT_API_KEY || '');

    const [subscribers, tags, forms, sequences] = await Promise.all([
      connector.listSubscribers(1, 0),
      connector.listTags(),
      connector.listForms(),
      connector.listSequences(),
    ]);

    const response: KitStatus = {
      success: true,
      message: 'Kit integration status retrieved',
      data: {
        connected: true,
        subscriberCount: subscribers.total || 0,
        tagCount: tags.data?.length || 0,
        formCount: forms.data?.length || 0,
        sequenceCount: sequences.data?.length || 0,
        lastSync: new Date().toISOString(),
      },
      timestamp: new Date(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error getting Kit status:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to get Kit status',
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}

interface KitAction {
  action: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  subscriberId?: string;
  tagIds?: string[];
  tagName?: string;
  tagId?: string;
  sequenceId?: string;
  broadcastId?: string;
  subject?: string;
  htmlContent?: string;
  previewText?: string;
  fromEmail?: string;
  fromName?: string;
  replyTo?: string;
  sendAt?: string;
  webhookUrl?: string;
  webhookEvents?: Array<
    'subscriber.created' | 'subscriber.updated' | 'subscriber.deleted'
  >;
  webhookId?: string;
  limit?: number;
  offset?: number;
}

interface ActionResponse extends ApiResponse<unknown> {
  success: boolean;
  message?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ActionResponse>> {
  try {
    const body = (await request.json()) as KitAction;
    const {
      action,
      email,
      firstName,
      lastName,
      subscriberId,
      tagIds,
      tagName,
      sequenceId,
      broadcastId,
      subject,
      htmlContent,
      previewText,
      fromEmail,
      fromName,
      replyTo,
      sendAt,
      webhookUrl,
      webhookEvents,
      webhookId,
      limit,
      offset,
    } = body;

    const connector = new KitConnector(process.env.KIT_API_KEY || '');

    if (action === 'add-subscriber' && email) {
      const result = await connector.addSubscriber(
        email,
        firstName,
        lastName,
        tagIds
      );

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            message: result.error,
            timestamp: new Date(),
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Subscriber added',
          data: { subscriberId: result.subscriberId },
          timestamp: new Date(),
        },
        { status: 201 }
      );
    }

    if (action === 'get-subscriber' && email) {
      const result = await connector.getSubscriber(email);

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            message: result.error,
            timestamp: new Date(),
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Subscriber retrieved',
        data: result.data,
        timestamp: new Date(),
      });
    }

    if (action === 'list-subscribers') {
      const result = await connector.listSubscribers(
        limit || 100,
        offset || 0
      );

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            message: result.error,
            timestamp: new Date(),
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Subscribers retrieved',
        data: { subscribers: result.data, total: result.total },
        timestamp: new Date(),
      });
    }

    if (action === 'update-subscriber' && subscriberId) {
      const result = await connector.updateSubscriber(subscriberId, {
        firstName,
        lastName,
        tags: tagIds,
      });

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            message: result.error,
            timestamp: new Date(),
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Subscriber updated',
        timestamp: new Date(),
      });
    }

    if (action === 'tag-subscriber' && subscriberId && tagIds) {
      const result = await connector.tagSubscriber(subscriberId, tagIds);

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            message: result.error,
            timestamp: new Date(),
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Subscriber tagged',
        timestamp: new Date(),
      });
    }

    if (action === 'unsubscribe-subscriber' && subscriberId) {
      const result = await connector.unsubscribeSubscriber(subscriberId);

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            message: result.error,
            timestamp: new Date(),
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Subscriber unsubscribed',
        timestamp: new Date(),
      });
    }

    if (action === 'list-tags') {
      const result = await connector.listTags();

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            message: result.error,
            timestamp: new Date(),
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Tags retrieved',
        data: result.data,
        timestamp: new Date(),
      });
    }

    if (action === 'create-tag' && tagName) {
      const result = await connector.createTag(tagName);

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            message: result.error,
            timestamp: new Date(),
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Tag created',
          data: { tagId: result.tagId },
          timestamp: new Date(),
        },
        { status: 201 }
      );
    }

    if (action === 'list-forms') {
      const result = await connector.listForms();

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            message: result.error,
            timestamp: new Date(),
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Forms retrieved',
        data: result.data,
        timestamp: new Date(),
      });
    }

    if (action === 'list-sequences') {
      const result = await connector.listSequences();

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            message: result.error,
            timestamp: new Date(),
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Sequences retrieved',
        data: result.data,
        timestamp: new Date(),
      });
    }

    if (action === 'enroll-sequence' && subscriberId && sequenceId) {
      const result = await connector.enrollInSequence(
        subscriberId,
        sequenceId
      );

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            message: result.error,
            timestamp: new Date(),
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Subscriber enrolled in sequence',
        timestamp: new Date(),
      });
    }

    if (action === 'unenroll-sequence' && subscriberId && sequenceId) {
      const result = await connector.unenrollFromSequence(
        subscriberId,
        sequenceId
      );

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            message: result.error,
            timestamp: new Date(),
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Subscriber unenrolled from sequence',
        timestamp: new Date(),
      });
    }

    if (action === 'list-broadcasts') {
      const result = await connector.listBroadcasts(limit || 100);

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            message: result.error,
            timestamp: new Date(),
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Broadcasts retrieved',
        data: result.data,
        timestamp: new Date(),
      });
    }

    if (action === 'create-broadcast' && subject && htmlContent) {
      const result = await connector.createBroadcast({
        subject,
        htmlContent,
        previewText,
        fromEmail,
        fromName,
        replyTo,
      });

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            message: result.error,
            timestamp: new Date(),
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Broadcast created',
          data: { broadcastId: result.broadcastId },
          timestamp: new Date(),
        },
        { status: 201 }
      );
    }

    if (action === 'send-broadcast' && broadcastId) {
      const result = await connector.sendBroadcast(broadcastId);

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            message: result.error,
            timestamp: new Date(),
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Broadcast sent',
        timestamp: new Date(),
      });
    }

    if (action === 'schedule-broadcast' && broadcastId && sendAt) {
      const result = await connector.scheduleBroadcast(broadcastId, sendAt);

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            message: result.error,
            timestamp: new Date(),
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Broadcast scheduled',
        timestamp: new Date(),
      });
    }

    if (action === 'register-webhook' && webhookUrl && webhookEvents) {
      const result = await connector.registerWebhook(webhookUrl, webhookEvents);

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            message: result.error,
            timestamp: new Date(),
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Webhook registered',
          data: { webhookId: result.webhookId },
          timestamp: new Date(),
        },
        { status: 201 }
      );
    }

    if (action === 'list-webhooks') {
      const result = await connector.listWebhooks();

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            message: result.error,
            timestamp: new Date(),
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Webhooks retrieved',
        data: result.data,
        timestamp: new Date(),
      });
    }

    if (action === 'delete-webhook' && webhookId) {
      const result = await connector.deleteWebhook(webhookId);

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            message: result.error,
            timestamp: new Date(),
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Webhook deleted',
        timestamp: new Date(),
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Invalid action or missing required parameters',
        timestamp: new Date(),
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in Kit integration:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process Kit request',
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
