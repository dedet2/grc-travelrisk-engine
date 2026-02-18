export interface PodiaProduct {
  id: string;
  name: string;
  type: 'course' | 'membership' | 'digital_product';
  price?: number;
  currency?: string;
  studentCount?: number;
  createdAt: string;
}

export interface PodiaStudent {
  id: string;
  email: string;
  fullName: string;
  productId: string;
  enrollmentDate: string;
  status: 'active' | 'cancelled' | 'paused';
}

export interface PodiaEnrollment {
  id: string;
  studentId: string;
  productId: string;
  enrolledAt: string;
  completionPercentage: number;
  status: 'in_progress' | 'completed' | 'cancelled';
}

export interface PodiaRevenue {
  productId: string;
  productName: string;
  totalRevenue: number;
  studentCount: number;
  currency: string;
  period: string;
}

export interface WebhookRegistration {
  webhookId: string;
  url: string;
  eventType: string;
  isActive: boolean;
}

export class PodiaConnector {
  private apiUrl = 'https://api.podia.com/v1';
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  private getPreconfiguredProducts(): PodiaProduct[] {
    return [
      {
        id: 'prod-001',
        name: 'GRC Fundamentals Course',
        type: 'course',
        price: 499,
        currency: 'USD',
        studentCount: 342,
        createdAt: new Date(Date.now() - 86400000 * 180).toISOString(),
      },
      {
        id: 'prod-002',
        name: 'Travel Risk Certification',
        type: 'course',
        price: 799,
        currency: 'USD',
        studentCount: 156,
        createdAt: new Date(Date.now() - 86400000 * 120).toISOString(),
      },
      {
        id: 'prod-003',
        name: 'Enterprise Assessment Workshop',
        type: 'digital_product',
        price: 1200,
        currency: 'USD',
        studentCount: 42,
        createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
      },
      {
        id: 'prod-004',
        name: 'Executive Briefing Series',
        type: 'membership',
        price: 299,
        currency: 'USD',
        studentCount: 89,
        createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
      },
    ];
  }

  async listProducts(): Promise<PodiaProduct[]> {
    try {
      return this.getPreconfiguredProducts();
    } catch (error) {
      console.error('Error listing products:', error);
      throw error;
    }
  }

  async createProduct(
    name: string,
    type: 'course' | 'membership' | 'digital_product',
    price?: number
  ): Promise<PodiaProduct> {
    try {
      const response = await fetch(`${this.apiUrl}/products`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          name,
          type,
          price,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create product: ${response.statusText}`);
      }

      const data = await response.json() as PodiaProduct;
      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async updateProduct(
    productId: string,
    updates: Partial<PodiaProduct>
  ): Promise<PodiaProduct> {
    try {
      const response = await fetch(`${this.apiUrl}/products/${productId}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update product: ${response.statusText}`);
      }

      const data = await response.json() as PodiaProduct;
      return data;
    } catch (error) {
      console.error(`Error updating product ${productId}:`, error);
      throw error;
    }
  }

  async listStudents(productId: string): Promise<PodiaStudent[]> {
    try {
      const response = await fetch(
        `${this.apiUrl}/products/${productId}/students`,
        {
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch students: ${response.statusText}`);
      }

      const data = await response.json() as { students: PodiaStudent[] };
      return data.students || [];
    } catch (error) {
      console.error(`Error listing students for product ${productId}:`, error);
      throw error;
    }
  }

  async enrollStudent(
    productId: string,
    email: string,
    fullName: string
  ): Promise<PodiaEnrollment> {
    try {
      const response = await fetch(
        `${this.apiUrl}/products/${productId}/enrollments`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({
            email,
            fullName,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to enroll student: ${response.statusText}`);
      }

      const data = await response.json() as PodiaEnrollment;
      return data;
    } catch (error) {
      console.error('Error enrolling student:', error);
      throw error;
    }
  }

  async getEnrollmentStatus(
    enrollmentId: string
  ): Promise<PodiaEnrollment> {
    try {
      const response = await fetch(
        `${this.apiUrl}/enrollments/${enrollmentId}`,
        {
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to get enrollment status: ${response.statusText}`
        );
      }

      const data = await response.json() as PodiaEnrollment;
      return data;
    } catch (error) {
      console.error(`Error getting enrollment status:`, error);
      throw error;
    }
  }

  async getRevenue(
    productId?: string,
    period: string = 'monthly'
  ): Promise<PodiaRevenue[]> {
    try {
      const url = productId
        ? `${this.apiUrl}/products/${productId}/revenue`
        : `${this.apiUrl}/revenue`;

      const response = await fetch(`${url}?period=${period}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch revenue: ${response.statusText}`);
      }

      const data = await response.json() as { revenues: PodiaRevenue[] };
      return data.revenues || [];
    } catch (error) {
      console.error('Error fetching revenue:', error);
      throw error;
    }
  }

  async registerWebhook(
    url: string,
    eventType: string
  ): Promise<WebhookRegistration> {
    try {
      const response = await fetch(`${this.apiUrl}/webhooks`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          url,
          events: [eventType],
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to register webhook: ${response.statusText}`);
      }

      const data = await response.json() as { id: string };
      return {
        webhookId: data.id,
        url,
        eventType,
        isActive: true,
      };
    } catch (error) {
      console.error('Error registering webhook:', error);
      throw error;
    }
  }

  async unregisterWebhook(webhookId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/webhooks/${webhookId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to unregister webhook: ${response.statusText}`
        );
      }

      return true;
    } catch (error) {
      console.error('Error unregistering webhook:', error);
      throw error;
    }
  }
}
