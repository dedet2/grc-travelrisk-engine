/**
 * Enhanced Scoring API Endpoint
 * Integrates Risk Scoring Agent (A-02) for on-demand risk assessment
 * Supports both POST (run scoring) and GET (retrieve results) operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { RiskScoringAgent } from '@/lib/agents/risk-scoring-agent';
import { inMemoryStore } from '@/lib/store/in-memory-store';
import { calculateRiskScore, calculateAssessmentMetrics } from '@/lib/scoring/engine';
import type { ApiResponse } from '@/types';
import type { ControlScore, ScoringInput } from '@/lib/scoring/types';

/**
 * POST /api/scoring
 * Run risk scoring on assessment data
 *
 * Request body:
 * {
 *   "assessmentId": "string",
 *   "controls": [
 *     {
 *       "controlId": "A.5.1",
 *       "category": "Organizational",
 *       "response": "implemented" | "partially-implemented" | "not-implemented",
 *       "evidence": "optional string"
 *     }
 *   ]
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { assessmentId, controls } = body;

    // Validate required fields
    if (!assessmentId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: assessmentId',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    if (!controls || !Array.isArray(controls) || controls.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: controls (must be non-empty array)',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Validate control objects
    const validatedControls: ControlScore[] = controls.map((control: any) => {
      if (!control.controlId || !control.category || !control.response) {
        throw new Error(
          `Invalid control: missing controlId, category, or response. Received: ${JSON.stringify(control)}`
        );
      }

      const validResponses = ['implemented', 'partially-implemented', 'not-implemented'];
      if (!validResponses.includes(control.response)) {
        throw new Error(
          `Invalid response value: ${control.response}. Must be one of: ${validResponses.join(', ')}`
        );
      }

      return {
        controlId: control.controlId,
        controlIdStr: control.controlId,
        title: control.title || control.controlId,
        response: control.response as 'implemented' | 'partially-implemented' | 'not-implemented',
        score: control.score ?? scoreFromResponse(control.response),
        category: control.category,
        weight: control.weight ?? 1,
      };
    });

    // Build scoring input
    const scoringInput: ScoringInput = {
      assessmentId,
      frameworkId: body.frameworkId || 'iso-27001',
      controls: validatedControls,
    };

    // Run scoring engine
    const scoringOutput = calculateRiskScore(scoringInput);
    const metrics = calculateAssessmentMetrics(scoringOutput.categoryScores);

    // Generate recommendations (rule-based, no API call)
    const recommendations = generateRecommendations(scoringOutput.categoryScores);

    // Store results in in-memory store
    inMemoryStore.storeScoringResult(scoringOutput, validatedControls);

    // Build response
    const responseData = {
      assessmentId,
      overallScore: scoringOutput.overallScore,
      riskLevel: scoringOutput.riskLevel,
      categoryScores: scoringOutput.categoryScores,
      compliancePercentage: metrics.compliancePercentage,
      recommendations,
      metrics: {
        totalControls: metrics.totalControls,
        implementedControls: metrics.implementedControls,
        compliancePercentage: metrics.compliancePercentage,
      },
      timestamp: scoringOutput.timestamp,
    };

    return NextResponse.json(
      {
        success: true,
        data: responseData,
        timestamp: new Date(),
      } as ApiResponse<typeof responseData>,
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[Scoring API] Error calculating risk score:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: `Failed to calculate risk score: ${errorMessage}`,
      } as ApiResponse<null>,
      { status: 400 }
    );
  }
}

/**
 * GET /api/scoring
 * Retrieve the last scoring run results
 * Optional query parameter: assessmentId (to get specific assessment results)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get('assessmentId');

    let result;

    if (assessmentId) {
      // Get specific assessment result
      result = inMemoryStore.getScoringResult(assessmentId);

      if (!result) {
        return NextResponse.json(
          {
            success: false,
            error: `No scoring result found for assessment: ${assessmentId}`,
          } as ApiResponse<null>,
          { status: 404 }
        );
      }
    } else {
      // Get last scoring result
      result = inMemoryStore.getLastScoringResult();

      if (!result) {
        return NextResponse.json(
          {
            success: false,
            error: 'No scoring results available',
          } as ApiResponse<null>,
          { status: 404 }
        );
      }
    }

    // Build response from stored result
    const metrics = calculateAssessmentMetrics(result.result.categoryScores);
    const recommendations = generateRecommendations(result.result.categoryScores);

    const responseData = {
      assessmentId: result.result.assessmentId,
      overallScore: result.result.overallScore,
      riskLevel: result.result.riskLevel,
      categoryScores: result.result.categoryScores,
      compliancePercentage: metrics.compliancePercentage,
      recommendations,
      metrics: {
        totalControls: metrics.totalControls,
        implementedControls: metrics.implementedControls,
        compliancePercentage: metrics.compliancePercentage,
      },
      timestamp: result.result.timestamp,
      storedAt: result.storedAt,
    };

    return NextResponse.json(
      {
        success: true,
        data: responseData,
        timestamp: new Date(),
      } as ApiResponse<typeof responseData>,
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[Scoring API] Error retrieving scoring results:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: `Failed to retrieve scoring results: ${errorMessage}`,
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * Convert response type to score (0-100 scale)
 * implemented = 0, partially-implemented = 50, not-implemented = 100
 */
