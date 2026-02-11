import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface HealthMetric {
  date: string;
  painLevel: number;
  energy: number;
  sleepQuality: number;
  medicationAdherence: number;
}

interface MetricsResponse {
  lastUpdated: string;
  metrics: HealthMetric[];
}

const mockMetrics: HealthMetric[] = [
  {
    date: '2024-02-04',
    painLevel: 3,
    energy: 7,
    sleepQuality: 6,
    medicationAdherence: 100,
  },
  {
    date: '2024-02-05',
    painLevel: 2,
    energy: 8,
    sleepQuality: 7,
    medicationAdherence: 100,
  },
  {
    date: '2024-02-06',
    painLevel: 4,
    energy: 6,
    sleepQuality: 5,
    medicationAdherence: 95,
  },
  {
    date: '2024-02-07',
    painLevel: 3,
    energy: 7,
    sleepQuality: 7,
    medicationAdherence: 100,
  },
  {
    date: '2024-02-08',
    painLevel: 2,
    energy: 8,
    sleepQuality: 8,
    medicationAdherence: 100,
  },
  {
    date: '2024-02-09',
    painLevel: 3,
    energy: 7,
    sleepQuality: 7,
    medicationAdherence: 100,
  },
  {
    date: '2024-02-10',
    painLevel: 2,
    energy: 8,
    sleepQuality: 8,
    medicationAdherence: 100,
  },
];

export async function GET() {
  return NextResponse.json({
    lastUpdated: new Date().toISOString(),
    metrics: mockMetrics,
  } as MetricsResponse);
}

export async function POST(request: Request) {
  const body = await request.json();
  
  const newMetric: HealthMetric = {
    date: body.date || new Date().toISOString().split('T')[0],
    painLevel: body.painLevel,
    energy: body.energy,
    sleepQuality: body.sleepQuality,
    medicationAdherence: body.medicationAdherence,
  };
  
  return NextResponse.json(newMetric, { status: 201 });
}
