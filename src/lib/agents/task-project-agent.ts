/**
 * Task & Project Tracking Agent (B-05)
 * Creates and manages project tasks, tracks sprint progress, and generates reports
 * Lifecycle: collectData → processData → updateDashboard
 */

import { BaseAgent, type AgentConfig } from './base-agent';
import { supabaseStore } from '@/lib/store'; // Uses Supabase with in-memory fallback

export interface ProjectTask {
  taskId: string;
  projectId: string;
  title: string;
  description: string;
  assignee: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'backlog' | 'todo' | 'in-progress' | 'review' | 'completed' | 'blocked';
  dueDate: Date;
  estimatedHours: number;
  actualHours: number;
  sprintId?: string;
  tags: string[];
  dependencies: string[]; // Task IDs this task depends on
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface Project {
  projectId: string;
  name: string;
  description: string;
  owner: string;
  startDate: Date;
  endDate: Date;
  status: 'planning' | 'active' | 'on-hold' | 'completed';
  tasks: ProjectTask[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Sprint {
  sprintId: string;
  projectId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  goals: string[];
  status: 'planned' | 'active' | 'completed';
  tasks: ProjectTask[];
}

export interface TaskRawData {
  projects: Project[];
  sprints: Sprint[];
  tasks: ProjectTask[];
}

export interface SprintMetrics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  completionRate: number;
  velocityPoints: number;
  burnDownData: { day: number; remainingPoints: number }[];
}

export interface StatusReport {
  reportDate: Date;
  projectId: string;
  projectName: string;
  sprintId?: string;
  sprintName?: string;
  overallProgress: number; // 0-100
  tasksCompleted: number;
  tasksInProgress: number;
  taskBlocked: number;
  upcomingDeadlines: ProjectTask[];
  risks: string[];
  recommendations: string[];
  sprintMetrics?: SprintMetrics;
}

export interface ProcessedData {
  activeProjects: Project[];
  activeSprints: Sprint[];
  statusReports: StatusReport[];
  timestamp: Date;
}

/**
 * Task & Project Tracking Agent
 * Handles project management, task tracking, and progress reporting
 */
export class TaskProjectAgent extends BaseAgent<TaskRawData, ProcessedData> {
  private projects: Map<string, Project> = new Map();
  private sprints: Map<string, Sprint> = new Map();
  private tasks: Map<string, ProjectTask> = new Map();

  constructor(config?: Partial<AgentConfig>) {
    super({
      name: 'Task & Project Tracking Agent (B-05)',
      description: 'Creates and manages project tasks with sprint tracking and reporting',
      maxRetries: 2,
      timeoutMs: 30000,
      enabled: true,
      ...config,
    });

    this.initializeMockData();
  }

  private initializeMockData(): void {
    const now = new Date();
    const sprintStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sprintEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const projectEnd = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    // Initialize sprint
    const sprint: Sprint = {
      sprintId: 'sprint-001',
      projectId: 'proj-001',
      name: 'Sprint 2024-01',
      startDate: sprintStart,
      endDate: sprintEnd,
      goals: [
        'Complete user authentication module',
        'Implement document upload feature',
        'Improve API performance',
      ],
      status: 'active',
      tasks: [],
    };

    // Initialize project
    const project: Project = {
      projectId: 'proj-001',
      name: 'GRC & TravelRisk Engine',
      description: 'Enterprise governance and risk compliance platform with travel risk assessment',
      owner: 'Project Management Office',
      startDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      endDate: projectEnd,
      status: 'active',
      tasks: [],
      createdAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      updatedAt: now,
    };

    // Initialize tasks
    const tasks: ProjectTask[] = [
      {
        taskId: 'task-001',
        projectId: 'proj-001',
        title: 'Implement user authentication',
        description: 'Add OAuth2 and MFA support',
        assignee: 'Alice Johnson',
        priority: 'high',
        status: 'completed',
        dueDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        estimatedHours: 16,
        actualHours: 18,
        sprintId: 'sprint-001',
        tags: ['backend', 'security'],
        dependencies: [],
        createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        completedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        taskId: 'task-002',
        projectId: 'proj-001',
        title: 'Document upload and processing',
        description: 'Implement file upload API and validation',
        assignee: 'Bob Smith',
        priority: 'high',
        status: 'in-progress',
        dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        estimatedHours: 20,
        actualHours: 12,
        sprintId: 'sprint-001',
        tags: ['api', 'file-handling'],
        dependencies: ['task-001'],
        createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        updatedAt: now,
      },
      {
        taskId: 'task-003',
        projectId: 'proj-001',
        title: 'API performance optimization',
        description: 'Optimize query performance and add caching',
        assignee: 'Carol Davis',
        priority: 'medium',
        status: 'todo',
        dueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        estimatedHours: 24,
        actualHours: 0,
        sprintId: 'sprint-001',
        tags: ['performance', 'backend'],
        dependencies: [],
        createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        updatedAt: now,
      },
      {
        taskId: 'task-004',
        projectId: 'proj-001',
        title: 'Implement email notifications',
        description: 'Add email alerting for document expiry',
        assignee: 'David Wilson',
        priority: 'medium',
        status: 'blocked',
        dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        estimatedHours: 12,
        actualHours: 4,
        sprintId: 'sprint-001',
        tags: ['notifications', 'email'],
        dependencies: ['task-002'],
        createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        taskId: 'task-005',
        projectId: 'proj-001',
        title: 'Create dashboard widgets',
        description: 'Build risk score and metrics visualizations',
        assignee: 'Emma Taylor',
        priority: 'low',
        status: 'backlog',
        dueDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
        estimatedHours: 16,
        actualHours: 0,
        tags: ['frontend', 'ui'],
        dependencies: [],
        createdAt: now,
        updatedAt: now,
      },
    ];

    // Store data in maps
    for (const task of tasks) {
      this.tasks.set(task.taskId, task);
      project.tasks.push(task);
      if (task.sprintId) {
        sprint.tasks.push(task);
      }
    }

    this.projects.set(project.projectId, project);
    this.sprints.set(sprint.sprintId, sprint);
  }

  /**
   * Collect project and task data
   */
  async collectData(): Promise<TaskRawData> {
    // Simulate data collection delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      projects: Array.from(this.projects.values()),
      sprints: Array.from(this.sprints.values()),
      tasks: Array.from(this.tasks.values()),
    };
  }

  /**
   * Process data to generate status reports and metrics
   */
  async processData(rawData: TaskRawData): Promise<ProcessedData> {
    const { projects, sprints, tasks } = rawData;

    // Filter active projects and sprints
    const activeProjects = projects.filter((p) => p.status === 'active');
    const activeSprints = sprints.filter((s) => s.status === 'active');

    // Generate status reports
    const statusReports: StatusReport[] = [];
    for (const project of activeProjects) {
      const projectTasks = tasks.filter((t) => t.projectId === project.projectId);
      const sprintReports = activeSprints
        .filter((s) => s.projectId === project.projectId)
        .map((sprint) => {
          const sprintTasks = projectTasks.filter((t) => t.sprintId === sprint.sprintId);
          const metrics = this.calculateSprintMetrics(sprintTasks);
          return this.generateSprintReport(project, sprint, sprintTasks, metrics);
        });

      statusReports.push(...sprintReports);

      // Generate overall project report
      const metrics = this.calculateProjectMetrics(projectTasks);
      const report = this.generateProjectReport(project, projectTasks);
      statusReports.push(report);
    }

    return {
      activeProjects,
      activeSprints,
      statusReports,
      timestamp: new Date(),
    };
  }

  /**
   * Store processed data in the data store
   */
  async updateDashboard(processedData: ProcessedData): Promise<void> {
    // Store tasks and projects
    supabaseStore.storeProjects(Array.from(this.projects.values()));
    supabaseStore.storeTasks(Array.from(this.tasks.values()));
    supabaseStore.storeStatusReports(processedData.statusReports);

    // Simulate dashboard update delay
    await new Promise((resolve) => setTimeout(resolve, 50));

    console.log('[TaskProjectAgent] Dashboard updated with task and project metrics');
  }

  /**
   * Calculate sprint metrics
   */
  private calculateSprintMetrics(sprintTasks: ProjectTask[]): SprintMetrics {
    const completedTasks = sprintTasks.filter((t) => t.status === 'completed').length;
    const inProgressTasks = sprintTasks.filter((t) => t.status === 'in-progress').length;
    const blockedTasks = sprintTasks.filter((t) => t.status === 'blocked').length;

    const totalTasks = sprintTasks.length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Estimate velocity in story points (using estimated hours as proxy)
    const velocityPoints = sprintTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      blockedTasks,
      completionRate,
      velocityPoints,
      burnDownData: [
        { day: 1, remainingPoints: velocityPoints },
        { day: 7, remainingPoints: Math.round(velocityPoints * 0.5) },
        { day: 14, remainingPoints: 0 },
      ],
    };
  }

