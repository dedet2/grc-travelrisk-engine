/**
 * VibeKanban Integration API Routes
 * GET: List all boards with columns and card counts
 * POST: Create or move cards
 */

import { NextResponse } from 'next/server';
import { vibeKanbanConnector } from '@/lib/integrations/vibekanban-connector';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

interface BoardResponse {
  id: string;
  name: string;
  description?: string;
  columns: Array<{
    id: string;
    name: string;
    cardCount: number;
    cards: Array<{
      id: string;
      title: string;
      description?: string;
      assignee?: string;
      priority: string;
      labels: string[];
      dueDate?: string;
      agentId?: string;
    }>;
  }>;
  lastUpdated: string;
  createdAt: string;
}

interface CardCreatePayload {
  action: 'create' | 'move' | 'update';
  boardId: string;
  columnId?: string;
  cardId?: string;
  data?: {
    title?: string;
    description?: string;
    assignee?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    labels?: string[];
    dueDate?: string;
    agentId?: string;
  };
  toColumnId?: string;
}

export async function GET(): Promise<Response> {
  try {
    const boards = vibeKanbanConnector.getBoards();

    const boardResponses: BoardResponse[] = boards.map((board) => ({
      id: board.id,
      name: board.name,
      description: board.description,
      columns: board.columns.map((column) => ({
        id: column.id,
        name: column.name,
        cardCount: column.cardCount,
        cards: column.cards.map((card) => ({
          id: card.id,
          title: card.title,
          description: card.description,
          assignee: card.assignee,
          priority: card.priority,
          labels: card.labels,
          dueDate: card.dueDate?.toISOString(),
          agentId: card.agentId,
        })),
      })),
      lastUpdated: board.lastUpdated.toISOString(),
      createdAt: board.createdAt.toISOString(),
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          boards: boardResponses,
          totalBoards: boardResponses.length,
          totalCards: boards.reduce(
            (acc, board) =>
              acc +
              board.columns.reduce((colAcc, col) => colAcc + col.cardCount, 0),
            0
          ),
        },
        timestamp: new Date(),
      } as ApiResponse<{
        boards: BoardResponse[];
        totalBoards: number;
        totalCards: number;
      }>,
      { status: 200 }
    );
  } catch (error) {
    console.error('VibeKanban GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch VibeKanban boards',
        timestamp: new Date(),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as CardCreatePayload;
    const { action, boardId, columnId, cardId, data, toColumnId } = body;

    if (!action || !boardId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: action, boardId',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const connector = vibeKanbanConnector;

    if (action === 'create') {
      if (!columnId || !data?.title) {
        return NextResponse.json(
          {
            success: false,
            error:
              'Missing required fields for create: columnId, data.title',
            timestamp: new Date(),
          } as ApiResponse<null>,
          { status: 400 }
        );
      }

      const dueDate = data.dueDate ? new Date(data.dueDate) : undefined;
      const card = connector.createCard(boardId, columnId, {
        title: data.title,
        description: data.description,
        assignee: data.assignee,
        priority: data.priority || 'medium',
        labels: data.labels || [],
        dueDate,
        agentId: data.agentId,
      });

      if (!card) {
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to create card - invalid board or column',
            timestamp: new Date(),
          } as ApiResponse<null>,
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          data: {
            card: {
              id: card.id,
              title: card.title,
              description: card.description,
              assignee: card.assignee,
              priority: card.priority,
              labels: card.labels,
              dueDate: card.dueDate?.toISOString(),
              agentId: card.agentId,
              createdAt: card.createdAt.toISOString(),
              updatedAt: card.updatedAt.toISOString(),
            },
          },
          timestamp: new Date(),
        } as ApiResponse<{
          card: Record<string, unknown>;
        }>,
        { status: 201 }
      );
    }

    if (action === 'move') {
      if (!cardId || !toColumnId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Missing required fields for move: cardId, toColumnId',
            timestamp: new Date(),
          } as ApiResponse<null>,
          { status: 400 }
        );
      }

      const success = connector.moveCard(boardId, cardId, toColumnId);

      if (!success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to move card - invalid board, card, or column',
            timestamp: new Date(),
          } as ApiResponse<null>,
          { status: 404 }
        );
      }

      const board = connector.getBoard(boardId);
      const movedCard = board?.columns
        .flatMap((col) => col.cards)
        .find((c) => c.id === cardId);

      return NextResponse.json(
        {
          success: true,
          data: {
            message: 'Card moved successfully',
            cardId,
            toColumnId,
            card: movedCard && {
              id: movedCard.id,
              title: movedCard.title,
              updatedAt: movedCard.updatedAt.toISOString(),
            },
          },
          timestamp: new Date(),
        } as ApiResponse<Record<string, unknown>>,
        { status: 200 }
      );
    }

    if (action === 'update') {
      if (!cardId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Missing required field: cardId',
            timestamp: new Date(),
          } as ApiResponse<null>,
          { status: 400 }
        );
      }

      const dueDate = data?.dueDate ? new Date(data.dueDate) : undefined;
      const updatedCard = connector.updateCard(boardId, cardId, {
        title: data?.title,
        description: data?.description,
        assignee: data?.assignee,
        priority: data?.priority,
        labels: data?.labels,
        dueDate,
        agentId: data?.agentId,
      });

      if (!updatedCard) {
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to update card - invalid board or card',
            timestamp: new Date(),
          } as ApiResponse<null>,
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          data: {
            card: {
              id: updatedCard.id,
              title: updatedCard.title,
              description: updatedCard.description,
              assignee: updatedCard.assignee,
              priority: updatedCard.priority,
              labels: updatedCard.labels,
              dueDate: updatedCard.dueDate?.toISOString(),
              agentId: updatedCard.agentId,
              updatedAt: updatedCard.updatedAt.toISOString(),
            },
          },
          timestamp: new Date(),
        } as ApiResponse<{
          card: Record<string, unknown>;
        }>,
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid action - must be create, move, or update',
        timestamp: new Date(),
      } as ApiResponse<null>,
      { status: 400 }
    );
  } catch (error) {
    console.error('VibeKanban POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process VibeKanban request',
        timestamp: new Date(),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
