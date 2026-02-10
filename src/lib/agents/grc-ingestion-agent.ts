/**
 * GRC Ingestion Agent (A-01)
 * Responsible for collecting, processing, and managing GRC framework data
 * Extends BaseAgent with framework-specific lifecycle management
 */

import { BaseAgent, AgentConfig } from './base-agent';
import {
  getFramework,
  ISO_27001_2022_CATEGORIES,
  ISO_27001_2022_CONTROLS,
  getFrameworkStats,
} from '@/lib/grc/frameworks';
import { store } from '@/lib/store/in-memory-store';
import type { ParsedControl, FrameworkCategory } from '@/types/grc';

/**
 * Raw data from framework collection
 */
interface FrameworkRawData {
  name: string;
  version: string;
  description: string;
  sourceUrl?: string;
  categories: FrameworkCategory[];
  controls: ParsedControl[];
}

/**
 * Processed framework data ready for API consumption
 */
interface ProcessedFrameworkData {
  frameworkId: string;
  name: string;
  version: string;
  description: string;
  sourceUrl?: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  controlCount: number;
  categories: FrameworkCategory[];
  categoryCounts: Record<string, number>;
  controlTypes: Record<string, number>;
  criticalities: Record<string, number>;
  controls: ParsedControl[];
}

/**
 * GRC Framework Ingestion Agent
 * Handles collection, validation, and processing of GRC framework data
 */
export class GrcIngestionAgent extends BaseAgent<FrameworkRawData, ProcessedFrameworkData> {
  private frameworkName: string;

  constructor(config?: Partial<AgentConfig>) {
    super({
      name: 'GRC-Ingestion-Agent',
      description: 'Collects, validates, and processes GRC framework data (ISO 27001:2022)',
      maxRetries: 3,
      timeoutMs: 30000,
      enabled: true,
      ...config,
    });
    this.frameworkName = 'ISO 27001:2022';
  }

  /**
   * Collect raw framework data from built-in sources
   * Returns ISO 27001:2022 framework with all controls and categories
   */
  async collectData(): Promise<FrameworkRawData> {
    try {
      // Get the ISO 27001:2022 framework
      const framework = getFramework(this.frameworkName);

      if (!framework) {
        throw new Error(`Framework "${this.frameworkName}" not found in built-in data`);
      }

      return {
        name: framework.name,
        version: framework.version,
        description: framework.description,
        sourceUrl: 'https://www.iso.org/standard/27001',
        categories: framework.categories,
        controls: framework.controls,
      };
    } catch (error) {
      throw new Error(
        `Failed to collect framework data: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Process raw framework data into normalized, categorized format
   * Validates controls, counts by type/category, and prepares for storage
   */
  async processData(rawData: FrameworkRawData): Promise<ProcessedFrameworkData> {
    try {
      // Validate raw data
      if (!rawData.name || !rawData.controls || rawData.controls.length === 0) {
        throw new Error('Invalid framework data: missing name or controls');
      }

      // Generate unique framework ID
      const frameworkId = this.generateFrameworkId(rawData.name, rawData.version);

      // Count controls by category
      const categoryCounts: Record<string, number> = {};
      const controlTypes: Record<string, number> = {};
      const criticalities: Record<string, number> = {};

      rawData.controls.forEach((control) => {
        // Count by category
        categoryCounts[control.category] = (categoryCounts[control.category] || 0) + 1;

        // Count by control type
        controlTypes[control.controlType] = (controlTypes[control.controlType] || 0) + 1;

        // Count by criticality
        if (control.criticality) {
          criticalities[control.criticality] = (criticalities[control.criticality] || 0) + 1;
        }
      });

      const now = new Date();

      return {
        frameworkId,
        name: rawData.name,
        version: rawData.version,
        description: rawData.description,
        sourceUrl: rawData.sourceUrl,
        status: 'published',
        createdAt: now,
        updatedAt: now,
        controlCount: rawData.controls.length,
        categories: rawData.categories,
        categoryCounts,
        controlTypes,
        criticalities,
        controls: rawData.controls,
      };
    } catch (error) {
      throw new Error(
        `Failed to process framework data: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Update in-memory dashboard with processed framework data
   * Stores framework and controls in the in-memory store for API access
   */
  async updateDashboard(processedData: ProcessedFrameworkData): Promise<void> {
    try {
      // Check if framework already exists
      const existing = store.getFrameworkByName(processedData.name);
      if (existing) {
        console.warn(
          `Framework "${processedData.name}" already exists in store. Updating...`
        );
        store.deleteFramework(existing.id);
      }

      // Store framework metadata
      const framework = store.addFramework({
        id: processedData.frameworkId,
        name: processedData.name,
        version: processedData.version,
        description: processedData.description,
        sourceUrl: processedData.sourceUrl,
        status: processedData.status,
        createdAt: processedData.createdAt,
        updatedAt: processedData.updatedAt,
        controlCount: processedData.controlCount,
        categories: processedData.categories,
      });

      // Store all controls
      const controls = processedData.controls.map((control, index) => ({
        id: `${processedData.frameworkId}-${control.id}`,
        frameworkId: processedData.frameworkId,
        controlIdStr: control.id,
        title: control.title,
        description: control.description,
        category: control.category,
        controlType: control.controlType,
        criticality: control.criticality,
        createdAt: processedData.createdAt,
      }));

      store.addControls(processedData.frameworkId, controls);

      console.log(`Dashboard updated: Framework "${processedData.name}" with ${processedData.controlCount} controls`);
    } catch (error) {
      throw new Error(
        `Failed to update dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get the processed framework data from the last successful run
   */
  getLastFrameworkData(): ProcessedFrameworkData | undefined {
    const lastRun = this.getLastRun();
    if (lastRun && lastRun.status === 'completed' && lastRun.data) {
      return lastRun.data as ProcessedFrameworkData;
    }
    return undefined;
  }

  /**
   * Get stored framework by name
   */
  getStoredFramework(name: string) {
    return store.getFrameworkByName(name);
  }

  /**
   * Get all stored frameworks
   */
  getStoredFrameworks() {
    return store.getFrameworks();
  }

  /**
   * Get controls for a stored framework
   */
  getFrameworkControls(frameworkId: string) {
    return store.getControls(frameworkId);
  }

  /**
   * Get framework statistics
   */
  getFrameworkStatistics(frameworkId?: string) {
    const frameworks = frameworkId ? [store.getFramework(frameworkId)] : store.getFrameworks();

    const stats = frameworks
      .filter((f) => f !== undefined)
      .map((framework) => ({
        name: framework!.name,
        version: framework!.version,
        controlCount: store.getControls(framework!.id).length,
        categories: framework!.categories.length,
      }));

    return stats;
  }

  /**
   * Generate a unique framework ID
   */
  private generateFrameworkId(name: string, version: string): string {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const versionSlug = version.replace(/\./g, '-').toLowerCase();
    return `${slug}-${versionSlug}-${Date.now()}`;
  }
}

/**
 * Create and export a default instance of the GRC Ingestion Agent
 */
export function createGrcIngestionAgent(config?: Partial<AgentConfig>): GrcIngestionAgent {
  return new GrcIngestionAgent(config);
}

/**
 * Get framework ingestion stats
 */
export function getIngestionStats() {
  return store.getStats();
}
