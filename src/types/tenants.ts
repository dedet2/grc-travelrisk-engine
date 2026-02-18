export type PlanType = 'starter' | 'professional' | 'enterprise';

export interface Plan {
  name: PlanType;
  displayName: string;
  maxUsers: number;
  maxAgents: number;
  frameworks: string[];
  monthlyPrice: number;
  features: string[];
}

export interface TenantPlanLimits {
  maxUsers: number;
  maxAgents: number;
  maxFrameworks: number;
  maxAPICallsPerDay: number;
  maxStorageGB: number;
}

export interface TenantUsage {
  userId: string;
  tenantId: string;
  currentUsers: number;
  currentAgents: number;
  currentFrameworks: number;
  apiCallsUsedToday: number;
  storageUsedGB: number;
  timestamp: Date;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: PlanType;
  adminId: string;
  features: string[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  settings?: Record<string, unknown>;
}

export interface TenantLimitEnforcement {
  resource: string;
  current: number;
  limit: number;
  remaining: number;
  percentUsed: number;
  isExceeded: boolean;
}
