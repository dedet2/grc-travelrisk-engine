import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface RevenueStream {
  id: string;
  name: string;
  current: number;
  target: number;
  percentage: number;
}

const mockStreams: RevenueStream[] = [
  {
    id: 'rev-001',
    name: 'AI GRC Services',
    current: 450000,
    target: 600000,
    percentage: 75,
  },
  {
    id: 'rev-002',
    name: 'Executive Retreats',
    current: 85000,
    target: 150000,
    percentage: 57,
  },
  {
    id: 'rev-003',
    name: 'Board Compensation',
    current: 135000,
    target: 200000,
    percentage: 68,
  },
  {
    id: 'rev-004',
    name: 'Speaking Engagements',
    current: 58000,
    target: 120000,
    percentage: 48,
  },
  {
    id: 'rev-005',
    name: 'SaaS Platform',
    current: 22000,
    target: 100000,
    percentage: 22,
  },
];

export async function GET() {
  return NextResponse.json(mockStreams);
}

export async function POST(request: Request) {
  const body = await request.json();
  
  const newStream: RevenueStream = {
    id: `rev-${Date.now()}`,
    name: body.name,
    current: body.current,
    target: body.target,
    percentage: Math.round((body.current / body.target) * 100),
  };
  
  return NextResponse.json(newStream, { status: 201 });
}
