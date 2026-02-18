import { Tenant, PlanType, TenantPlanLimits, TenantUsage, TenantLimitEnforcement } from '@/types/tenants';

const PLAN_LIMITS: Record<PlanType, TenantPlanLimits> = {
  starter: {
    maxUsers: 5,
    maxAgents: 10,
    maxFrameworks: 2,
    maxAPICallsPerDay: 1000,
    maxStorageGB: 10
  },
  professional: {
    maxUsers: 25,
    maxAgents: 34,
    maxFrameworks: 6,
    maxAPICallsPerDay: 50000,
    maxStorageGB: 100
  },
  enterprise: {
    maxUsers: 999999,
    maxAgents: 999999,
    maxFrameworks: 999999,
    maxAPICallsPerDay: 999999,
    maxStorageGB: 999999
  }
};

class TenantManager {
  private tenants: Map<string, Tenant> = new Map();
  private usage: Map<string, TenantUsage> = new Map();
  private nextId: number = 1;

  constructor() {
    this.seedTenants();
  }

  private seedTenants(): void {
    const demoTenant: Tenant = {
      id: 'org_1',
      name: 'Acme Corporation',
      slug: 'acme-corp',
      plan: 'professional',
      adminId: 'user_1',
      features: ['grc_automation', 'travel_risk', 'ai_agents', 'compliance_hub', 'risk_scoring', 'executive_dashboard'],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
      isActive: true,
      settings: {
        timezone: 'America/New_York',
        language: 'en',
        slackIntegration: true,
        airtableIntegration: true
      }
    };

    this.tenants.set(demoTenant.id, demoTenant);

    const demoUsage: TenantUsage = {
      userId: 'user_1',
      tenantId: 'org_1',
      currentUsers: 12,
      currentAgents: 8,
      currentFrameworks: 4,
      apiCallsUsedToday: 23450,
      storageUsedGB: 42.5,
      timestamp: new Date()
    };

    this.usage.set('org_1', demoUsage);
  }

  createTenant(name: string, plan: PlanType, adminId: string): Tenant {
    const id = `org_${this.nextId}`;
    this.nextId++;

    const slug = name.toLowerCase().replace(/\s+/g, '-');

    const tenant: Tenant = {
      id,
      name,
      slug,
      plan,
      adminId,
      features: this.getFeaturesForPlan(plan),
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };

    this.tenants.set(id, tenant);

    const usage: TenantUsage = {
      userId: adminId,
      tenantId: id,
      currentUsers: 1,
      currentAgents: 0,
      currentFrameworks: 0,
      apiCallsUsedToday: 0,
      storageUsedGB: 0,
      timestamp: new Date()
    };

    this.usage.set(id, usage);

    return tenant;
  }

  getTenant(tenantId: string): Tenant | null {
    return this.tenants.get(tenantId) || null;
  }

  updateTenantPlan(tenantId: string, plan: PlanType): Tenant | null {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) return null;

    tenant.plan = plan;
    tenant.features = this.getFeaturesForPlan(plan);
    tenant.updatedAt = new Date();

    this.tenants.set(tenantId, tenant);
    return tenant;
  }

  getTenantUsage(tenantId: string): TenantUsage | null {
    return this.usage.get(tenantId) || null;
  }

  updateTenantUsage(tenantId: string, usage: Partial<TenantUsage>): TenantUsage | null {
    const current = this.usage.get(tenantId);
    if (!current) return null;

    const updated = { ...current, ...usage, timestamp: new Date() };
    this.usage.set(tenantId, updated);
    return updated;
  }

  enforceLimits(tenantId: string, resource: string): TenantLimitEnforcement | null {
    const tenant = this.tenants.get(tenantId);
    const usage = this.usage.get(tenantId);

    if (!tenant || !usage) return null;

    const limits = PLAN_LIMITS[tenant.plan];

    let current: number = 0;
    let limit: number = 0;

    switch (resource) {
      case 'users':
        current = usage.currentUsers;
        limit = limits.maxUsers;
        break;
      case 'agents':
        current = usage.currentAgents;
        limit = limits.maxAgents;
        break;
      case 'frameworks':
        current = usage.currentFrameworks;
        limit = limits.maxFrameworks;
        break;
      case 'api_calls':
        current = usage.apiCallsUsedToday;
        limit = limits.maxAPICallsPerDay;
        break;
      case 'storage':
        current = Math.round(usage.storageUsedGB * 10) / 10;
        limit = limits.maxStorageGB;
        break;
      default:
        return null;
    }

    const remaining = Math.max(0, limit - current);
    const percentUsed = Math.round((current / limit) * 100);
    const isExceeded = current >= limit;

    return {
      resource,
      current,
      limit,
      remaining,
      percentUsed,
      isExceeded
    };
  }

  listTenants(): Tenant[] {
    return Array.from(this.tenants.values());
  }

  getAllUsageStats(): Record<string, TenantUsage> {
    const stats: Record<string, TenantUsage> = {};
    this.usage.forEach((usage, tenantId) => {
      stats[tenantId] = usage;
    });
    return stats;
  }

  getPlanLimits(plan: PlanType): TenantPlanLimits {
    return PLAN_LIMITS[plan];
  }

  private getFeaturesForPlan(plan: PlanType): string[] {
    const baseFeatures = ['grc_automation', 'compliance_hub', 'risk_scoring'];

    switch (plan) {
      case 'starter':
        return [...baseFeatures];
      case 'professional':
        return [...baseFeatures, 'travel_risk', 'ai_agents', 'executive_dashboard', 'api_access'];
      case 'enterprise':
        return [
          ...baseFeatures,
          'travel_risk',
          'ai_agents',
          'executive_dashboard',
          'api_access',
          'custom_integrations',
          'sso',
          'advanced_analytics',
          'dedicated_support'
        ];
      default:
        return baseFeatures;
    }
  }

  deactivateTenant(tenantId: string): Tenant | null {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) return null;

    tenant.isActive = false;
    tenant.updatedAt = new Date();

    this.tenants.set(tenantId, tenant);
    return tenant;
  }

  activateTenant(tenantId: string): Tenant | null {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) return null;

    tenant.isActive = true;
    tenant.updatedAt = new Date();

    this.tenants.set(tenantId, tenant);
    return tenant;
  }
}

export const tenantManager = new TenantManager();
