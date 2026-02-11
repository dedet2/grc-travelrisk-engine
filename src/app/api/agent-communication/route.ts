import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface AgentMessage {
  id: string;
  fromAgent: string;
  toAgent: string;
  message: string;
  timestamp: string;
  status: 'sent' | 'received' | 'processed';
}

const mockMessages: AgentMessage[] = [
  {
    id: 'msg-001',
    fromAgent: 'Opportunity Agent',
    toAgent: 'Campaign Agent',
    message: 'New board position available at Ford Foundation',
    timestamp: '2024-02-11T14:30:00Z',
    status: 'received',
  },
  {
    id: 'msg-002',
    fromAgent: 'Health Agent',
    toAgent: 'Calendar Agent',
    message: 'Schedule reminder: Primary care appointment on 2024-02-25',
    timestamp: '2024-02-11T13:15:00Z',
    status: 'processed',
  },
  {
    id: 'msg-003',
    fromAgent: 'Revenue Agent',
    toAgent: 'Reporting Agent',
    message: 'Weekly revenue update: AI GRC at 75% of target',
    timestamp: '2024-02-11T10:00:00Z',
    status: 'processed',
  },
  {
    id: 'msg-004',
    fromAgent: 'Speaking Agent',
    toAgent: 'Campaign Agent',
    message: 'New keynote opportunity: Financial Services AI Conference, $20K',
    timestamp: '2024-02-10T16:45:00Z',
    status: 'received',
  },
  {
    id: 'msg-005',
    fromAgent: 'Lead Agent',
    toAgent: 'CRM Agent',
    message: 'Qualified lead from TechEthics Advisory webinar',
    timestamp: '2024-02-10T15:20:00Z',
    status: 'processed',
  },
];

export async function GET() {
  return NextResponse.json(mockMessages);
}

export async function POST(request: Request) {
  const body = await request.json();
  
  const newMessage: AgentMessage = {
    id: `msg-${Date.now()}`,
    fromAgent: body.fromAgent,
    toAgent: body.toAgent,
    message: body.message,
    timestamp: new Date().toISOString(),
    status: body.status || 'sent',
  };
  
  return NextResponse.json(newMessage, { status: 201 });
}
