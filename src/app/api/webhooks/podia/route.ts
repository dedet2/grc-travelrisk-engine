/**
 * Podia Webhook Receiver
 * Handles purchase events from Podia and syncs customers to Airtable
 */

import { NextRequest } from 'next/server';
import { getRawRequestBody, verifyPodiaSignature } from '@/lib/webhook-verify';
import { upsertCustomer } from '@/lib/airtable-sync';
import { notifyCustomerEvent, notifyError } from '@/lib/slack-notify';

export const dynamic = 'force-dynamic';

interface PodiaCustomer {
  email?: string;
  name?: string;
}

interface PodiaProduct {
  name?: string;
}

interface PodiaEventData {
  customer?: PodiaCustomer;
  email?: string;
  name?: string;
  product_name?: string;
  product?: PodiaProduct;
}

interface PodiaWebhookPayload {
  type?: string;
  data?: PodiaEventData;
}

export async function POST(req: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await getRawRequestBody(req);
    const signature = req.headers.get('X-Podia-Signature');

    // Verify signature
    if (!verifyPodiaSignature(rawBody, signature || undefined)) {
      console.warn('Invalid Podia signature');
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse payload
    let payload: PodiaWebhookPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch (error) {
      console.error('Failed to parse Podia payload:', error);
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Extract customer info from nested structure
    const data = payload.data || {};
    const email = data.customer?.email || data.email || 'unknown@example.com';
    const name = data.customer?.name || data.name || 'Unknown';
    const product = data.product_name || data.product?.name || 'Unknown Product';

    // Prepare Airtable record
    const airtableData = {
      Email: email,
      Name: name,
      Product: product,
      Status: 'Active',
      PodiaEventType: payload.type || 'unknown',
      SyncedAt: new Date().toISOString(),
    };

    // Sync to Airtable
    const result = await upsertCustomer(email, airtableData);

    // Notify Slack
    if (result.success) {
      await notifyCustomerEvent(result.action === 'created' ? 'Created' : 'Updated', {
        email,
        name,
        product,
      });
    } else {
      await notifyError('Podia Webhook', `Failed to sync customer: ${result.message}`, {
        email,
        product,
      });
    }

    return new Response(JSON.stringify({ ok: true, action: result.action }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Podia webhook error:', error);
    await notifyError('Podia Webhook', String(error));

    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
