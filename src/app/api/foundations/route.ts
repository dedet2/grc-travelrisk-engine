/**
 * Foundations API Routes
 * GET: List all foundations with optional filtering
 */

import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

// Mock foundations data
const mockFoundationsData = [
  {
    id: '1',
    name: 'Ford Foundation',
    type: 'Foundation' as const,
    boardSeatsAvailable: 2,
    annualBudget: 600000000,
    relationshipStatus: 'Active' as const,
  },
  {
    id: '2',
    name: 'Gates Foundation',
    type: 'Foundation' as const,
    boardSeatsAvailable: 0,
    annualBudget: 7000000000,
    relationshipStatus: 'Prospect' as const,
  },
  {
    id: '3',
    name: 'Rockefeller Foundation',
    type: 'Foundation' as const,
    boardSeatsAvailable: 1,
    annualBudget: 400000000,
    relationshipStatus: 'Active' as const,
  },
  {
    id: '4',
    name: 'Aspen Institute',
    type: 'Think Tank' as const,
    boardSeatsAvailable: 3,
    annualBudget: 80000000,
    relationshipStatus: 'Applied' as const,
  },
  {
    id: '5',
    name: 'Brookings Institution',
    type: 'Think Tank' as const,
    boardSeatsAvailable: 1,
    annualBudget: 150000000,
    relationshipStatus: 'Active' as const,
  },
];

interface Foundation {
  id: string;
  name: string;
  type: 'Foundation' | 'Nonprofit' | 'Think Tank';
  boardSeatsAvailable: number;
  annualBudget: number;
  relationshipStatus: 'Active' | 'Prospect' | 'Applied';
}

interface FoundationsMetrics {
  totalFoundations: number;
  boardOpportunities: number;
  activeRelationships: number;
}

/**
 * GET /api/foundations
 * List all foundations with optional filtering
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const searchQuery = url.searchParams.get('search');
    const relationshipStatus = url.searchParams.get('relationshipStatus');
    const type = url.searchParams.get('type');

    // Start with mock data
    let foundations: Foundation[] = [...mockFoundationsData];

    // Apply filters
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      foundations = foundations.filter(
        (f) =>
          f.name.toLowerCase().includes(query) ||
          f.type.toLowerCase().includes(query)
      );
    }

    if (relationshipStatus) {
      foundations = foundations.filter((f) => f.relationshipStatus === relationshipStatus);
    }

    if (type) {
      foundations = foundations.filter((f) => f.type === type);
    }

    // Calculate metrics
    const metrics: FoundationsMetrics = {
      totalFoundations: mockFoundationsData.length,
      boardOpportunities: mockFoundationsData.reduce((sum, f) => sum + f.boardSeatsAvailable, 0),
      activeRelationships: mockFoundationsData.filter((f) => f.relationshipStatus === 'Active')
        .length,
    };

    return Response.json(
      {
        success: true,
        data: {
          foundations,
          metrics,
          count: foundations.length,
        },
        timestamp: new Date(),
      } as ApiResponse<any>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching foundations:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch foundations',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
