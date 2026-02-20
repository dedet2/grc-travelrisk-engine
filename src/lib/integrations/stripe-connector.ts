export interface StripePaymentLink {
  id: string;
  url: string;
  object: 'payment_link';
  amount_total?: number;
  currency: string;
  customer_creation?: 'always' | 'if_required';
  description?: string;
  line_items?: StripeLineItem[];
  payment_intent?: string;
  status: 'open' | 'expired';
}

export interface StripeLineItem {
  id: string;
  price: string;
  quantity: number;
}

export interface StripeCustomer {
  id: string;
  object: 'customer';
  email?: string;
  name?: string;
  description?: string;
  created: number;
  metadata?: Record<string, string>;
}

export interface StripePaymentIntent {
  id: string;
  object: 'payment_intent';
  status: 'succeeded' | 'processing' | 'requires_payment_method' | 'requires_confirmation' | 'canceled' | string;
  amount: number;
  currency: string;
  customer?: string;
  description?: string;
  created: number;
}

export type AssessmentTier = 'starter' | 'professional' | 'enterprise';

export interface TierPricing {
  tier: AssessmentTier;
  amount: number;
  description: string;
  currency: string;
}

export class StripeConnector {
  private apiKey: string;
  private baseUrl = 'https://api.stripe.com/v1';
  private tierPricing: Record<AssessmentTier, TierPricing> = {
    starter: {
      tier: 'starter',
      amount: 29700,
      description: 'Starter Assessment Package',
      currency: 'usd',
    },
    professional: {
      tier: 'professional',
      amount: 99700,
      description: 'Professional Assessment Package',
      currency: 'usd',
    },
    enterprise: {
      tier: 'enterprise',
      amount: 249700,
      description: 'Enterprise Assessment Package',
      currency: 'usd',
    },
  };

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.STRIPE_SECRET_KEY || '';
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  private encodeFormData(
    data: Record<string, string | number | boolean>
  ): string {
    return Object.entries(data)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&');
  }

  async createPaymentLink(
    tier: AssessmentTier,
    customerEmail?: string
  ): Promise<{ success: boolean; url?: string; linkId?: string; error?: string }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: 'STRIPE_SECRET_KEY not configured' };
      }

      const pricing = this.tierPricing[tier];
      if (!pricing) {
        return { success: false, error: `Unknown tier: ${tier}` };
      }

      const formData = this.encodeFormData({
        'line_items[0][price_data][currency]': pricing.currency,
        'line_items[0][price_data][product_data][name]': pricing.description,
        'line_items[0][price_data][unit_amount]': pricing.amount,
        'line_items[0][quantity]': 1,
        after_completion_message: 'Assessment ready for download',
      });

      if (customerEmail) {
        const customerFormData = this.encodeFormData({
          email: customerEmail,
        });
        // Create/find customer
        const customerResponse = await fetch(
          `${this.baseUrl}/customers`,
          {
            method: 'POST',
            headers: this.getHeaders(),
            body: customerFormData,
          }
        );

        if (customerResponse.ok) {
          const customer = (await customerResponse.json()) as StripeCustomer;
          // Add customer to payment link request
          // (Note: payment links API doesn't directly support customer_id)
        }
      }

      const response = await fetch(
        `${this.baseUrl}/payment_links`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `Stripe API error: ${response.status} - ${errorText}`,
        };
      }

      const link = (await response.json()) as StripePaymentLink;
      return { success: true, url: link.url, linkId: link.id };
    } catch (error) {
      console.error('Error creating payment link:', error);
      return {
        success: false,
        error: `Link creation failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  async checkPaymentStatus(
    paymentIntentId: string
  ): Promise<{
    success: boolean;
    status?: string;
    amount?: number;
    currency?: string;
    error?: string;
  }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: 'STRIPE_SECRET_KEY not configured' };
      }

      const response = await fetch(
        `${this.baseUrl}/payment_intents/${paymentIntentId}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        return {
          success: false,
          error: `Failed to fetch payment: ${response.status}`,
        };
      }

      const payment = (await response.json()) as StripePaymentIntent;
      return {
        success: true,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
      };
    } catch (error) {
      console.error('Error checking payment status:', error);
      return {
        success: false,
        error: `Status check failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  async createCustomer(
    email: string,
    name?: string
  ): Promise<{ success: boolean; customerId?: string; error?: string }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: 'STRIPE_SECRET_KEY not configured' };
      }

      const formData = this.encodeFormData({
        email,
        ...(name && { name }),
      });

      const response = await fetch(
        `${this.baseUrl}/customers`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `Failed to create customer: ${response.status} - ${errorText}`,
        };
      }

      const customer = (await response.json()) as StripeCustomer;
      return { success: true, customerId: customer.id };
    } catch (error) {
      console.error('Error creating customer:', error);
      return {
        success: false,
        error: `Customer creation failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    message: string;
  }> {
    if (!this.apiKey) {
      return { status: 'unhealthy', message: 'STRIPE_SECRET_KEY not configured' };
    }
    return { status: 'healthy', message: 'Stripe connector ready' };
  }
}

export const stripeConnector = new StripeConnector();
