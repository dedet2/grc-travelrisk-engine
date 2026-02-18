import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

type Format = 'video' | 'interactive' | 'assessment';
type TrainingStatus = 'active' | 'archived';

interface TrainingModule {
  id: string;
  title: string;
  category: string;
  duration: number;
  format: Format;
  status: TrainingStatus;
  completionRate: number;
  enrolledUsers: number;
  completedUsers: number;
  averageScore: number;
  lastUpdated: Date;
  dueDate?: Date;
}

interface TrainingResponse {
  modules: TrainingModule[];
  total: number;
  activeCount: number;
}

interface EnrollmentRequest {
  userId: string;
  moduleId: string;
}

const TRAINING_MODULES: TrainingModule[] = [
  {
    id: 'train-001',
    title: 'Security Awareness Basics',
    category: 'security',
    duration: 45,
    format: 'video',
    status: 'active',
    completionRate: 87,
    enrolledUsers: 250,
    completedUsers: 218,
    averageScore: 82,
    lastUpdated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'train-002',
    title: 'Phishing Prevention',
    category: 'security',
    duration: 30,
    format: 'interactive',
    status: 'active',
    completionRate: 92,
    enrolledUsers: 250,
    completedUsers: 230,
    averageScore: 88,
    lastUpdated: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'train-003',
    title: 'Data Handling & Classification',
    category: 'compliance',
    duration: 60,
    format: 'interactive',
    status: 'active',
    completionRate: 78,
    enrolledUsers: 180,
    completedUsers: 140,
    averageScore: 79,
    lastUpdated: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'train-004',
    title: 'Incident Reporting',
    category: 'security',
    duration: 25,
    format: 'video',
    status: 'active',
    completionRate: 85,
    enrolledUsers: 250,
    completedUsers: 213,
    averageScore: 81,
    lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'train-005',
    title: 'GDPR Compliance',
    category: 'compliance',
    duration: 90,
    format: 'assessment',
    status: 'active',
    completionRate: 68,
    enrolledUsers: 160,
    completedUsers: 109,
    averageScore: 76,
    lastUpdated: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'train-006',
    title: 'SOC 2 Requirements',
    category: 'compliance',
    duration: 75,
    format: 'assessment',
    status: 'active',
    completionRate: 72,
    enrolledUsers: 140,
    completedUsers: 101,
    averageScore: 80,
    lastUpdated: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'train-007',
    title: 'Remote Work Security',
    category: 'security',
    duration: 40,
    format: 'interactive',
    status: 'active',
    completionRate: 81,
    enrolledUsers: 200,
    completedUsers: 162,
    averageScore: 83,
    lastUpdated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'train-008',
    title: 'Third-Party Risk Awareness',
    category: 'compliance',
    duration: 50,
    format: 'video',
    status: 'active',
    completionRate: 76,
    enrolledUsers: 120,
    completedUsers: 91,
    averageScore: 77,
    lastUpdated: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000),
  },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const statusFilter = searchParams.get('status');
    const categoryFilter = searchParams.get('category');

    let modules = TRAINING_MODULES;

    if (statusFilter && statusFilter !== 'all') {
      modules = modules.filter(m => m.status === statusFilter);
    }

    if (categoryFilter && categoryFilter !== 'all') {
      modules = modules.filter(m => m.category === categoryFilter);
    }

    const activeCount = TRAINING_MODULES.filter(m => m.status === 'active').length;

    const response: ApiResponse<TrainingResponse> = {
      success: true,
      data: {
        modules,
        total: modules.length,
        activeCount,
      },
      timestamp: new Date(),
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch training modules';
    const response: ApiResponse<null> = {
      success: false,
      error: errorMessage,
      timestamp: new Date(),
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: EnrollmentRequest = await request.json();

    if (!body.userId || !body.moduleId) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Missing userId or moduleId',
        timestamp: new Date(),
      };
      return NextResponse.json(response, { status: 400 });
    }

    const module = TRAINING_MODULES.find(m => m.id === body.moduleId);
    if (!module) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Training module not found',
        timestamp: new Date(),
      };
      return NextResponse.json(response, { status: 404 });
    }

    const enrollmentData = {
      userId: body.userId,
      moduleId: body.moduleId,
      moduleName: module.title,
      enrolledAt: new Date(),
      dueDate: module.dueDate,
      status: 'enrolled',
    };

    const response: ApiResponse<typeof enrollmentData> = {
      success: true,
      data: enrollmentData,
      timestamp: new Date(),
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to enroll user';
    const response: ApiResponse<null> = {
      success: false,
      error: errorMessage,
      timestamp: new Date(),
    };
    return NextResponse.json(response, { status: 500 });
  }
}
