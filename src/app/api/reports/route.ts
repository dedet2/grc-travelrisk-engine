import { auth } from '@clerk/nextjs/server';
import { createServerSideClient } from '@/lib/supabase/server';
import type { ApiResponse, TripRiskReport } from '@/types';
import type { Database } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json(
        { success: false, error: 'Unauthorized' } as ApiResponse<null>,
        { status: 401 }
      );
    }

    const supabase = await createServerSideClient();
    const { data, error } = await supabase
      .from('trip_risk_reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const reports = ((data as Database['public']['Tables']['trip_risk_reports']['Row'][] | null) || []).map((r) => ({
      id: r.id,
      userId: r.user_id,
      assessmentId: r.assessment_id,
      destinationCountry: r.destination_country,
      departureDate: r.departure_date,
      returnDate: r.return_date,
      grcScore: r.grc_score,
      travelScore: r.travel_score,
      combinedScore: r.combined_score,
      reportData: r.report_data,
      createdAt: r.created_at,
    }));

    return Response.json({
      success: true,
      data: reports as unknown as TripRiskReport[],
      timestamp: new Date(),
    } as ApiResponse<TripRiskReport[]>);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch reports' } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json(
        { success: false, error: 'Unauthorized' } as ApiResponse<null>,
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      destinationCountry,
      departureDate,
      returnDate,
      grcScore,
      travelScore,
      assessmentId,
    } = body;

    if (!destinationCountry || !departureDate || !returnDate || grcScore === undefined || travelScore === undefined) {
      return Response.json(
        {
          success: false,
          error: 'Missing required fields',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const combinedScore = Math.round(grcScore * 0.4 + travelScore * 0.6);

    const supabase = await createServerSideClient();
    const { data, error } = await (supabase as any)
      .from('trip_risk_reports')
      .insert([
        {
          user_id: userId,
          assessment_id: assessmentId,
          destination_country: destinationCountry,
          departure_date: departureDate,
          return_date: returnDate,
          grc_score: grcScore,
          travel_score: travelScore,
          combined_score: combinedScore,
          report_data: body,
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    const reportRow = data as Database['public']['Tables']['trip_risk_reports']['Row'];
    const report = {
      id: reportRow.id,
      userId: reportRow.user_id,
      assessmentId: reportRow.assessment_id,
      destinationCountry: reportRow.destination_country,
      departureDate: reportRow.departure_date,
      returnDate: reportRow.return_date,
      grcScore: reportRow.grc_score,
      travelScore: reportRow.travel_score,
      combinedScore: reportRow.combined_score,
      reportData: reportRow.report_data,
      createdAt: reportRow.created_at,
    };

    return Response.json(
      {
        success: true,
        data: report as unknown as TripRiskReport,
        timestamp: new Date(),
      } as ApiResponse<TripRiskReport>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating report:', error);
    return Response.json(
      { success: false, error: 'Failed to create report' } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
