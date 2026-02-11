import { NextRequest, NextResponse } from 'next/server';
import { fetchTravelAdvisories } from '@/lib/travel/advisory-fetcher';
import { TravelDestination } from '@/types/index';
import { ApiResponse } from '@/types/index';

export const dynamic = 'force-dynamic';

/**
 * GET /api/travel/destinations
 * List all travel destinations with risk scores
 * Query parameters:
 *   - search: Filter by country name or code (case-insensitive)
 *   - level: Filter by advisory level (comma-separated: 1,2,3,4)
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<TravelDestination[]>>> {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search')?.toLowerCase() || '';
    const levelParam = searchParams.get('level');

    // Fetch all destinations
    const allDestinations = await fetchTravelAdvisories();

    if (!allDestinations || allDestinations.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No destinations available',
        timestamp: new Date(),
      });
    }

    // Parse advisory levels filter
    let advisoryLevels: (1 | 2 | 3 | 4)[] | null = null;
    if (levelParam) {
      advisoryLevels = levelParam
        .split(',')
        .map((l) => parseInt(l, 10))
        .filter((l) => l >= 1 && l <= 4) as (1 | 2 | 3 | 4)[];

      if (advisoryLevels.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Invalid advisory levels. Must be 1, 2, 3, or 4',
          timestamp: new Date(),
        });
      }
    }

    // Filter destinations
    let filteredDestinations = allDestinations;

    // Apply search filter
    if (search) {
      filteredDestinations = filteredDestinations.filter(
        (dest) =>
          dest.countryName.toLowerCase().includes(search) ||
          dest.countryCode.toLowerCase().includes(search),
      );
    }

    // Apply advisory level filter
    if (advisoryLevels && advisoryLevels.length > 0) {
      filteredDestinations = filteredDestinations.filter((dest) =>
        advisoryLevels!.includes(dest.advisoryLevel),
      );
    }

    // Sort by country name for consistent results
    filteredDestinations.sort((a, b) => a.countryName.localeCompare(b.countryName));

    return NextResponse.json({
      success: true,
      data: filteredDestinations,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error fetching destinations:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch destinations',
        timestamp: new Date(),
      },
      { status: 500 },
    );
  }
}
