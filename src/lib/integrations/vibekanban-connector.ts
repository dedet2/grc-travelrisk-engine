/**
 * VibeKanban Integration Connector
 * Manages project/task management boards for Claude Code agents
 */

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  labels: string[];
  dueDate?: Date;
  agentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface KanbanColumn {
  id: string;
  name: string;
  cards: KanbanCard[];
  cardCount: number;
  position: number;
}

export interface KanbanBoard {
  id: string;
  name: string;
  description?: string;
  columns: KanbanColumn[];
  lastUpdated: Date;
  createdAt: Date;
}

export interface HandoffData {
  boardId: string;
  columnId: string;
  card: Partial<KanbanCard>;
}

export class VibeKanbanConnector {
  private static instance: VibeKanbanConnector;
  private boards: Map<string, KanbanBoard> = new Map();

  private constructor() {
    this.initializeBoards();
  }

  public static getInstance(): VibeKanbanConnector {
    if (!VibeKanbanConnector.instance) {
      VibeKanbanConnector.instance = new VibeKanbanConnector();
    }
    return VibeKanbanConnector.instance;
  }

  private initializeBoards(): void {
    const now = new Date();

    this.boards.set('grc-engine-dev', {
      id: 'grc-engine-dev',
      name: 'GRC Engine Development',
      description: 'Core GRC engine feature development and improvements',
      columns: [
        {
          id: 'col-backlog-1',
          name: 'Backlog',
          position: 0,
          cards: [
            {
              id: 'card-1',
              title: 'Implement travel risk caching',
              description: 'Add Redis caching layer for travel assessments',
              assignee: 'dev-agent-01',
              priority: 'high',
              labels: ['performance', 'travel-risk'],
              dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
              agentId: 'dev-agent-01',
              createdAt: now,
              updatedAt: now,
            },
            {
              id: 'card-2',
              title: 'Refactor compliance scoring',
              description: 'Improve scoring algorithm accuracy',
              priority: 'medium',
              labels: ['refactor', 'compliance'],
              createdAt: now,
              updatedAt: now,
            },
          ],
          cardCount: 2,
        },
        {
          id: 'col-progress-1',
          name: 'In Progress',
          position: 1,
          cards: [
            {
              id: 'card-3',
              title: 'Add webhook authentication',
              description: 'Implement HMAC validation for webhooks',
              assignee: 'dev-agent-02',
              priority: 'critical',
              labels: ['security', 'webhooks'],
              dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
              agentId: 'dev-agent-02',
              createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
              updatedAt: now,
            },
          ],
          cardCount: 1,
        },
        {
          id: 'col-review-1',
          name: 'Review',
          position: 2,
          cards: [
            {
              id: 'card-4',
              title: 'Database migration v3.2',
              description: 'Schema updates for new assessment fields',
              assignee: 'dev-agent-01',
              priority: 'high',
              labels: ['database', 'migration'],
              createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
              updatedAt: now,
            },
          ],
          cardCount: 1,
        },
        {
          id: 'col-done-1',
          name: 'Done',
          position: 3,
          cards: [
            {
              id: 'card-5',
              title: 'Add audit logging',
              description: 'Complete audit trail for all GRC operations',
              assignee: 'dev-agent-01',
              priority: 'high',
              labels: ['audit', 'logging'],
              createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
              updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
            },
          ],
          cardCount: 1,
        },
      ],
      lastUpdated: now,
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    });

    this.boards.set('agent-operations', {
      id: 'agent-operations',
      name: 'Agent Operations',
      description: 'Agent execution and orchestration tasks',
      columns: [
        {
          id: 'col-queued-1',
          name: 'Queued',
          position: 0,
          cards: [
            {
              id: 'card-6',
              title: 'Process compliance batch #42',
              description: 'Check 50 policies for compliance gaps',
              assignee: 'compliance-checker-a01',
              priority: 'normal',
              labels: ['compliance', 'batch'],
              dueDate: new Date(now.getTime() + 4 * 60 * 60 * 1000),
              agentId: 'compliance-checker-a01',
              createdAt: now,
              updatedAt: now,
            },
            {
              id: 'card-7',
              title: 'Generate risk report for Q1',
              assignee: 'reporting-agent-b01',
              priority: 'high',
              labels: ['reporting', 'risk'],
              dueDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
              agentId: 'reporting-agent-b01',
              createdAt: now,
              updatedAt: now,
            },
          ],
          cardCount: 2,
        },
        {
          id: 'col-running-1',
          name: 'Running',
          position: 1,
          cards: [
            {
              id: 'card-8',
              title: 'Assess travel request #2847',
              description: 'Risk assessment for Japan trip',
              assignee: 'travel-risk-a02',
              priority: 'high',
              labels: ['travel', 'assessment'],
              agentId: 'travel-risk-a02',
              createdAt: new Date(now.getTime() - 15 * 60 * 1000),
              updatedAt: now,
            },
          ],
          cardCount: 1,
        },
        {
          id: 'col-completed-1',
          name: 'Completed',
          position: 2,
          cards: [
            {
              id: 'card-9',
              title: 'Send alert for high-risk users',
              assignee: 'notification-agent-c01',
              priority: 'critical',
              labels: ['notification', 'alert'],
              createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
              updatedAt: new Date(now.getTime() - 30 * 60 * 1000),
            },
          ],
          cardCount: 1,
        },
        {
          id: 'col-failed-1',
          name: 'Failed',
          position: 3,
          cards: [],
          cardCount: 0,
        },
      ],
      lastUpdated: now,
      createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
    });

    this.boards.set('compliance-tracking', {
      id: 'compliance-tracking',
      name: 'Compliance Tracking',
      description: 'Regulatory compliance and control monitoring',
      columns: [
        {
          id: 'col-nostart-1',
          name: 'Not Started',
          position: 0,
          cards: [
            {
              id: 'card-10',
              title: 'SOC 2 Type II audit',
              description: 'Annual SOC 2 Type II assessment',
              priority: 'high',
              labels: ['audit', 'soc2'],
              dueDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
              createdAt: now,
              updatedAt: now,
            },
          ],
          cardCount: 1,
        },
        {
          id: 'col-inprog-1',
          name: 'In Progress',
          position: 1,
          cards: [
            {
              id: 'card-11',
              title: 'GDPR data processing audit',
              description: 'Verify data processing compliance',
              assignee: 'compliance-checker-a01',
              priority: 'critical',
              labels: ['gdpr', 'privacy'],
              dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
              agentId: 'compliance-checker-a01',
              createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
              updatedAt: now,
            },
          ],
          cardCount: 1,
        },
        {
          id: 'col-review-2',
          name: 'Under Review',
          position: 2,
          cards: [
            {
              id: 'card-12',
              title: 'ISO 27001 documentation',
              description: 'Complete ISO 27001 control documentation',
              assignee: 'doc-agent-d01',
              priority: 'high',
              labels: ['iso27001', 'documentation'],
              createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
              updatedAt: now,
            },
          ],
          cardCount: 1,
        },
        {
          id: 'col-compliant-1',
          name: 'Compliant',
          position: 3,
          cards: [
            {
              id: 'card-13',
              title: 'HIPAA compliance check',
              description: 'Annual HIPAA compliance verification',
              assignee: 'compliance-checker-a01',
              priority: 'high',
              labels: ['hipaa', 'healthcare'],
              createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
              updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
            },
          ],
          cardCount: 1,
        },
      ],
      lastUpdated: now,
      createdAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
    });

    this.boards.set('sales-pipeline', {
      id: 'sales-pipeline',
      name: 'Sales Pipeline',
      description: 'Customer acquisition and sales opportunities',
      columns: [
        {
          id: 'col-prospect-1',
          name: 'Prospect',
          position: 0,
          cards: [
            {
              id: 'card-14',
              title: 'Acme Corp - Inbound lead',
              description: 'Initial contact from marketing event',
              priority: 'medium',
              labels: ['new', 'inbound'],
              dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
              createdAt: now,
              updatedAt: now,
            },
            {
              id: 'card-15',
              title: 'TechStart Inc - Warm intro',
              description: 'Referred by existing customer',
              priority: 'high',
              labels: ['referral'],
              createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
              updatedAt: now,
            },
          ],
          cardCount: 2,
        },
        {
          id: 'col-qualified-1',
          name: 'Qualified',
          position: 1,
          cards: [
            {
              id: 'card-16',
              title: 'GlobalCorp - Initial demo completed',
              description: 'Positive response, scheduling follow-up',
              priority: 'high',
              labels: ['demo', 'qualified'],
              dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
              createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
              updatedAt: now,
            },
          ],
          cardCount: 1,
        },
        {
          id: 'col-proposal-1',
          name: 'Proposal',
          position: 2,
          cards: [
            {
              id: 'card-17',
              title: 'Enterprise Solutions LLC - Custom proposal',
              description: 'Sent tailored proposal, awaiting feedback',
              priority: 'high',
              labels: ['proposal', 'enterprise'],
              dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
              createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
              updatedAt: now,
            },
          ],
          cardCount: 1,
        },
        {
          id: 'col-negotiation-1',
          name: 'Negotiation',
          position: 3,
          cards: [
            {
              id: 'card-18',
              title: 'DataFlow Partners - Contract negotiation',
              description: 'Legal review in progress',
              priority: 'critical',
              labels: ['negotiation', 'contract'],
              dueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
              createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
              updatedAt: now,
            },
          ],
          cardCount: 1,
        },
        {
          id: 'col-won-1',
          name: 'Closed Won',
          position: 4,
          cards: [
            {
              id: 'card-19',
              title: 'SecureNet Corp - Enterprise license',
              description: 'Contract signed, onboarding scheduled',
              priority: 'high',
              labels: ['closed', 'enterprise'],
              createdAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
              updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
            },
          ],
          cardCount: 1,
        },
        {
          id: 'col-lost-1',
          name: 'Closed Lost',
          position: 5,
          cards: [
            {
              id: 'card-20',
              title: 'OldTech Industries - Budget cut',
              description: 'Opportunity lost due to budget constraints',
              priority: 'low',
              labels: ['lost', 'budget'],
              createdAt: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000),
              updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
            },
          ],
          cardCount: 1,
        },
      ],
      lastUpdated: now,
      createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
    });
  }

  public getBoards(): KanbanBoard[] {
    return Array.from(this.boards.values());
  }

  public getBoard(boardId: string): KanbanBoard | undefined {
    return this.boards.get(boardId);
  }

  public createCard(
    boardId: string,
    columnId: string,
    card: Partial<KanbanCard>
  ): KanbanCard | null {
    const board = this.boards.get(boardId);
    if (!board) return null;

    const column = board.columns.find((c) => c.id === columnId);
    if (!column) return null;

    const newCard: KanbanCard = {
      id: `card-${Date.now()}`,
      title: card.title || 'Untitled',
      description: card.description,
      assignee: card.assignee,
      priority: card.priority || 'medium',
      labels: card.labels || [],
      dueDate: card.dueDate,
      agentId: card.agentId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    column.cards.push(newCard);
    column.cardCount = column.cards.length;
    board.lastUpdated = new Date();

    return newCard;
  }

  public moveCard(boardId: string, cardId: string, toColumnId: string): boolean {
    const board = this.boards.get(boardId);
    if (!board) return false;

    let card: KanbanCard | null = null;
    const fromColumn = board.columns.find((c) => {
      card = c.cards.find((card) => card.id === cardId) || null;
      return card !== null;
    });

    if (!fromColumn || !card) return false;

    const toColumn = board.columns.find((c) => c.id === toColumnId);
    if (!toColumn) return false;

    fromColumn.cards = fromColumn.cards.filter((c) => c.id !== cardId);
    fromColumn.cardCount = fromColumn.cards.length;

    card.updatedAt = new Date();
    toColumn.cards.push(card);
    toColumn.cardCount = toColumn.cards.length;

    board.lastUpdated = new Date();
    return true;
  }

  public updateCard(
    boardId: string,
    cardId: string,
    updates: Partial<KanbanCard>
  ): KanbanCard | null {
    const board = this.boards.get(boardId);
    if (!board) return null;

    for (const column of board.columns) {
      const card = column.cards.find((c) => c.id === cardId);
      if (card) {
        Object.assign(card, updates, { updatedAt: new Date() });
        board.lastUpdated = new Date();
        return card;
      }
    }

    return null;
  }

  public getAgentTasks(agentId: string): KanbanCard[] {
    const tasks: KanbanCard[] = [];

    for (const board of this.boards.values()) {
      for (const column of board.columns) {
        tasks.push(
          ...column.cards.filter(
            (card) =>
              card.agentId === agentId || card.assignee === agentId
          )
        );
      }
    }

    return tasks;
  }

  public syncWithAgentOrchestrator(): {
    timestamp: Date;
    boardsCount: number;
    totalCards: number;
    agentTaskCounts: Record<string, number>;
  } {
    const agentTaskCounts: Record<string, number> = {};
    let totalCards = 0;

    for (const board of this.boards.values()) {
      for (const column of board.columns) {
        totalCards += column.cards.length;
        for (const card of column.cards) {
          if (card.agentId) {
            agentTaskCounts[card.agentId] =
              (agentTaskCounts[card.agentId] || 0) + 1;
          }
        }
      }
    }

    return {
      timestamp: new Date(),
      boardsCount: this.boards.size,
      totalCards,
      agentTaskCounts,
    };
  }
}

export const vibeKanbanConnector = VibeKanbanConnector.getInstance();
