/**
 * Webhook Signature Verification
 * Provides HMAC verification for Make.com and Podia webhooks
 */

import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Verify Make.com webhook signature
 * Make uses SHA256 HMAC with the signing secret
 */
export function verifyMakeSignature(
  rawBody: string,
  providedSignature: string | undefined
): boolean {
  const secret = process.env.MAKE_SIGNING_SECRET;

  if (!secret || !providedSignature) {
    return false;
  }

  try {
    const hmac = createHmac('sha256', secret).update(rawBody).digest('hex');
    return timingSafeEqual(Buffer.from(hmac), Buffer.from(providedSignature));
  } catch (error) {
    console.error('Error verifying Make signature:', error);
    return false;
  }
}

/**
 * Verify Podia webhook signature
 * Podia uses SHA256 HMAC, but signature is optional if no secret is configured
 */
export function verifyPodiaSignature(
  rawBody: string,
  providedSignature: string | undefined
): boolean {
  const secret = process.env.PODIA_WEBHOOK_SECRET;

  // If no secret configured, allow the webhook (trust network)
  if (!secret) {
    return true;
  }

  if (!providedSignature) {
    return false;
  }

  try {
    const hmac = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(providedSignature));
  } catch (error) {
    console.error('Error verifying Podia signature:', error);
    return false;
  }
}

/**
 * Generic webhook signature verification
 * Supports multiple signature algorithms
 */
export function verifyWebhookSignature(
  rawBody: string,
  providedSignature: string | undefined,
  secret: string | undefined,
  algorithm: 'sha256' | 'sha1' = 'sha256'
): boolean {
  if (!secret || !providedSignature) {
    return false;
  }

  try {
    const hmac = createHmac(algorithm, secret).update(rawBody).digest('hex');
    return timingSafeEqual(Buffer.from(hmac), Buffer.from(providedSignature));
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

/**
 * Extract signature from headers
 * Supports various header naming conventions
 */
export function extractSignature(headers: {
  get(key: string): string | null;
}): string | undefined {
  // Try common header names
  const possibleHeaders = [
    'X-Signature',
    'X-Make-Signature',
    'X-Podia-Signature',
    'X-Webhook-Signature',
    'X-Hmac-SHA256',
  ];

  for (const header of possibleHeaders) {
    const value = headers.get(header);
    if (value) {
      return value;
    }
  }

  return undefined;
}

/**
 * Get raw request body as text
 * Properly handles streaming for signature verification
 */
export async function getRawRequestBody(request: Request): Promise<string> {
  const body = await request.text();
  return body;
}
