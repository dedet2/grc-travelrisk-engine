import { Webhook } from 'svix';
import type { WebhookEvent } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

// Clerk webhook secret
const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(request: Request) {
  if (!webhookSecret) {
    return new Response('Webhook secret not configured', { status: 400 });
  }

  // Get the Svix headers and body
  const svixId = request.headers.get('svix-id') || '';
  const svixTimestamp = request.headers.get('svix-timestamp') || '';
  const svixSignature = request.headers.get('svix-signature') || '';
  const body = await request.text();

  // Create a new Webhook instance with your secret
  const wh = new Webhook(webhookSecret);

  let evt: WebhookEvent;
  try {
    evt = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400,
    });
  }

  // Handle the webhook events
  const { type, data } = evt;

  switch (type) {
    case 'user.created':
      console.log(`User created: ${data.id}`);
      // TODO: Create user profile in Supabase
      break;
    case 'user.deleted':
      console.log(`User deleted: ${data.id}`);
      // TODO: Clean up user data in Supabase
      break;
    case 'user.updated':
      console.log(`User updated: ${data.id}`);
      // TODO: Update user profile in Supabase
      break;
    default:
      console.log(`Unhandled webhook event: ${type}`);
  }

  return new Response('Webhook received', { status: 200 });
}
