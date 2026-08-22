import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Badge, Button, FilterControlBar, Skeleton, EmptyState } from '../components/ui';
import { api } from '../lib/api';
import { formatDistanceToNow } from 'date-fns';
import { CreatePostModal } from '../components/community/CreatePostModal';

export const CommunityPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroupBy, setSelectedGroupBy] = useState('none');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedSortBy, setSelectedSortBy] = useState('default');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['communityPosts'],
    queryFn: () => api.getCommunityPosts(),
  });

  const likeMutation = useMutation({
    mutationFn: (postId: string) => api.likeCommunityPost(postId),
    onMutate: async (postId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['communityPosts'] });
      const previousPosts = queryClient.getQueryData(['communityPosts']);
      
      queryClient.setQueryData(['communityPosts'], (old: any) => {
        if (!old) return old;
        return old.map((p: any) => 
          p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p
        );
      });

      return { previousPosts };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['communityPosts'], context?.previousPosts);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
    },
  });

  const handleLike = (postId: string) => {
    likeMutation.mutate(postId);
  };

  const filteredPosts = (posts || []).filter((p: any) =>
    p.trip_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 font-sans pb-12 animate-fade-up">
      {/* ── Search bar + Group by / Filter / Sort by controls ── */}
      <FilterControlBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search community trip experiences, cities, or activities..."
        selectedGroupBy={selectedGroupBy}
        onGroupByChange={setSelectedGroupBy}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        selectedSortBy={selectedSortBy}
        onSortByChange={setSelectedSortBy}
      />

      {/* Heading */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7C3AED]/10 border border-[#7C3AED]/25 text-[#5B21B6] text-xs font-semibold mb-1">
          🌍 GlobeTrotter Community Feed
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1523] tracking-tight font-heading">
          Community Tab
        </h1>
        <p className="text-sm text-[#6B7280]">
          Explore real traveler stories, trip recommendations, and activity reviews shared by the global community.
        </p>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Vertical Feed */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-48 w-full rounded-2xl" />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center p-4">Error loading community posts.</div>
          ) : filteredPosts.length === 0 ? (
            <EmptyState 
              title="No posts found" 
              description="No community posts match your search criteria. Be the first to share an experience!" 
              action={
                <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                  Share Experience
                </Button>
              }
            />
          ) : (
            filteredPosts.map((post: any) => (
              <div key={post.id} className="flex gap-4 items-start">
                <img
                  src={post.profiles?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  alt={post.profiles?.full_name || 'User'}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#7C3AED]/30 shrink-0 shadow-sm"
                />

                <Card className="flex-1 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="font-bold text-[#1A1523] text-sm font-heading">{post.profiles?.full_name || 'Anonymous Traveler'}</h3>
                      <p className="text-xs text-[#6B7280]">
                        📍 {post.location} • {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <Badge variant="primary" size="sm">{post.category}</Badge>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-base text-[#1A1523] font-heading">{post.trip_title}</h4>
                    <p className="text-sm text-[#6B7280] leading-relaxed mt-1 whitespace-pre-wrap">{post.content}</p>
                  </div>

                  {post.image_url && (
                    <div className="rounded-2xl overflow-hidden h-64 bg-[#F7F5FC] border border-[#E9E4F5]">
                      <img src={post.image_url} alt={post.trip_title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="pt-2 flex items-center gap-4 text-xs text-[#6B7280] border-t border-[#E9E4F5]">
                    <button
                      onClick={() => handleLike(post.id)}
                      className="flex items-center gap-1.5 font-semibold text-[#7C3AED] hover:text-[#5B21B6] transition-colors"
                    >
                      ❤️ {post.likes_count} Likes
                    </button>
                    <span className="flex items-center gap-1.5 font-medium">
                      💬 {post.comments_count} Comments
                    </span>
                  </div>
                </Card>
              </div>
            ))
          )}
        </div>

        {/* Right Sidebar: Info Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="sticky top-24 border-[#7C3AED]/25 bg-gradient-to-br from-[#7C3AED]/5 via-[#F7F5FC] to-white">
            <Card.Header>
              <Card.Title className="text-[#5B21B6]">Community Guide & Info</Card.Title>
            </Card.Header>
            <Card.Content className="space-y-3 text-xs text-[#6B7280] leading-relaxed">
              <p>
                <strong className="text-[#1A1523]">Share Travel Experiences:</strong> Users can publish posts, photos, and tips about their scheduled trips, itineraries, or specific city activities.
              </p>
              <p>
                <strong className="text-[#1A1523]">Filter & Narrow Results:</strong> Use the top bar controls to Search by location, Group by destination category, or Sort by top community recommendations.
              </p>
              <div className="pt-2">
                <Button variant="primary" size="sm" className="w-full" onClick={() => setIsModalOpen(true)}>
                  + Share Your Experience
                </Button>
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>

      <CreatePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default CommunityPage;
