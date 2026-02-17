import { NextRequest, NextResponse } from 'next/server';
import RiskScoringEngine, { RiskEntity } from '@/lib/risk/risk-scoring-engine';

const riskEngine = new RiskScoringEngine();

// Pre-scored portfolio entities (mix of IT systems, vendors, departments)
const PORTFOLIO_ENTITIES: RiskEntity[] = [
  {
    id: 'sys-001',
    name: 'Customer Data Platform',
    type: 'system',
    inherentRisk: 95,
    controlEffectiveness: 85,
    description: 'Central repository for customer PII and behavioral data',
  },
  {
    id: 'ven-001',
    name: 'Third-Party Payment Processor',
    type: 'vendor',
    inherentRisk: 88,
    controlEffectiveness: 92,
    description: 'External vendor processing credit card transactions',
  },
  {
    id: 'dept-001',
    name: 'Finance Department',
    type: 'department',
    inherentRisk: 72,
    controlEffectiveness: 88,
    description: 'Handles financial transactions and reporting',
  },
  {
    id: 'sys-002',
    name: 'Email System',
    type: 'system',
    inherentRisk: 65,
    controlEffectiveness: 78,
    description: 'Corporate email and collaboration platform',
  },
  {
    id: 'ven-002',
    name: 'Cloud Infrastructure Provider',
    type: 'vendor',
    inherentRisk: 78,
    controlEffectiveness: 82,
    description: 'Hosts critical applications and data',
  },
  {
    id: 'dept-002',
    name: 'HR Department',
    type: 'department',
    inherentRisk: 60,
    controlEffectiveness: 75,
    description: 'Manages employee records and benefits',
  },
  {
    id: 'proc-001',
    name: 'Access Control Process',
    type: 'process',
    inherentRisk: 55,
    controlEffectiveness: 80,
    description: 'User provisioning and deprovisioning procedures',
  },
  {
    id: 'data-001',
    name: 'Data Backup and Recovery',
    type: 'data',
    inherentRisk: 48,
    controlEffectiveness: 86,
    description: 'Disaster recovery and business continuity system',
  },
];

/**
 * GET /api/risk-scoring
 * Returns portfolio risk overview with 8 pre-scored entities
 */
export async function GET() {
  try {
    // Calculate portfolio risk for all entities
    const portfolioSummary = riskEngine.calculatePortfolioRisk(PORTFOLIO_ENTITIES);

    // Calculate individual risk scores for all entities
    const detailedRisks = PORTFOLIO_ENTITIES.map((entity) => riskEngine.calculateEntityRisk(entity));

    return NextResponse.json(
      {
        success: true,
        data: {
          portfolio: portfolioSummary,
          entities: detailedRisks,
          metadata: {
            entitiesCount: PORTFOLIO_ENTITIES.length,
            timestamp: new Date().toISOString(),
            riskCategories: {
              Critical: '80-100',
              High: '60-79',
              Medium: '40-59',
              Low: '20-39',
              Minimal: '0-19',
            },
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate portfolio risk',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/risk-scoring
 * Score a provided entity
 * Body: { id: string, name: string, type: string, inherentRisk: number, controlEffectiveness: number }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, type, inherentRisk, controlEffectiveness, description } = body as Partial<RiskEntity>;

    // Validate required fields
    if (!id || !name || !type) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: id, name, type',
        },
        { status: 400 }
      );
    }

    // Validate numeric fields
    if (
      inherentRisk === undefined ||
      controlEffectiveness === undefined ||
      typeof inherentRisk !== 'number' ||
      typeof controlEffectiveness !== 'number'
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing or invalid fields: inherentRisk and controlEffectiveness must be numbers 0-100',
        },
        { status: 400 }
      );
    }

    // Validate ranges
    if (inherentRisk < 0 || inherentRisk > 100 || controlEffectiveness < 0 || controlEffectiveness > 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'inherentRisk and controlEffectiveness must be between 0 and 100',
        },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ['system', 'vendor', 'department', 'process', 'data'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid type: ${type}. Valid types are: ${validTypes.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Create entity and calculate risk
    const entity: RiskEntity = {
      id,
      name,
      type: type as RiskEntity['type'],
      inherentRisk,
      controlEffectiveness,
      description,
    };

    const riskScore = riskEngine.calculateEntityRisk(entity);

    return NextResponse.json(
      {
        success: true,
        data: riskScore,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate risk score',
      },
      { status: 500 }
    );
  }
}