  /**
   * Calculate project metrics
   */
  private calculateProjectMetrics(
    projectTasks: ProjectTask[]
  ): { completedCount: number; inProgressCount: number; blockedCount: number } {
    return {
      completedCount: projectTasks.filter((t) => t.status === 'completed').length,
      inProgressCount: projectTasks.filter((t) => t.status === 'in-progress').length,
      blockedCount: projectTasks.filter((t) => t.status === 'blocked').length,
    };
  }

  /**
   * Generate sprint report
   */
  private generateSprintReport(
    project: Project,
    sprint: Sprint,
    sprintTasks: ProjectTask[],
    metrics: SprintMetrics
  ): StatusReport {
    const now = new Date();
    const upcomingDeadlines = sprintTasks
      .filter((t) => t.status !== 'completed' && t.dueDate > now && t.dueDate < new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000))
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

    const blockedTasks = sprintTasks.filter((t) => t.status === 'blocked');
    const risks = blockedTasks.map((t) => `Task "${t.title}" is blocked - depends on ${t.dependencies.join(', ')}`);

    const recommendations: string[] = [];
    if (metrics.completionRate < 50) {
      recommendations.push('Sprint is behind schedule - consider prioritizing remaining high-priority tasks');
    }
    if (blockedTasks.length > 0) {
      recommendations.push(`${blockedTasks.length} task(s) blocked - address dependencies urgently`);
    }

