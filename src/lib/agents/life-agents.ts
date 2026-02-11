/**
 * Life Agents - Personal Development & Lifestyle Management
 *
 * These agents handle various aspects of professional and personal life:
 * - LinkedIn: Profile optimization, content strategy
 * - Health: Medical appointments and health tracking
 * - Revenue: Income optimization and financial tracking
 * - Jobs: Career opportunities and job search
 * - Speaking: Speaking engagements and event management
 * - Legal: Legal consultations and compliance
 */

export interface LifeAgentTask {
  name: string;
  payload: Record<string, any>;
}

export interface LifeAgentResult {
  success: boolean;
  data?: any;
  message: string;
  timestamp: string;
  agentName: string;
  taskName: string;
}

export interface Doctor {
  name: string;
  speciality: string;
  location: string;
  nextAvailable: string;
}

export interface Lawyer {
  name: string;
  speciality: string;
  location: string;
  nextAvailable: string;
}

export interface Job {
  title: string;
  company: string;
  location: string;
  salaryRange: string;
  description: string;
}

export interface Lead {
  name: string;
  company: string;
  email: string;
  phone: string;
}

export interface SpeakingEngagement {
  eventName: string;
  date: string;
  location: string;
  topic: string;
  audience: number;
  fee: number;
  status: 'proposed' | 'confirmed' | 'completed';
}

export interface LinkedInAction {
  type: 'post' | 'connection' | 'profile_update' | 'engagement';
  content?: string;
  targetAudience?: string;
  engagementMetrics?: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
}

/**
 * Health Agent - Manages health appointments and provider searches
 */
export class HealthAgent {
  name = 'health_agent';
  tasks = ['health_search', 'health_appointment'];

  handleTask(task: LifeAgentTask): LifeAgentResult {
    const timestamp = new Date().toISOString();

    if (task.name === 'health_search') {
      const speciality = task.payload.speciality as string | undefined;
      const doctors = this.generateFakeDoctors(5);
      const filtered = speciality
        ? doctors.filter(d =>
            d.speciality.toLowerCase().includes(speciality.toLowerCase())
          )
        : doctors;

      return {
        success: true,
        data: { doctors: filtered },
        message: `Found ${filtered.length} doctors`,
        timestamp,
        agentName: this.name,
        taskName: task.name,
      };
    }

    if (task.name === 'health_appointment') {
      const doctorName = task.payload.doctor_name as string;
      const date = task.payload.date as string;

      return {
        success: true,
        data: {
          confirmation: `Appointment booked with ${doctorName} on ${date}`,
        },
        message: 'Appointment successfully scheduled',
        timestamp,
        agentName: this.name,
        taskName: task.name,
      };
    }

    throw new Error(`HealthAgent cannot handle task ${task.name}`);
  }

