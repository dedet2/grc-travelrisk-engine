import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';
import { BufferConnector } from '@/lib/integrations/buffer-connector';

interface ProfileInfo {
  id: string;
  service: string;
  service_username: string;
  display_name: string;
  avatar: string;
  followers: number;
  posts: number;
  engagementRate: number;
}

interface BufferStatus extends ApiResponse<{
  connected: boolean;
  profiles: ProfileInfo[];
  totalProfiles: number;
  scheduledPosts: number;
  lastSync: string;
}> {
  success: boolean;
  message?: string;
}

export async function GET(): Promise<NextResponse<BufferStatus>> {
  try {
    const connector = new BufferConnector(process.env.BUFFER_API_KEY || '');
    const profiles = await connector.listProfiles();

    let totalScheduledPosts = 0;
    for (const profile of profiles) {
      const queue = await connector.getQueue(profile.id);
      totalScheduledPosts += queue.queue_size;
    }

    const profileInfos: ProfileInfo[] = profiles.map((profile) => ({
      id: profile.id,
      service: profile.service,
      service_username: profile.service_username,
      display_name: profile.display_name,
      avatar: profile.avatar,
      followers: profile.statistics?.followers || 0,
      posts: profile.statistics?.posts || 0,
      engagementRate: profile.statistics?.engagementRate || 0,
    }));

    const response: BufferStatus = {
      success: true,
      message: 'Buffer integration status retrieved',
      data: {
        connected: true,
        profiles: profileInfos,
        totalProfiles: profiles.length,
        scheduledPosts: totalScheduledPosts,
        lastSync: new Date().toISOString(),
      },
      timestamp: new Date(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error getting Buffer status:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to get Buffer status',
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}

interface BufferAction {
  action: string;
  profileId?: string;
  text?: string;
  media?: Array<{
    url: string;
    type: 'image' | 'video' | 'link';
  }>;
  scheduledTime?: string;
  postId?: string;
  posts?: Array<{
    text: string;
    media?: Array<{
      url: string;
      type: 'image' | 'video' | 'link';
    }>;
    scheduledTime: string;
  }>;
  postIds?: string[];
  startDate?: string;
  endDate?: string;
  since?: string;
}

interface ActionResponse extends ApiResponse<unknown> {
  success: boolean;
  message?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ActionResponse>> {
  try {
    const body = (await request.json()) as BufferAction;
    const {
      action,
      profileId,
      text,
      media,
      scheduledTime,
      postId,
      posts,
      postIds,
      startDate,
      endDate,
      since,
    } = body;

    const connector = new BufferConnector(process.env.BUFFER_API_KEY || '');

    // List all profiles
    if (action === 'list-profiles') {
      const profiles = await connector.listProfiles();
      return NextResponse.json({
        success: true,
        message: 'Profiles retrieved',
        data: profiles,
        timestamp: new Date(),
      });
    }

    // Get specific profile
    if (action === 'get-profile' && profileId) {
      const profile = await connector.getProfile(profileId);
      return NextResponse.json({
        success: true,
        message: 'Profile retrieved',
        data: profile,
        timestamp: new Date(),
      });
    }

    // Create a single post
    if (action === 'create-post' && profileId && text) {
      const post = await connector.createPost(
        profileId,
        text,
        media,
        scheduledTime
      );
      return NextResponse.json(
        {
          success: true,
          message: 'Post created successfully',
          data: post,
          timestamp: new Date(),
        },
        { status: 201 }
      );
    }

    // Schedule multiple posts at once
    if (action === 'schedule-posts' && profileId && posts && posts.length > 0) {
      const scheduledPosts = await connector.schedulePosts(profileId, posts);
      return NextResponse.json(
        {
          success: true,
          message: `${scheduledPosts.length} posts scheduled successfully`,
          data: scheduledPosts,
          timestamp: new Date(),
        },
        { status: 201 }
      );
    }

    // Create a draft (unsent post)
    if (action === 'create-draft' && profileId && text) {
      const draft = await connector.createDraft(profileId, text, media);
      return NextResponse.json(
        {
          success: true,
          message: 'Draft created successfully',
          data: draft,
          timestamp: new Date(),
        },
        { status: 201 }
      );
    }

    // List scheduled posts for a profile
    if (action === 'list-scheduled-posts' && profileId) {
      const scheduledPosts = await connector.listScheduledPosts(profileId);
      return NextResponse.json({
        success: true,
        message: 'Scheduled posts retrieved',
        data: scheduledPosts,
        timestamp: new Date(),
      });
    }

    // Get details of a specific post
    if (action === 'get-post' && postId) {
      const post = await connector.getPost(postId);
      return NextResponse.json({
        success: true,
        message: 'Post retrieved',
        data: post,
        timestamp: new Date(),
      });
    }

    // Update an existing post
    if (action === 'update-post' && postId) {
      const post = await connector.updatePost(postId, text, media, scheduledTime);
      return NextResponse.json({
        success: true,
        message: 'Post updated successfully',
        data: post,
        timestamp: new Date(),
      });
    }

    // Delete a post
    if (action === 'delete-post' && postId) {
      const deleted = await connector.deletePost(postId);
      return NextResponse.json({
        success: true,
        message: 'Post deleted successfully',
        data: { deleted },
        timestamp: new Date(),
      });
    }

    // Publish/share a scheduled post immediately
    if (action === 'publish-post' && postId) {
      const post = await connector.publishPost(postId);
      return NextResponse.json({
        success: true,
        message: 'Post published successfully',
        data: post,
        timestamp: new Date(),
      });
    }

    // Reorder the posting queue
    if (action === 'reorder-queue' && profileId && postIds) {
      const reorderedPosts = await connector.reorderQueue(profileId, postIds);
      return NextResponse.json({
        success: true,
        message: 'Queue reordered successfully',
        data: reorderedPosts,
        timestamp: new Date(),
      });
    }

    // Get the posting queue for a profile
    if (action === 'get-queue' && profileId) {
      const queue = await connector.getQueue(profileId);
      return NextResponse.json({
        success: true,
        message: 'Queue retrieved',
        data: queue,
        timestamp: new Date(),
      });
    }

    // Get analytics for a profile
    if (action === 'get-analytics' && profileId) {
      const analytics = await connector.getAnalytics(profileId, since);
      return NextResponse.json({
        success: true,
        message: 'Analytics retrieved',
        data: analytics,
        timestamp: new Date(),
      });
    }

    // Get detailed analytics for a specific post
    if (action === 'get-post-analytics' && postId) {
      const analytics = await connector.getPostAnalytics(postId);
      return NextResponse.json({
        success: true,
        message: 'Post analytics retrieved',
        data: analytics,
        timestamp: new Date(),
      });
    }

    // Get calendar view of scheduled posts
    if (action === 'get-calendar' && profileId) {
      const calendarEvents = await connector.getCalendarView(
        profileId,
        startDate,
        endDate
      );
      return NextResponse.json({
        success: true,
        message: 'Calendar events retrieved',
        data: calendarEvents,
        timestamp: new Date(),
      });
    }

    // Clear all scheduled posts from queue
    if (action === 'clear-queue' && profileId) {
      const cleared = await connector.clearQueue(profileId);
      return NextResponse.json({
        success: true,
        message: 'Queue cleared successfully',
        data: { cleared },
        timestamp: new Date(),
      });
    }

    // Get best posting times for a profile
    if (action === 'get-best-times' && profileId) {
      const bestTimes = await connector.getBestTimes(profileId);
      return NextResponse.json({
        success: true,
        message: 'Best posting times retrieved',
        data: bestTimes,
        timestamp: new Date(),
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Invalid action or missing required parameters',
        timestamp: new Date(),
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in Buffer integration:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process Buffer request',
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
