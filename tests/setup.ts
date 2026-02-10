import { vi } from 'vitest';

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key';
process.env.ANTHROPIC_API_KEY = 'mock-api-key';

// Mock Supabase
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: vi.fn(),
  }),
}));

vi.mock('@/lib/supabase/server', () => ({
  createServerSideClient: () => ({
    from: vi.fn(),
  }),
  createServiceRoleClient: () => ({
    from: vi.fn(),
  }),
}));

// Mock Clerk
vi.mock('@clerk/nextjs/server', () => ({
  auth: () => ({
    userId: 'test-user-id',
  }),
}));

// Mock Anthropic
vi.mock('@anthropic-ai/sdk', () => ({
  default: class MockAnthropic {
    messages = {
      create: vi.fn(),
    };
  },
}));