  private generateFakeDoctors(count: number): Doctor[] {
    const specialities = [
      'General Practitioner',
      'Cardiologist',
      'Dermatologist',
      'Neurologist',
    ];
    const names = ['Dr. Chen', 'Dr. Patel', 'Dr. Garcia', 'Dr. Nguyen'];
    const locations = ['Oakland', 'San Jose', 'San Francisco', 'Berkeley'];

    const doctors: Doctor[] = [];
    for (let i = 0; i < count; i++) {
      doctors.push({
        name: names[Math.floor(Math.random() * names.length)],
        speciality: specialities[Math.floor(Math.random() * specialities.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        nextAvailable: `2025-09-${10 + Math.floor(Math.random() * 20)}`,
      });
    }
    return doctors;
  }
}

/**
 * Legal Agent - Manages legal consultations and compliance
 */
export class LegalAgent {
  name = 'legal_agent';
  tasks = ['legal_search', 'legal_appointment'];

  handleTask(task: LifeAgentTask): LifeAgentResult {
    const timestamp = new Date().toISOString();

    if (task.name === 'legal_search') {
      const speciality = task.payload.speciality as string | undefined;
      const lawyers = this.generateFakeLawyers(5);
      const filtered = speciality
        ? lawyers.filter(l =>
            l.speciality.toLowerCase().includes(speciality.toLowerCase())
          )
        : lawyers;

      return {
        success: true,
        data: { lawyers: filtered },
        message: `Found ${filtered.length} lawyers`,
        timestamp,
        agentName: this.name,
        taskName: task.name,
      };
    }

    if (task.name === 'legal_appointment') {
      const lawyerName = task.payload.lawyer_name as string;
      const date = task.payload.date as string;

      return {
        success: true,
        data: {
          confirmation: `Appointment booked with ${lawyerName} on ${date}`,
        },
        message: 'Legal consultation scheduled',
        timestamp,
        agentName: this.name,
        taskName: task.name,
      };
    }

    throw new Error(`LegalAgent cannot handle task ${task.name}`);
  }

  private generateFakeLawyers(count: number): Lawyer[] {
    const specialities = ['Corporate', 'Family', 'Criminal', 'Immigration'];
    const names = ['Atty. Kim', 'Atty. Johnson', 'Atty. Singh', 'Atty. Martinez'];
    const locations = ['Oakland', 'San Jose', 'San Francisco', 'Berkeley'];

    const lawyers: Lawyer[] = [];
    for (let i = 0; i < count; i++) {
      lawyers.push({
        name: names[Math.floor(Math.random() * names.length)],
        speciality: specialities[Math.floor(Math.random() * specialities.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        nextAvailable: `2025-09-${10 + Math.floor(Math.random() * 20)}`,
      });
    }
    return lawyers;
  }
}

/**
 * Jobs Agent - Manages job searches and career opportunities
 */
export class JobsAgent {
  name = 'jobs_agent';
  tasks = ['job_search'];

  handleTask(task: LifeAgentTask): LifeAgentResult {
    const timestamp = new Date().toISOString();

    if (task.name !== 'job_search') {
      throw new Error(`JobsAgent cannot handle task ${task.name}`);
    }

    const count = parseInt(task.payload.count || '5', 10);
    const query = task.payload.query as string | undefined;

    let jobs = this.generateFakeJobs(count);
    if (query) {
      jobs = jobs.filter(job =>
        job.title.toLowerCase().includes(query.toLowerCase())
      );
    }

    return {
      success: true,
      data: { jobs },
      message: `Found ${jobs.length} job opportunities`,
      timestamp,
      agentName: this.name,
      taskName: task.name,
    };
  }

  private generateFakeJobs(count: number): Job[] {
    const titles = [
      'Software Engineer',
      'Data Analyst',
      'Project Manager',
      'Product Designer',
    ];
    const companies = ['Techify', 'DataCorp', 'InnovateX', 'FutureWorks'];
    const locations = ['Remote', 'San Francisco', 'New York', 'Austin'];

    const jobs: Job[] = [];
    for (let i = 0; i < count; i++) {
      jobs.push({
        title: titles[Math.floor(Math.random() * titles.length)],
        company: companies[Math.floor(Math.random() * companies.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        salaryRange: `$${80 + Math.floor(Math.random() * 70)}k-$${150 + Math.floor(Math.random() * 100)}k`,
        description: `Seeking a skilled professional to join our team`,
      });
    }
    return jobs;
  }
}

/**
 * Revenue Agent - Manages revenue optimization and financial tracking
 */
export class RevenueAgent {
  name = 'revenue_agent';
  tasks = ['revenue_analysis', 'income_projection', 'pricing_optimization'];

  handleTask(task: LifeAgentTask): LifeAgentResult {
    const timestamp = new Date().toISOString();

    if (task.name === 'revenue_analysis') {
      const data = task.payload.data as number[] | undefined;
      if (!data || !Array.isArray(data)) {
        return {
          success: false,
          message: 'Invalid data provided',
          timestamp,
          agentName: this.name,
          taskName: task.name,
        };
      }

      const summary = this.analyzeRevenue(data);
      return {
        success: true,
        data: { summary },
        message: 'Revenue analysis complete',
        timestamp,
        agentName: this.name,
        taskName: task.name,
      };
    }

    if (task.name === 'income_projection') {
      const currentIncome = task.payload.current_income as number;
      const growthRate = task.payload.growth_rate as number || 0.1;

      const projections = [];
      for (let month = 1; month <= 12; month++) {
        projections.push({
          month,
          projectedIncome: Math.round(currentIncome * Math.pow(1 + growthRate, month / 12)),
        });
      }

      return {
        success: true,
        data: { projections },
        message: '12-month income projection generated',
        timestamp,
        agentName: this.name,
        taskName: task.name,
      };
    }

    if (task.name === 'pricing_optimization') {
      const currentPrice = task.payload.current_price as number;
      const alternatives = [
        { price: Math.round(currentPrice * 0.9), expectedChange: '-10% (volume up 25%)' },
        { price: Math.round(currentPrice), expectedChange: 'Current (baseline)' },
        { price: Math.round(currentPrice * 1.15), expectedChange: '+15% (volume down 10%)' },
        { price: Math.round(currentPrice * 1.3), expectedChange: '+30% (premium tier)' },
      ];

      return {
        success: true,
        data: { alternatives },
        message: 'Pricing optimization recommendations generated',
        timestamp,
        agentName: this.name,
        taskName: task.name,
      };
    }

    throw new Error(`RevenueAgent cannot handle task ${task.name}`);
  }

  private analyzeRevenue(data: number[]) {
    const sorted = [...data].sort((a, b) => a - b);
    const sum = data.reduce((a, b) => a + b, 0);
    const mean = sum / data.length;
    const median = sorted[Math.floor(sorted.length / 2)];

    return {
      count: data.length,
      total: Math.round(sum),
      average: Math.round(mean),
      median: Math.round(median),
      min: Math.min(...data),
      max: Math.max(...data),
      standardDeviation: Math.round(
        Math.sqrt(
          data.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / data.length
        )
      ),
    };
  }
}

/**
 * Speaking Agent - Manages speaking engagements and events
 */
export class SpeakingAgent {
  name = 'speaking_agent';
  tasks = ['list_engagements', 'propose_speaking', 'confirm_engagement'];

  handleTask(task: LifeAgentTask): LifeAgentResult {
    const timestamp = new Date().toISOString();

    if (task.name === 'list_engagements') {
      const engagements = this.generateFakeSpeakingEngagements();
      return {
        success: true,
        data: { engagements },
        message: `Found ${engagements.length} speaking opportunities`,
        timestamp,
        agentName: this.name,
        taskName: task.name,
      };
    }

    if (task.name === 'propose_speaking') {
      const eventName = task.payload.event_name as string;
      const date = task.payload.date as string;
      const fee = task.payload.fee as number || 2500;

      return {
        success: true,
        data: {
          proposal: {
            eventName,
            date,
            fee,
            status: 'proposed',
          },
        },
        message: 'Speaking engagement proposed',
        timestamp,
        agentName: this.name,
        taskName: task.name,
      };
    }

    if (task.name === 'confirm_engagement') {
      const engagementId = task.payload.engagement_id as string;
      return {
        success: true,
        data: { engagementId, confirmed: true },
        message: 'Speaking engagement confirmed',
        timestamp,
        agentName: this.name,
        taskName: task.name,
      };
    }

    throw new Error(`SpeakingAgent cannot handle task ${task.name}`);
  }

  private generateFakeSpeakingEngagements(): SpeakingEngagement[] {
    return [
      {
        eventName: 'Tech Conference 2025',
        date: '2025-09-15',
        location: 'San Francisco, CA',
        topic: 'AI in Business',
        audience: 500,
        fee: 5000,
        status: 'confirmed',
      },
      {
        eventName: 'Leadership Summit',
        date: '2025-10-20',
        location: 'New York, NY',
        topic: 'Scaling Teams',
        audience: 300,
        fee: 3500,
        status: 'confirmed',
      },
      {
        eventName: 'Startup Expo',
        date: '2025-11-10',
        location: 'Austin, TX',
        topic: 'Growth Strategies',
        audience: 200,
        fee: 2500,
        status: 'proposed',
      },
    ];
  }
}

/**
 * LinkedIn Agent - Manages LinkedIn presence and content strategy
 */
export class LinkedInAgent {
  name = 'linkedin_agent';
  tasks = ['create_post', 'optimize_profile', 'engagement_analysis'];

  handleTask(task: LifeAgentTask): LifeAgentResult {
    const timestamp = new Date().toISOString();

    if (task.name === 'create_post') {
      const content = task.payload.content as string;
      const targetAudience = task.payload.target_audience as string || 'general';

      return {
        success: true,
        data: {
          post: {
            content,
            targetAudience,
            scheduledAt: timestamp,
            status: 'draft',
          },
        },
        message: 'LinkedIn post created',
        timestamp,
        agentName: this.name,
        taskName: task.name,
      };
    }

    if (task.name === 'optimize_profile') {
      const recommendations = [
        'Add video to profile headline',
        'Include 3-4 industry keywords in headline',
        'Update open to work status',
        'Add recent projects to experience',
      ];

      return {
        success: true,
        data: { recommendations },
        message: 'Profile optimization recommendations generated',
        timestamp,
        agentName: this.name,
        taskName: task.name,
      };
    }

    if (task.name === 'engagement_analysis') {
      const metrics = {
        totalConnections: Math.floor(Math.random() * 5000) + 1000,
        monthlyEngagement: Math.floor(Math.random() * 10000) + 2000,
        topicPerformance: {
          'AI & Technology': Math.floor(Math.random() * 100),
          'Leadership': Math.floor(Math.random() * 80),
          'Career Development': Math.floor(Math.random() * 60),
        },
      };

      return {
        success: true,
        data: { metrics },
        message: 'Engagement analysis complete',
        timestamp,
        agentName: this.name,
        taskName: task.name,
      };
    }

    throw new Error(`LinkedInAgent cannot handle task ${task.name}`);
  }
}

/**
 * Life Agents Registry
 */
export const lifeAgents = {
  health: new HealthAgent(),
  legal: new LegalAgent(),
  jobs: new JobsAgent(),
  revenue: new RevenueAgent(),
  speaking: new SpeakingAgent(),
  linkedin: new LinkedInAgent(),
};

/**
 * Execute a life agent task
 */
export function executeLifeAgentTask(
  agentName: keyof typeof lifeAgents,
  task: LifeAgentTask
): LifeAgentResult {
  const agent = lifeAgents[agentName];
  if (!agent) {
    throw new Error(`Unknown agent: ${agentName}`);
  }

  return agent.handleTask(task);
}
