/**
 * Store Index - Exports both in-memory and Supabase stores
 * Default export is the Supabase store with in-memory fallback
 * Direct imports of InMemoryStore are still available for legacy code
 */

// Re-export in-memory store for backward compatibility
export * from './in-memory-store';
export { inMemoryStore } from './in-memory-store';

// Export Supabase store (primary store with fallback)
export * from './supabase-store';
export { supabaseStore, store } from './supabase-store';

// Default export is the Supabase store
import { supabaseStore } from './supabase-store';
export default supabaseStore;
