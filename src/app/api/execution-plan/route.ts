/**
 * Execution Plan API
 *
 * Returns 12-week execution milestones and daily tasks
 * Based on Incluu Week 0-12 Airtable Execution System
 */

export const dynamic = 'force-dynamic';

export interface DailyTask {
  week: string;
  day: string;
  focus: string;
  keyActions: string;
  contentPublished: string;
  leadsTarget: number;
  callsTarget: number;
  systemImprovement: string;
  energyPacing?: number;
  notes?: string;
}

export interface WeeklyMilestone {
  week: string;
  weekNumber: number;
  theme: string;
  objectives: string[];
  tasks: DailyTask[];
  completionStatus: 'not-started' | 'in-progress' | 'complete';
  weeklyTargets: {
    leadsTarget: number;
    callsTarget: number;
    contentPieces: number;
  };
}

// Generate 12 weeks of execution data
function generateExecutionWeeks(): WeeklyMilestone[] {
  const weekThemes = [
    'Launch & Foundation',
    'Stabilize & Optimize',
    'Scale & Expand',
    'Integrate & Automate',
    'Review & Refine',
    'Execute & Track',
    'Growth & Expansion',
    'Consolidation',
    'Authority Building',
    'Revenue Focus',
    'Preparation',
    'Launch Phase 2',
  ];

  const weeks: WeeklyMilestone[] = [];

  for (let weekNum = 0; weekNum < 12; weekNum++) {
    const weekLabel = `Week ${weekNum}`;
    const dailyTasks: DailyTask[] = [];

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    let weekLeadsTarget = 0;
    let weekCallsTarget = 0;

    for (const day of days) {
      let leadsTarget = 0;
      let callsTarget = 0;

      // Pattern: Mon & Thu get 5 leads, Fri gets 1 call
      if (day === 'Monday' || day === 'Thursday') {
        leadsTarget = 5;
      }
      if (day === 'Friday') {
        callsTarget = 1;
      }

      weekLeadsTarget += leadsTarget;
      weekCallsTarget += callsTarget;

      dailyTasks.push({
        week: weekLabel,
        day,
        focus: 'Launch, stabilize, or scale actions depending on the week phase',
        keyActions:
          'Run Lead Gen Agent, Outreach Agent, Booking Agent, publish content, system improvement',
        contentPublished: 'LinkedIn post, Reel, or Newsletter (based on plan)',
        leadsTarget,
        callsTarget,
        systemImprovement:
          'Identify and refine 1% system improvement weekly (Friday review)',
        energyPacing: Math.floor(Math.random() * 5) + 1,
        notes: '',
      });
    }

    weeks.push({
      week: weekLabel,
      weekNumber: weekNum,
      theme: weekThemes[weekNum] || 'Continuous Improvement',
      objectives: [
        `Execute daily lead generation (Target: ${weekLeadsTarget} leads)`,
        `Schedule and attend calls (Target: ${weekCallsTarget} calls)`,
        'Publish consistent content across channels',
        'Identify 1% system improvement',
        'Track metrics and adjust strategy',
      ],
      tasks: dailyTasks,
      completionStatus: weekNum === 0 ? 'in-progress' : 'not-started',
      weeklyTargets: {
        leadsTarget: weekLeadsTarget,
        callsTarget: weekCallsTarget,
        contentPieces: 5,
      },
    });
  }

  return weeks;
}

const executionWeeks = generateExecutionWeeks();

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const week = url.searchParams.get('week');
    const view = url.searchParams.get('view'); // 'summary' or 'detailed'

    let data = executionWeeks;

    if (week) {
      const weekNum = parseInt(week, 10);
      if (isNaN(weekNum) || weekNum < 0 || weekNum >= 12) {
        return Response.json(
          {
            error: `Invalid week number. Must be 0-11`,
          },
          { status: 400 }
        );
      }
      data = executionWeeks.filter(w => w.weekNumber === weekNum);
    }

    let responseData: any = data;

    // Summary view shows week-level overview only
    if (view === 'summary') {
      responseData = data.map(w => ({
        week: w.week,
        weekNumber: w.weekNumber,
        theme: w.theme,
        completionStatus: w.completionStatus,
        weeklyTargets: w.weeklyTargets,
        taskCount: w.tasks.length,
      }));
    }

    // Calculate aggregate metrics
    const totalWeeks = executionWeeks.length;
    const totalLeadsTarget = executionWeeks.reduce(
      (sum, w) => sum + w.weeklyTargets.leadsTarget,
      0
    );
    const totalCallsTarget = executionWeeks.reduce(
      (sum, w) => sum + w.weeklyTargets.callsTarget,
      0
    );

    return Response.json(
      {
        success: true,
        data: responseData,
        summary: {
          totalWeeks,
          totalLeadsTarget,
          totalCallsTarget,
          completedWeeks: executionWeeks.filter(w => w.completionStatus === 'complete').length,
          inProgressWeeks: executionWeeks.filter(
            w => w.completionStatus === 'in-progress'
          ).length,
          plannedWeeks: executionWeeks.filter(
            w => w.completionStatus === 'not-started'
          ).length,
        },
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
        },
      }
    );
  } catch (error) {
    console.error('Execution plan API error:', error);
    return Response.json(
      {
        error: 'Failed to fetch execution plan',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { week, day, field, value } = body;

    if (week === undefined || !day || !field) {
      return Response.json(
        {
          error: 'week, day, and field are required',
        },
        { status: 400 }
      );
    }

    // In a real implementation, this would persist to a database
    return Response.json(
      {
        success: true,
        message: `Updated Week ${week} ${day}`,
        updated: {
          week,
          day,
          [field]: value,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Execution plan PUT error:', error);
    return Response.json(
      {
        error: 'Failed to update execution plan',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
