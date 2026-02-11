import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface BoardPosition {
  id: string;
  organization: string;
  role: string;
  compensation: number;
  meetingFrequency: string;
  status: 'available' | 'applied' | 'selected';
  applicationDeadline: string;
}

const mockPositions: BoardPosition[] = [
  {
    id: 'board-001',
    organization: 'Ford Foundation',
    role: 'Board Member - Technology',
    compensation: 45000,
    meetingFrequency: 'Quarterly',
    status: 'available',
    applicationDeadline: '2024-03-15',
  },
  {
    id: 'board-002',
    organization: 'TechEthics Advisory',
    role: 'Advisory Board',
    compensation: 25000,
    meetingFrequency: 'Monthly',
    status: 'applied',
    applicationDeadline: '2024-02-28',
  },
  {
    id: 'board-003',
    organization: 'AI Safety Institute',
    role: 'Governance Board',
    compensation: 35000,
    meetingFrequency: 'Bi-monthly',
    status: 'available',
    applicationDeadline: '2024-04-01',
  },
  {
    id: 'board-004',
    organization: 'Digital Rights Foundation',
    role: 'Board Director',
    compensation: 30000,
    meetingFrequency: 'Monthly',
    status: 'selected',
    applicationDeadline: '2024-02-20',
  },
  {
    id: 'board-005',
    organization: 'HealthTech Nonprofit',
    role: 'Board Member - Governance',
    compensation: 28000,
    meetingFrequency: 'Quarterly',
    status: 'available',
    applicationDeadline: '2024-03-30',
  },
];

export async function GET() {
  return NextResponse.json(mockPositions);
}

export async function POST(request: Request) {
  const body = await request.json();
  
  const newPosition: BoardPosition = {
    id: `board-${Date.now()}`,
    organization: body.organization,
    role: body.role,
    compensation: body.compensation,
    meetingFrequency: body.meetingFrequency,
    status: body.status || 'available',
    applicationDeadline: body.applicationDeadline,
  };
  
  return NextResponse.json(newPosition, { status: 201 });
}
