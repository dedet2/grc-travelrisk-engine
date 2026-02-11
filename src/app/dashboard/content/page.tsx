'use client';

import { useState, useEffect } from 'react';

interface ContentItem {
  id: string;
  title: string;
  type: 'blog' | 'guide' | 'case-study' | 'whitepaper';
  status: 'draft' | 'scheduled' | 'published';
  publishedDate?: string;
  scheduledDate?: string;
  views?: number;
}

interface KeywordRanking {
  keyword: string;
  currentRank: number;
  previousRank: number;
  searchVolume: number;
  difficulty: number;
}

interface ContentMetrics {
  publishedContent: number;
  scheduledContent: number;
  draftContent: number;
  totalViews: number;
  avgEngagement: number;
  organicTraffic: number;
}

interface ContentData {
  metrics: ContentMetrics;
  content: ContentItem[];
  keywords: KeywordRanking[];
  socialMedia: {
    platform: string;
    followers: number;
    engagement: number;
  }[];
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'published':
      return 'bg-emerald-100 text-emerald-700 border-emerald-300';
    case 'scheduled':
      return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'draft':
      return 'bg-gray-100 text-gray-700 border-gray-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
}

function getTypeColor(type: string): string {
  switch (type) {
    case 'blog':
      return 'bg-indigo-100 text-indigo-700';
    case 'guide':
      return 'bg-blue-100 text-blue-700';
    case 'case-study':
      return 'bg-purple-100 text-purple-700';
    case 'whitepaper':
      return 'bg-amber-100 text-amber-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

export default function ContentPage() {
  const [data, setData] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContentData() {
      try {
        const response = await fetch('/api/content-calendar');
        if (!response.ok) throw new Error('Failed to fetch content data');

        const result = await response.json();
        // Mock combined data since individual endpoints may not exist yet
        const mockData = result.data || result;

        setData({
          metrics: mockData.metrics || {
            publishedContent: 24,
            scheduledContent: 8,
            draftContent: 5,
            totalViews: 125000,
            avgEngagement: 3.2,
            organicTraffic: 8500,
          },
          content: mockData.content || [],
          keywords: mockData.keywords || [],
          socialMedia: mockData.socialMedia || [
            { platform: 'LinkedIn', followers: 12000, engagement: 4.5 },
            { platform: 'Twitter', followers: 8500, engagement: 2.8 },
            { platform: 'Medium', followers: 5200, engagement: 3.1 },
          ],
        });
      } catch (err) {
        console.error('Error fetching content data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load content data');
      } finally {
        setLoading(false);
      }
    }

    fetchContentData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-12 bg-gray-200 rounded animate-pulse w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-red-900 mb-2">Failed to load content</h2>
        <p className="text-red-700">{error || 'Unknown error occurred'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Content & Marketing</h1>
        <p className="text-gray-600 mt-2">Content calendar, SEO metrics, and social media performance</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Published Content */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emerald-600">
          <p className="text-sm font-medium text-gray-600 mb-1">Published Content</p>
          <p className="text-4xl font-bold text-emerald-600">
            {data.metrics.publishedContent}
          </p>
          <p className="text-xs text-gray-600 mt-2">Live articles & guides</p>
        </div>

        {/* Scheduled Content */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
          <p className="text-sm font-medium text-gray-600 mb-1">Scheduled Content</p>
          <p className="text-4xl font-bold text-blue-600">
            {data.metrics.scheduledContent}
          </p>
          <p className="text-xs text-gray-600 mt-2">Upcoming posts</p>
        </div>

        {/* Draft Content */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-gray-600">
          <p className="text-sm font-medium text-gray-600 mb-1">Draft Content</p>
          <p className="text-4xl font-bold text-gray-600">
            {data.metrics.draftContent}
          </p>
          <p className="text-xs text-gray-600 mt-2">In progress</p>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Views */}
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600 mb-3">Total Views</p>
          <p className="text-3xl font-bold text-indigo-600">
            {(data.metrics.totalViews / 1000).toFixed(0)}k
          </p>
          <p className="text-xs text-gray-600 mt-2">All content combined</p>
        </div>

        {/* Avg Engagement */}
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600 mb-3">Avg Engagement</p>
          <p className="text-3xl font-bold text-purple-600">
            {data.metrics.avgEngagement}%
          </p>
          <p className="text-xs text-gray-600 mt-2">Reader interaction rate</p>
        </div>

        {/* Organic Traffic */}
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600 mb-3">Organic Traffic</p>
          <p className="text-3xl font-bold text-teal-600">
            {(data.metrics.organicTraffic / 1000).toFixed(1)}k
          </p>
          <p className="text-xs text-gray-600 mt-2">From search engines</p>
        </div>
      </div>

      {/* Keyword Rankings */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900">Top Keywords</h2>
          <p className="text-sm text-gray-600 mt-1">
            SEO performance for target keywords
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  Keyword
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  Current Rank
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  Change
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                  Search Volume
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  Difficulty
                </th>
              </tr>
            </thead>
            <tbody>
              {data.keywords.length > 0 ? (
                data.keywords.slice(0, 10).map((keyword, idx) => {
                  const change = keyword.currentRank - keyword.previousRank;
                  const isImproving = change < 0;

                  return (
                    <tr
                      key={idx}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {keyword.keyword}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">
                        #{keyword.currentRank}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            isImproving
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {isImproving ? '' : ''} {Math.abs(change)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-gray-600">
                        {keyword.searchVolume.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                keyword.difficulty < 30
                                  ? 'bg-emerald-600'
                                  : keyword.difficulty < 60
                                    ? 'bg-amber-600'
                                    : 'bg-red-600'
                              }`}
                              style={{ width: `${keyword.difficulty}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-600 w-8">
                            {keyword.difficulty}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No keyword data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Social Media Performance */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Social Media</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.socialMedia.map((social, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <p className="font-bold text-gray-900 mb-4">{social.platform}</p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Followers</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {(social.followers / 1000).toFixed(1)}k
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Engagement Rate</p>
                  <p className="text-2xl font-bold text-teal-600">
                    {social.engagement}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Content */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Content</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {data.content.length > 0 ? (
            data.content.slice(0, 8).map((item) => (
              <div
                key={item.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{item.title}</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {item.publishedDate
                        ? `Published ${new Date(item.publishedDate).toLocaleDateString()}`
                        : item.scheduledDate
                          ? `Scheduled ${new Date(item.scheduledDate).toLocaleDateString()}`
                          : 'Draft'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(
                        item.type
                      )}`}
                    >
                      {item.type}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
                {item.views && (
                  <p className="text-xs text-gray-600">
                    Views: {item.views.toLocaleString()}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-500">
              No content found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
