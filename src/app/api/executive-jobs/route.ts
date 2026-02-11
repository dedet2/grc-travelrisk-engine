import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface ExecutiveJob {
  id: string;
  title: string;
  company: string;
  compensation: number;
  location: string;
  status: 'open' | 'applied' | 'interviewing';
  matchScore: number;
  postedDate: string;
}

const mockJobs: ExecutiveJob[] = [
  {
    id: 'ceo-001',
    title: 'Chief AI Officer',
    company: 'Fortune 500 Tech',
    compensation: 350000,
    location: 'San Francisco, CA',
    status: 'open',
    matchScore: 92,
    postedDate: '2024-02-05',
  },
  {
    id: 'vp-ai-001',
    title: 'VP AI Governance',
    company: 'Global Financial Corp',
    compensation: 280000,
    location: 'New York, NY',
    status: 'applied',
    matchScore: 88,
    postedDate: '2024-02-03',
  },
  {
    id: 'director-risk-001',
    title: 'Director AI Risk',
    company: 'Regulatory Tech Startup',
    compensation: 220000,
    location: 'Boston, MA',
    status: 'open',
    matchScore: 85,
    postedDate: '2024-02-01',
  },
  {
    id: 'head-ethics-001',
    title: 'Head of AI Ethics',
    company: 'Major Tech Platform',
    compensation: 250000,
    location: 'Seattle, WA',
    status: 'interviewing',
    matchScore: 90,
    postedDate: '2024-01-28',
  },
  {
    id: 'ciso-001',
    title: 'Chief Information Security Officer',
    company: 'Healthcare Conglomerate',
    compensation: 300000,
    location: 'Chicago, IL',
    status: 'open',
    matchScore: 87,
    postedDate: '2024-01-25',
  },
];

export async function GET() {
  return NextResponse.json(mockJobs);
}

export async function POST(request: Request) {
  const body = await request.json();
  
  const newJob: ExecutiveJob = {
    id: `job-${Date.now()}`,
    title: body.title,
    company: body.company,
    compensation: body.compensation,
    location: body.location,
    status: body.status || 'open',
    matchScore: body.matchScore || 0,
    postedDate: new Date().toISOString().split('T')[0],
  };
  
  return NextResponse.json(newJob, { status: 201 });
}
