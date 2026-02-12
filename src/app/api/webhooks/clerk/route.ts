/**
 * Clerk Webhook Receiver
 * Handles user lifecycle events (created, updated, deleted)
 * and session events (sign-in tracking)
 */

import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import type { WebhookEvent } from '@clerk/nextjs/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

async function verifyWebhookSignature(req: NextRequest, body: string): Promise<boolean> {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('CLERK_WEBHOOK_SECRET not configured');
    return false;
  }

  const svixId = req.headers.get('svix-id');
  const svixTimestamp = req.headers.get('svix-timestamp');
  const svixSignature = req.headers.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.warn('Missing Svix headers');
    return false;
  }

  const wh = new Webhook(webhookSecret);

  try {
    wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });
    return true;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await req.text();

    // Verify webhook signature
    const isValid = await verifyWebhookSignature(req, rawBody);
    if (!isValid) {
      console.warn('Invalid Clerk webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Parse payload
    let evt: WebhookEvent;
    try {
      evt = JSON.parse(rawBody);
    } catch (error) {
      console.error('Failed to parse Clerk webhook payload:', error);
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // Initialize Supabase client
    const supabase = await createServiceRoleClient();

    // Handle the webhook events
    const { type, data } = evt;

    switch (type) {
      case 'user.created': {
        console.log(`Creating user profile for: ${data.id}`);

        const email = data.email_addresses?.[0]?.email_address;

        const { error } = await supabase.from('user_profiles').insert({
          clerk_user_id: data.id,
          email: email || null,
          first_name: data.first_name || null,
          last_name: data.last_name || null,
          avatar_url: data.image_url || null,
        });

        if (error) {
          console.error('Error creating user profile:', error);
          return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 });
        }

        console.log('User profile created successfully:', data.id);
        break;
      }

      case 'user.updated': {
        console.log(`Updating user profile for: ${data.id}`);

        const email = data.email_addresses?.[0]?.email_address;

        const { error } = await supabase
          .from('user_profiles')
          .update({
            email: email || null,
            first_name: data.first_name || null,
            last_name: data.last_name || null,
            avatar_url: data.image_url || null,
            updated_at: new Date().toISOString(),
          })
          .eq('clerk_user_id', data.id);

        if (error) {
          console.error('Error updating user profile:', error);
          return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 });
        }

        console.log('User profile updated successfully:', data.id);
        break;
      }

      case 'user.deleted': {
        console.log(`Deleting user profile for: ${data.id}`);

        // Soft delete by marking the profile as deleted
        const { error } = await supabase
          .from('user_profiles')
          .update({
            updated_at: new Date().toISOString(),
          })
          .eq('clerk_user_id', data.id);

        if (error) {
          console.error('Error deleting user profile:', error);
          return NextResponse.json({ error: 'Failed to delete user profile' }, { status: 500 });
        }

        console.log('User profile deleted successfully:', data.id);
        break;
      }

      case 'session.created': {
        console.log(`Updating last_sign_in for user: ${data.user_id}`);

        const { error } = await supabase
          .from('user_profiles')
          .update({
            last_sign_in: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('clerk_user_id', data.user_id);

        if (error) {
          console.error('Error updating last_sign_in:', error);
          // Don't fail the webhook for this non-critical update
        }

        console.log('last_sign_in updated successfully:', data.user_id);
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${type}`);
    }

    return NextResponse.json({ ok: true, message: 'Webhook processed' }, { status: 200 });
  } catch (error) {
    console.error('Clerk webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