    return {
      reportDate: now,
      projectId: project.projectId,
      projectName: project.name,
      sprintId: sprint.sprintId,
      sprintName: sprint.name,
      overallProgress: metrics.completionRate,
      tasksCompleted: metrics.completedTasks,
      tasksInProgress: metrics.inProgressTasks,
      taskBlocked: metrics.blockedTasks,
      upcomingDeadlines,
      risks,
      recommendations,
      sprintMetrics: metrics,
    };
  }

  /**
   * Generate project report
   */
  private generateProjectReport(project: Project, projectTasks: ProjectTask[]): StatusReport {
    const now = new Date();
    const completedTasks = projectTasks.filter((t) => t.status === 'completed');
    const overallProgress = projectTasks.length > 0 ? Math.round((completedTasks.length / projectTasks.length) * 100) : 0;

    const upcomingDeadlines = projectTasks
      .filter((t) => t.status !== 'completed' && t.dueDate > now && t.dueDate < new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000))
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

    const blockedTasks = projectTasks.filter((t) => t.status === 'blocked');
    const risks = blockedTasks.map((t) => `Task "${t.title}" is blocked`);

    const recommendations: string[] = [];
    if (overallProgress < 25) {
      recommendations.push('Project is in early stages - focus on completing foundational tasks');
    }
    if (blockedTasks.length > 0) {
      recommendations.push(`Unblock ${blockedTasks.length} task(s) to maintain momentum`);
    }

    return {
      reportDate: now,
      projectId: project.projectId,
      projectName: project.name,
      overallProgress,
      tasksCompleted: completedTasks.length,
      tasksInProgress: projectTasks.filter((t) => t.status === 'in-progress').length,
      taskBlocked: blockedTasks.length,
      upcomingDeadlines,
      risks,
      recommendations,
    };
  }

  /**
   * Create a task
   */
  async createTask(
    projectId: string,
    title: string,
    description: string,
    assignee: string,
    estimatedHours: number,
    dueDate: Date,
    priority: ProjectTask['priority'] = 'medium'
  ): Promise<ProjectTask> {
    const now = new Date();
    const taskId = `task-${Date.now()}`;

    const task: ProjectTask = {
      taskId,
      projectId,
      title,
      description,
      assignee,
      priority,
      status: 'backlog',
      dueDate,
      estimatedHours,
      actualHours: 0,
      tags: [],
      dependencies: [],
      createdAt: now,
      updatedAt: now,
    };

    this.tasks.set(taskId, task);

    // Add to project
    const project = this.projects.get(projectId);
    if (project) {
      project.tasks.push(task);
      project.updatedAt = now;
    }

    supabaseStore.storeTasks(Array.from(this.tasks.values()));

    return task;
  }

  /**
   * Update task status
   */
  async updateTaskStatus(taskId: string, status: ProjectTask['status']): Promise<ProjectTask | null> {
    const task = this.tasks.get(taskId);
    if (!task) {
      return null;
    }

    const now = new Date();
    task.status = status;
    task.updatedAt = now;

    if (status === 'completed') {
      task.completedAt = now;
    }

    this.tasks.set(taskId, task);
    supabaseStore.storeTasks(Array.from(this.tasks.values()));

    return task;
  }

  /**
   * Assign task to user
   */
  async assignTask(taskId: string, assignee: string): Promise<ProjectTask | null> {
    const task = this.tasks.get(taskId);
    if (!task) {
      return null;
    }

    task.assignee = assignee;
    task.updatedAt = new Date();

    this.tasks.set(taskId, task);
    supabaseStore.storeTasks(Array.from(this.tasks.values()));

    return task;
  }

  /**
   * Log hours to a task
   */
  async logHours(taskId: string, hours: number): Promise<ProjectTask | null> {
    const task = this.tasks.get(taskId);
    if (!task) {
      return null;
    }

    task.actualHours += hours;
    task.updatedAt = new Date();

    this.tasks.set(taskId, task);
    supabaseStore.storeTasks(Array.from(this.tasks.values()));

    return task;
  }

  /**
   * Get all tasks for a project
   */
  getProjectTasks(projectId: string): ProjectTask[] {
    return Array.from(this.tasks.values()).filter((t) => t.projectId === projectId);
  }

  /**
   * Get tasks by status
   */
  getTasksByStatus(status: ProjectTask['status']): ProjectTask[] {
    return Array.from(this.tasks.values()).filter((t) => t.status === status);
  }

  /**
   * Get tasks for an assignee
   */
  getTasksByAssignee(assignee: string): ProjectTask[] {
    return Array.from(this.tasks.values()).filter((t) => t.assignee === assignee);
  }

  /**
   * Get a single task
   */
  getTask(taskId: string): ProjectTask | null {
    return this.tasks.get(taskId) || null;
  }

  /**
   * Get all projects
   */
  getAllProjects(): Project[] {
    return Array.from(this.projects.values());
  }

  /**
   * Get a project
   */
  getProject(projectId: string): Project | null {
    return this.projects.get(projectId) || null;
  }

  /**
   * Create a project
   */
  async createProject(
    name: string,
    description: string,
    owner: string,
    endDate: Date
  ): Promise<Project> {
    const now = new Date();
    const projectId = `proj-${Date.now()}`;

    const project: Project = {
      projectId,
      name,
      description,
      owner,
      startDate: now,
      endDate,
      status: 'planning',
      tasks: [],
      createdAt: now,
      updatedAt: now,
    };

    this.projects.set(projectId, project);
    supabaseStore.storeProjects(Array.from(this.projects.values()));

    return project;
  }

  /**
   * Get all sprints
   */
  getAllSprints(): Sprint[] {
    return Array.from(this.sprints.values());
  }

  /**
   * Get a sprint
   */
  getSprint(sprintId: string): Sprint | null {
    return this.sprints.get(sprintId) || null;
  }

  /**
   * Create a sprint
   */
  async createSprint(
    projectId: string,
    name: string,
    startDate: Date,
    endDate: Date,
    goals: string[]
  ): Promise<Sprint> {
    const sprintId = `sprint-${Date.now()}`;

    const sprint: Sprint = {
      sprintId,
      projectId,
      name,
      startDate,
      endDate,
      goals,
      status: 'planned',
      tasks: [],
    };

    this.sprints.set(sprintId, sprint);
    supabaseStore.storeSprints(Array.from(this.sprints.values()));

    return sprint;
  }

  /**
   * Add task to sprint
   */
  async addTaskToSprint(taskId: string, sprintId: string): Promise<ProjectTask | null> {
    const task = this.tasks.get(taskId);
    const sprint = this.sprints.get(sprintId);

    if (!task || !sprint) {
      return null;
    }

    task.sprintId = sprintId;
    task.updatedAt = new Date();

    this.tasks.set(taskId, task);
    if (!sprint.tasks.find((t) => t.taskId === taskId)) {
      sprint.tasks.push(task);
    }

    supabaseStore.storeTasks(Array.from(this.tasks.values()));
    supabaseStore.storeSprints(Array.from(this.sprints.values()));

    return task;
  }
}

/**
 * Factory function to create a TaskProjectAgent instance
 */
export function createTaskProjectAgent(config?: Partial<AgentConfig>): TaskProjectAgent {
  return new TaskProjectAgent(config);
}
