/**
 * Document Management API Routes
 * POST: Create or upload a document
 * GET: List documents with optional filtering
 * PUT: Update a document
 */

import { createDocumentManagementAgent, type ComplianceDocument } from '@/lib/agents/document-management-agent';
import { inMemoryStore } from '@/lib/store/in-memory-store';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/documents
 * Create a new document
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { title, description, content, owner, tags, expiryDate } = body;

    if (!title || !content || !owner) {
      return Response.json(
        {
          success: false,
          error: 'Missing required fields: title, content, owner',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const agent = createDocumentManagementAgent();
    const document = await agent.createDocument(
      title,
      description || '',
      content,
      owner,
      tags || [],
      expiryDate ? new Date(expiryDate) : undefined
    );

    return Response.json(
      {
        success: true,
        data: document,
        timestamp: new Date(),
      } as ApiResponse<ComplianceDocument>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating document:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create document',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * GET /api/documents
 * List documents with optional filtering
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const tag = url.searchParams.get('tag');
    const expiring = url.searchParams.get('expiring') === 'true';
    const expired = url.searchParams.get('expired') === 'true';

    const agent = createDocumentManagementAgent();

    // Run the agent to collect and process data
    const result = await agent.run();

    if (result.status !== 'completed') {
      throw new Error(result.error || 'Failed to generate document metrics');
    }

    let documents = agent.getAllDocuments();

    if (status) {
      documents = documents.filter((d) => d.status === status);
    }

    if (tag) {
      documents = agent.getDocumentsByTag(tag);
    }

    if (expiring) {
      documents = agent.getExpiringDocuments();
    }

    if (expired) {
      documents = agent.getExpiredDocuments();
    }

    const metrics = inMemoryStore.getDocumentMetrics();

    return Response.json(
      {
        success: true,
        data: {
          documents,
          metrics,
          count: documents.length,
          agentExecutionTime: result.latencyMs,
        },
        timestamp: new Date(),
      } as ApiResponse<any>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching documents:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch documents',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * PUT /api/documents
 * Update a document
 */
export async function PUT(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { documentId, content, changes, updatedBy, status } = body;

    if (!documentId) {
      return Response.json(
        {
          success: false,
          error: 'Missing required field: documentId',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const agent = createDocumentManagementAgent();
    let document = null;

    if (content && changes && updatedBy) {
      document = await agent.updateDocument(documentId, content, changes, updatedBy);
    }

    if (status === 'approved') {
      document = await agent.approveDocument(documentId);
    }

    if (status === 'archived') {
      document = await agent.archiveDocument(documentId);
    }

    if (!document) {
      return Response.json(
        {
          success: false,
          error: 'Document not found or update failed',
        } as ApiResponse<null>,
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        data: document,
        timestamp: new Date(),
      } as ApiResponse<ComplianceDocument>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating document:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update document',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
