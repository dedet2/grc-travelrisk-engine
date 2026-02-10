import { auth } from '@clerk/nextjs/server';
import { createServerSideClient } from '@/lib/supabase/server';
import type { ApiResponse, TripRiskReport } from '@/types';

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

    const reports = (data || []).map((r) => ({
      id: r.id,
      userId: r.user_id,
      assessmentId: r.assessment_id,
      destinationCountry: r.destination_country,
      departureDate: new Date(r.departure_date),
      returnDate: new Date(r.return_date),
      grcScore: r.grc_score,
      travelScore: r.travel_score,
      combinedScore: r.combined_score,
      reportData: r.report_data,
      createdAt: new Date(r.created_at),
    })) as TripRiskReport[];

    return Response.json({
      success: true,
      data: reports,
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
    const { data, error } = await supabase
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

    const report: TripRiskReport = {
      id: data.id,
      userId: data.user_id,
      assessmentId: data.assessment_id,
      destinationCountry: data.destination_country,
      departureDate: new Date(data.departure_date),
      returnDate: new Date(data.return_date),
      grcScore: data.grc_score,
      travelScore: data.travel_score,
      combinedScore: data.combined_score,
      reportData: data.report_data,
      createdAt: new Date(data.created_at),
    };

    return Response.json(
      {
        success: true,
        data: report,
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
