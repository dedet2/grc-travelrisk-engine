import { NextResponse } from 'next/server';

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
  return NextResponse.json(mockProviders);
}

export async function POST(request: Request) {
  const body = await request.json();
  
  const newProvider: HealthProvider = {
    id: `prov-${Date.now()}`,
    name: body.name,
    specialty: body.specialty,
    phone: body.phone,
    email: body.email,
    nextAppointment: body.nextAppointment,
  };
  
  return NextResponse.json(newProvider, { status: 201 });
}
