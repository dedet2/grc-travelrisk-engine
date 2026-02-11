import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface SpeakingEvent {
  id: string;
  eventName: string;
  date: string;
  fee: number;
  audienceSize: number;
  eventType: string;
  location: string;
  status: 'inquiry' | 'confirmed' | 'completed';
}

const mockEvents: SpeakingEvent[] = [
  {
    id: 'speak-001',
    eventName: 'AI Risk Management Summit',
    date: '2024-03-15',
    fee: 15000,
    audienceSize: 500,
    eventType: 'Conference',
    location: 'San Francisco, CA',
    status: 'confirmed',
  },
  {
    id: 'speak-002',
    eventName: 'Tech Policy Forum',
    date: '2024-04-20',
    fee: 10000,
    audienceSize: 250,
    eventType: 'Panel Discussion',
    location: 'Washington, DC',
    status: 'inquiry',
  },
  {
    id: 'speak-003',
    eventName: 'Corporate Governance Webinar',
    date: '2024-05-10',
    fee: 5000,
    audienceSize: 300,
    eventType: 'Webinar',
    location: 'Virtual',
    status: 'confirmed',
  },
  {
    id: 'speak-004',
    eventName: 'Ethics in AI Roundtable',
    date: '2024-06-05',
    fee: 8000,
    audienceSize: 100,
    eventType: 'Workshop',
    location: 'Boston, MA',
    status: 'inquiry',
  },
  {
    id: 'speak-005',
    eventName: 'Financial Services AI Conference',
    date: '2024-07-12',
    fee: 20000,
    audienceSize: 800,
    eventType: 'Keynote',
    location: 'New York, NY',
    status: 'confirmed',
  },
];

export async function GET() {
  return NextResponse.json(mockEvents);
}

export async function POST(request: Request) {
  const body = await request.json();
  
  const newEvent: SpeakingEvent = {
    id: `speak-${Date.now()}`,
    eventName: body.eventName,
    date: body.date,
    fee: body.fee,
    audienceSize: body.audienceSize,
    eventType: body.eventType,
    location: body.location,
    status: body.status || 'inquiry',
  };
  
  return NextResponse.json(newEvent, { status: 201 });
}