function scoreFromResponse(response: string): number {
  switch (response) {
    case 'implemented':
      return 0;
    case 'partially-implemented':
      return 50;
    case 'not-implemented':
      return 100;
    default:
      return 50;
  }
}

/**
 * Generate actionable recommendations based on category scores
 * Maps weak categories to specific recommendations
 */
function generateRecommendations(categoryScores: any[]): string[] {
  const recommendations: string[] = [];
  const weakCategories = categoryScores.filter((c) => c.score > 50).sort((a, b) => b.score - a.score);

  for (const category of weakCategories.slice(0, 3)) {
    switch (category.category) {
      case 'Access Control':
        if (category.score > 50) {
          recommendations.push(
            'Implement Multi-Factor Authentication (MFA) across all systems',
            'Conduct Role-Based Access Control (RBAC) review and update privilege levels',
            'Establish quarterly access review and recertification process'
          );
        }
        break;

      case 'Cryptography':
        if (category.score > 50) {
          recommendations.push(
            'Conduct encryption audit for data at rest and in transit',
            'Implement TLS 1.2+ for all network communications',
            'Establish cryptographic key management and rotation procedures'
          );
        }
        break;

      case 'Physical Security':
        if (category.score > 50) {
          recommendations.push(
            'Conduct facility assessment and install access controls',
            'Deploy CCTV monitoring in data centers and server rooms',
            'Implement environmental monitoring (temperature, humidity) systems'
          );
        }
        break;

      case 'Incident Management':
        if (category.score > 50) {
          recommendations.push(
            'Develop and document incident response procedures',
            'Establish incident response team with defined roles',
            'Conduct quarterly incident response drills and tabletop exercises'
          );
        }
        break;

      case 'Business Continuity':
        if (category.score > 50) {
          recommendations.push(
            'Conduct business impact analysis (BIA) and define RTO/RPO',
            'Develop comprehensive disaster recovery plan (DRP)',
            'Test backup and recovery procedures quarterly'
          );
        }
        break;

      case 'Asset Management':
        if (category.score > 50) {
          recommendations.push(
            'Create and maintain complete IT asset inventory',
            'Implement asset tracking system with unique identifiers',
            'Establish asset disposal and end-of-life management procedures'
          );
        }
        break;

      case 'Operations':
        if (category.score > 50) {
          recommendations.push(
            'Establish configuration management baselines',
            'Implement patch management program with defined schedules',
            'Deploy vulnerability management and scanning tools'
          );
        }
        break;

      case 'Risk Assessment':
        if (category.score > 50) {
          recommendations.push(
            'Conduct comprehensive risk assessment across all business areas',
            'Develop risk register with identified threats and mitigations',
            'Establish risk monitoring and review procedures'
          );
        }
        break;

      case 'Compliance':
        if (category.score > 50) {
          recommendations.push(
            'Map controls to applicable regulations and standards',
            'Conduct compliance gap assessment',
            'Develop and track remediation plan for identified gaps'
          );
        }
        break;
    }
  }

  // Remove duplicates
  return [...new Set(recommendations)];
}
