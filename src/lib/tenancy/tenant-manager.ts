/**
 * Tenant Manager - Multi-tenancy support layer
 * Provides tenant isolation and management for the GRC TravelRisk Engine
 */

import { inMemoryStore } from '@/lib/store/in-memory-store';

export type TenantPlan = 'starter' | 'professional' | 'enterprise';

export interface TenantSettings {
  theme?: 'light' | 'dark';
  notificationsEnabled?: boolean;
  customDomain?: string;
  allowedApiVersions?: string[];
  [key: string]: any;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: Date;
  plan: TenantPlan;
  settings: TenantSettings;
  memberCount?: number;
}

/**
 * TenantManager class
 * Wraps the in-memory store with tenant isolation
 */
class TenantManager {
  private tenants: Map<string, Tenant> = new Map();
  private userToTenant: Map<string, string> = new Map(); // userId -> tenantId mapping

  constructor() {
    // Initialize with a default tenant for development
    this.initializeDefaults();
  }

  /**
   * Initialize with default tenant for development
   */
  private initializeDefaults(): void {
    // This would be replaced with database initialization in production
  }

  /**
   * Create a new tenant
   */
  createTenant(
    name: string,
    slug: string,
    ownerId: string,
    plan: TenantPlan = 'starter'
  ): Tenant {
    const tenantId = `tenant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const tenant: Tenant = {
      id: tenantId,
      name,
      slug,
      ownerId,
      createdAt: new Date(),
      plan,
      settings: {
        theme: 'light',
        notificationsEnabled: true,
      },
      memberCount: 1,
    };

    this.tenants.set(tenantId, tenant);
    this.userToTenant.set(ownerId, tenantId);

    return tenant;
  }

  /**
   * Get tenant by ID
   */
  getTenant(tenantId: string): Tenant | undefined {
    return this.tenants.get(tenantId);
  }

  /**
   * Get tenant by slug
   */
  getTenantBySlug(slug: string): Tenant | undefined {
    for (const tenant of this.tenants.values()) {
      if (tenant.slug === slug) {
        return tenant;
      }
    }
    return undefined;
  }

  /**
   * Update tenant
   */
  updateTenant(tenantId: string, updates: Partial<Tenant>): Tenant | undefined {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) return undefined;

    const updated: Tenant = {
      ...tenant,
      ...updates,
      id: tenant.id,
      createdAt: tenant.createdAt,
    };

    this.tenants.set(tenantId, updated);
    return updated;
  }

  /**
   * Delete tenant
   */
  deleteTenant(tenantId: string): boolean {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) return false;

    // Remove user mappings
    for (const [userId, tId] of this.userToTenant.entries()) {
      if (tId === tenantId) {
        this.userToTenant.delete(userId);
      }
    }

    return this.tenants.delete(tenantId);
  }

  /**
   * Get all tenants (admin only)
   */
  getAllTenants(): Tenant[] {
    return Array.from(this.tenants.values());
  }

  /**
   * Get tenant for a user
   */
  getTenantForUser(userId: string): Tenant | undefined {
    const tenantId = this.userToTenant.get(userId);
    if (!tenantId) return undefined;
    return this.tenants.get(tenantId);
  }

  /**
   * Map user to tenant
   */
  addUserToTenant(userId: string, tenantId: string): boolean {
    if (!this.tenants.has(tenantId)) return false;

    const tenant = this.tenants.get(tenantId);
    if (!tenant) return false;

    this.userToTenant.set(userId, tenantId);

    // Increment member count
    tenant.memberCount = (tenant.memberCount || 0) + 1;
    this.tenants.set(tenantId, tenant);

    return true;
  }

  /**
   * Remove user from tenant
   */
  removeUserFromTenant(userId: string): boolean {
    const tenantId = this.userToTenant.get(userId);
    if (!tenantId) return false;

    const tenant = this.tenants.get(tenantId);
    if (tenant && tenant.memberCount) {
      tenant.memberCount--;
      this.tenants.set(tenantId, tenant);
    }

    return this.userToTenant.delete(userId);
  }

  /**
   * Get tenant from Clerk user
   * In production, this would query a database mapping Clerk userId to tenant
   */
  async getTenantFromClerkUser(userId: string): Promise<Tenant | undefined> {
    // First try in-memory mapping
    const tenantId = this.userToTenant.get(userId);
    if (tenantId) {
      return this.tenants.get(tenantId);
    }

    // In production: query database
    // For now, create a default tenant on first access
    return undefined;
  }

  /**
   * Ensure tenant exists for user, create if needed
   */
  async ensureTenantForUser(userId: string, userEmail: string): Promise<Tenant> {
    let tenant = await this.getTenantFromClerkUser(userId);

    if (!tenant) {
      // Create default tenant for user
      const name = userEmail.split('@')[0];
      const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      tenant = this.createTenant(name, slug, userId, 'starter');
    }

    return tenant;
  }

  /**
   * Get frameworks for tenant (scoped by tenantId)
   */
  getTenantFrameworks(tenantId: string) {
    // In production, this would filter frameworks by tenantId
    // For now, return all frameworks (in-memory store doesn't have tenant awareness)
    return inMemoryStore.getFrameworks();
  }

  /**
   * Validate tenant access
   */
  validateTenantAccess(tenantId: string, userId: string): boolean {
    const userTenantId = this.userToTenant.get(userId);
    return userTenantId === tenantId;
  }
}

/**
 * Singleton instance of TenantManager
 */
export const tenantManager = new TenantManager();
export default tenantManager;
