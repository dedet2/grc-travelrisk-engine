import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';
import { PodiaConnector } from '@/lib/integrations/podia-connector';

interface PodiaStatus extends ApiResponse<{
  connected: boolean;
  products: number;
  students: number;
  revenue: number;
  currency: string;
  lastSync: string;
}> {
  success: boolean;
  message?: string;
}

export async function GET(): Promise<
  NextResponse<PodiaStatus>
> {
  try {
    const connector = new PodiaConnector(process.env.PODIA_API_KEY || '');
    const products = await connector.listProducts();

    const response: PodiaStatus = {
      success: true,
      message: 'Podia integration status retrieved',
      data: {
        connected: true,
        products: products.length,
        students: products.reduce((sum, p) => sum + (p.studentCount || 0), 0),
        revenue: products.reduce((sum, p) => sum + (p.price || 0), 0),
        currency: 'USD',
        lastSync: new Date().toISOString(),
      },
      timestamp: new Date(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error getting Podia status:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to get Podia status',
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}

interface PodiaAction {
  action: string;
  productId?: string;
  productName?: string;
  productType?: string;
  price?: number;
  email?: string;
  fullName?: string;
  webhookUrl?: string;
  eventType?: string;
}

interface ActionResponse extends ApiResponse<unknown> {
  success: boolean;
  message?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ActionResponse>> {
  try {
    const body = (await request.json()) as PodiaAction;
    const { action, productId, productName, productType, price, email, fullName, webhookUrl, eventType } = body;
    const connector = new PodiaConnector(process.env.PODIA_API_KEY || '');

    if (action === 'list-products') {
      const products = await connector.listProducts();
      return NextResponse.json({
        success: true,
        message: 'Products retrieved',
        data: products,
        timestamp: new Date(),
      });
    }

    if (action === 'create-product' && productName && productType) {
      const product = await connector.createProduct(
        productName,
        productType as 'course' | 'membership' | 'digital_product',
        price
      );
      return NextResponse.json(
        {
          success: true,
          message: 'Product created',
          data: product,
          timestamp: new Date(),
        },
        { status: 201 }
      );
    }

    if (action === 'update-product' && productId) {
      const updates = {
        ...(productName && { name: productName }),
        ...(price && { price }),
      };
      const product = await connector.updateProduct(productId, updates);
      return NextResponse.json({
        success: true,
        message: 'Product updated',
        data: product,
        timestamp: new Date(),
      });
    }

    if (action === 'list-students' && productId) {
      const students = await connector.listStudents(productId);
      return NextResponse.json({
        success: true,
        message: 'Students retrieved',
        data: students,
        timestamp: new Date(),
      });
    }

    if (action === 'enroll-student' && productId && email && fullName) {
      const enrollment = await connector.enrollStudent(productId, email, fullName);
      return NextResponse.json(
        {
          success: true,
          message: 'Student enrolled',
          data: enrollment,
          timestamp: new Date(),
        },
        { status: 201 }
      );
    }

    if (action === 'get-revenue') {
      const revenue = await connector.getRevenue(productId, 'monthly');
      return NextResponse.json({
        success: true,
        message: 'Revenue data retrieved',
        data: revenue,
        timestamp: new Date(),
      });
    }

    if (action === 'register-webhook' && webhookUrl && eventType) {
      const webhook = await connector.registerWebhook(webhookUrl, eventType);
      return NextResponse.json(
        {
          success: true,
          message: 'Webhook registered',
          data: webhook,
          timestamp: new Date(),
        },
        { status: 201 }
      );
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
    console.error('Error in Podia integration:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process Podia request',
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
