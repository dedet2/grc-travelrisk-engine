import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface Campaign {
  id: string;
  name: string;
  channel: string;
  reach: number;
  responses: number;
  conversion: number;
  status: 'active' | 'paused' | 'completed';
  startDate: string;
}

const mockCampaigns: Campaign[] = [
  {
    id: 'camp-001',
    name: 'AI Governance Webinar Series',
    channel: 'Email',
    reach: 5000,
    responses: 250,
    conversion: 45,
    status: 'active',
    startDate: '2024-02-01',
  },
  {
    id: 'camp-002',
    name: 'LinkedIn Thought Leadership',
    channel: 'LinkedIn',
    reach: 15000,
    responses: 650,
    conversion: 85,
    status: 'active',
    startDate: '2024-01-15',
  },
  {
    id: 'camp-003',
    name: 'AI Risk Newsletter',
    channel: 'Email',
    reach: 3200,
    responses: 450,
    conversion: 65,
    status: 'active',
    startDate: '2024-01-01',
  },
  {
    id: 'camp-004',
    name: 'Executive Roundtable Invitations',
    channel: 'Direct Mail',
    reach: 200,
    responses: 45,
    conversion: 12,
    status: 'completed',
    startDate: '2024-01-20',
  },
  {
    id: 'camp-005',
    name: 'Board Opportunities Campaign',
    channel: 'Email + LinkedIn',
    reach: 8000,
    responses: 320,
    conversion: 28,
    status: 'paused',
    startDate: '2024-02-05',
  },
];

export async function GET() {
  return NextResponse.json(mockCampaigns);
}

export async function POST(request: Request) {
  const body = await request.json();
  
  const newCampaign: Campaign = {
    id: `camp-${Date.now()}`,
    name: body.name,
    channel: body.channel,
    reach: body.reach,
    responses: body.responses,
    conversion: body.conversion,
    status: body.status || 'active',
    startDate: body.startDate || new Date().toISOString().split('T')[0],
  };
  
  return NextResponse.json(newCampaign, { status: 201 });
}
