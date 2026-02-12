import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

interface Foundation {
  id: string;
  name: string;
  boardSeats: number;
  annualBudget: number;
  relationshipStatus: 'prospect' | 'engaged' | 'partner';
  focus: string;
}

const mockFoundations: Foundation[] = [
  {
    id: 'found-001',
    name: 'MacArthur Foundation',
    boardSeats: 15,
    annualBudget: 500000000,
    relationshipStatus: 'prospect',
    focus: 'Technology and Social Change',
  },
  {
    id: 'found-002',
    name: 'Mozilla Foundation',
    boardSeats: 8,
    annualBudget: 150000000,
    relationshipStatus: 'engaged',
    focus: 'Open Internet',
  },
  {
    id: 'found-003',
    name: 'AI Now Institute',
    boardSeats: 10,
    annualBudget: 50000000,
    relationshipStatus: 'partner',
    focus: 'AI Governance',
  },
  {
    id: 'found-004',
    name: 'Knight Foundation',
    boardSeats: 12,
    annualBudget: 300000000,
    relationshipStatus: 'prospect',
    focus: 'Democracy and Open Society',
  },
  {
    id: 'found-005',
    name: 'Omidyar Network',
    boardSeats: 9,
    annualBudget: 800000000,
    relationshipStatus: 'engaged',
    focus: 'Digital Rights and Governance',
  },
];

export async function GET() {
  return NextResponse.json(
    {
      success: true,
      data: mockFoundations,
      timestamp: new Date(),
    } as ApiResponse<Foundation[]>,
    { status: 200 }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.boardSeats || !body.annualBudget || !body.focus) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: name, boardSeats, annualBudget, focus',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const newFoundation: Foundation = {
      id: `found-${Date.now()}`,
      name: body.name,
      boardSeats: body.boardSeats,
      annualBudget: body.annualBudget,
      relationshipStatus: body.relationshipStatus || 'prospect',
      focus: body.focus,
    };

    return NextResponse.json(
      {
        success: true,
        data: newFoundation,
        timestamp: new Date(),
      } as ApiResponse<Foundation>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating foundation:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create foundation',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
