/**
 * Enhanced Audit API Routes
 * POST: Log audit entries with evidence
 * GET: Retrieve audit history and evidence
 */

import { NextRequest, NextResponse } from 'next/server';
import { enhancedAuditTrail, type EvidenceType } from '@/lib/audit/enhanced-audit';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/audit/enhanced
 * Log audit entry with optional evidence collection
 * Body: {
 *   action, userId, resourceType, resourceId, description,
 *   userEmail?, ipAddress?, severity?, complianceRelevant?,
 *   relatedRegulations?, evidence?
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const {
      action,
      userId,
      resourceType,
      resourceId,
      description,
      userEmail,
      ipAddress,
      severity,
      complianceRelevant,
      relatedRegulations,
      evidence,
    } = body;

    if (!action || !userId || !resourceType || !resourceId || !description) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const evidenceIds: string[] = [];

    if (evidence) {
      if (Array.isArray(evidence)) {
        for (const ev of evidence) {
          try {
            const createdEvidence = enhancedAuditTrail.createEvidence(
              ev.type as EvidenceType,
              ev.title,
              ev.content || '',
              userId,
              {
                description: ev.description,
                fileName: ev.fileName,
                mimeType: ev.mimeType,
                classification: ev.classification,
                relatedControl: ev.relatedControl,
                relatedFramework: ev.relatedFramework,
                tags: ev.tags,
              }
            );
            evidenceIds.push(createdEvidence.id);
          } catch (error) {
            console.error('Error creating evidence:', error);
          }
        }
      } else {
        const createdEvidence = enhancedAuditTrail.createEvidence(
          evidence.type as EvidenceType,
          evidence.title,
          evidence.content || '',
          userId,
          {
            description: evidence.description,
            fileName: evidence.fileName,
            mimeType: evidence.mimeType,
            classification: evidence.classification,
            relatedControl: evidence.relatedControl,
            relatedFramework: evidence.relatedFramework,
            tags: evidence.tags,
          }
        );
        evidenceIds.push(createdEvidence.id);
      }
    }

    const auditEntry = enhancedAuditTrail.logAuditEntry(
      action,
      userId,
      resourceType,
      resourceId,
      description,
      {
        userEmail,
        ipAddress,
        severity: severity || 'info',
        evidenceIds,
        complianceRelevant: complianceRelevant || false,
        relatedRegulations,
      }
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          auditEntryId: auditEntry.id,
          timestamp: auditEntry.timestamp,
          evidenceCollected: evidenceIds.length,
          complianceRelevant: auditEntry.complianceRelevant,
        },
        timestamp: new Date(),
      } as ApiResponse<any>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Error logging audit entry:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to log audit entry',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * GET /api/audit/enhanced
 * Retrieve audit entries and evidence
 * Query parameters:
 *   - type: entries | evidence | attestations | export
 *   - entryId?: specific entry
 *   - framework?: filter by framework
 *   - control?: filter by control
 *   - startDate?: filter by date range
 *   - endDate?: filter by date range
 *   - organization?: for export
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'entries';
    const entryId = searchParams.get('entryId');
    const framework = searchParams.get('framework');
    const control = searchParams.get('control');
    const organization = searchParams.get('organization') || 'Organization';
    const generatedBy = searchParams.get('generatedBy') || 'system';

    let data: any = null;

    if (type === 'entries') {
      if (entryId) {
        data = enhancedAuditTrail.getAuditEntry(entryId);
      } else {
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        if (startDate && endDate) {
          data = enhancedAuditTrail.getAuditEntriesByDateRange(
            new Date(startDate),
            new Date(endDate)
          );
        } else {
          data = enhancedAuditTrail.getAllAuditEntries();
        }
      }
    } else if (type === 'evidence') {
      if (framework) {
        data = enhancedAuditTrail.getEvidenceByFramework(framework);
      } else if (control) {
        data = enhancedAuditTrail.getEvidenceByControl(control);
      } else {
        data = enhancedAuditTrail.getAllEvidence();
      }
    } else if (type === 'export') {
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      const exportFramework = framework || 'SOC-2';

      if (!startDate || !endDate) {
        return NextResponse.json(
          {
            success: false,
            error: 'startDate and endDate required for export',
          } as ApiResponse<null>,
          { status: 400 }
        );
      }

      data = enhancedAuditTrail.generateExportPackage(
        exportFramework,
        new Date(startDate),
        new Date(endDate),
        generatedBy,
        organization
      );

      return NextResponse.json(
        {
          success: true,
          data: {
            export: data,
            format: 'JSON',
            readyForDownload: true,
          },
          timestamp: new Date(),
        } as ApiResponse<any>,
        { status: 200 }
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          error: 'No data found',
        } as ApiResponse<null>,
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: Array.isArray(data) ? { items: data, count: data.length } : data,
        timestamp: new Date(),
      } as ApiResponse<any>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error retrieving audit data:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve audit data',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * PUT /api/audit/enhanced
 * Record attestation or update chain of custody
 * Body: { action: 'attestation' | 'custody', ... }
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'attestation') {
      const {
        statementText,
        attestedBy,
        attestedByEmail,
        position,
        department,
        confirmsControl,
        confirmsFramework,
        witnessEmail,
      } = body;

      if (!statementText || !attestedBy || !confirmsControl || !confirmsFramework) {
        return NextResponse.json(
          {
            success: false,
            error: 'Missing required attestation fields',
          } as ApiResponse<null>,
          { status: 400 }
        );
      }

      const attestation = enhancedAuditTrail.recordAttestation(
        statementText,
        attestedBy,
        attestedByEmail,
        position,
        department,
        confirmsControl,
        confirmsFramework,
        witnessEmail
      );

      return NextResponse.json(
        {
          success: true,
          data: {
            attestationId: attestation.id,
            evidenceId: attestation.id,
            timestamp: attestation.attestationDate,
          },
          timestamp: new Date(),
        } as ApiResponse<any>,
        { status: 201 }
      );
    } else if (action === 'custody') {
      const { evidenceId, custodyAction, userId, userEmail, ipAddress, details } = body;

      if (!evidenceId || !custodyAction || !userId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Missing required custody fields',
          } as ApiResponse<null>,
          { status: 400 }
        );
      }

      const success = enhancedAuditTrail.updateChainOfCustody(
        evidenceId,
        custodyAction,
        userId,
        { userEmail, ipAddress, details }
      );

      if (!success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Evidence not found',
          } as ApiResponse<null>,
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          data: {
            evidenceId,
            action: custodyAction,
            timestamp: new Date(),
          },
          timestamp: new Date(),
        } as ApiResponse<any>,
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid action',
      } as ApiResponse<null>,
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing audit request:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process request',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
