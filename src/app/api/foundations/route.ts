import { NextResponse } from 'next/server';

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
  return NextResponse.json(mockFoundations);
}

export async function POST(request: Request) {
  const body = await request.json();
  
  const newFoundation: Foundation = {
    id: `found-${Date.now()}`,
    name: body.name,
    boardSeats: body.boardSeats,
    annualBudget: body.annualBudget,
    relationshipStatus: body.relationshipStatus || 'prospect',
    focus: body.focus,
  };
  
  return NextResponse.json(newFoundation, { status: 201 });
}
