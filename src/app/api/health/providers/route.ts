import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

interface HealthProvider {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  nextAppointment?: string;
}

const mockProviders: HealthProvider[] = [
  {
    id: 'prov-001',
    name: 'Dr. Sarah Mitchell',
    specialty: 'Primary Care',
    phone: '(415) 555-0101',
    email: 'sarah.mitchell@healthcenter.com',
    nextAppointment: '2024-02-25',
  },
  {
    id: 'prov-002',
    name: 'Dr. James Chen',
    specialty: 'Hematologist',
    phone: '(415) 555-0102',
    email: 'james.chen@bloodcenter.com',
    nextAppointment: '2024-03-10',
  },
  {
    id: 'prov-003',
    name: 'Dr. Patricia Lopez',
    specialty: 'Pain Management',
    phone: '(415) 555-0103',
    email: 'patricia.lopez@paincare.com',
    nextAppointment: '2024-02-28',
  },
  {
    id: 'prov-004',
    name: 'Michael Thompson, PT',
    specialty: 'Physical Therapist',
    phone: '(415) 555-0104',
    email: 'michael.thompson@physicaltherapy.com',
    nextAppointment: '2024-02-20',
  },
  {
    id: 'prov-005',
    name: 'Rebecca Davis, Esq.',
    specialty: 'Healthcare Attorney',
    phone: '(415) 555-0105',
    email: 'rebecca.davis@healthlaw.com',
  },
];

export async function GET() {
  return NextResponse.json(
    {
      success: true,
      data: mockProviders,
      timestamp: new Date(),
    } as ApiResponse<HealthProvider[]>,
    { status: 200 }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.specialty || !body.phone || !body.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: name, specialty, phone, email',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const newProvider: HealthProvider = {
      id: `prov-${Date.now()}`,
      name: body.name,
      specialty: body.specialty,
      phone: body.phone,
      email: body.email,
      nextAppointment: body.nextAppointment,
    };

    return NextResponse.json(
      {
        success: true,
        data: newProvider,
        timestamp: new Date(),
      } as ApiResponse<HealthProvider>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating health provider:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create health provider',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
