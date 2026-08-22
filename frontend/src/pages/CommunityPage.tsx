import React, { useState } from 'react';
import { Card, Badge, Button, FilterControlBar } from '../components/ui';

interface CommunityPost {
  id: string;
  user_name: string;
  user_avatar: string;
  location: string;
  trip_title: string;
  time_ago: string;
  content: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  category: string;
}

const MOCK_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    user_name: 'Elena Rostova',
    user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    location: 'Kyoto, Japan',
    trip_title: 'Autumn Leaves in Arashiyama & Fushimi Inari',
    time_ago: '2 hours ago',
    content: 'Waking up early at 6 AM to visit Fushimi Inari Shrine before the crowd arrives was the best decision ever! The torii gates under the morning light are completely breathtaking. Highly recommend grabbing fresh dango nearby.',
    image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    likes_count: 42,
    comments_count: 9,
    category: 'Culture & Sightseeing',
  },
  {
    id: 'post-2',
    user_name: 'Marcus Vance',
    user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    location: 'Barcelona, Spain',
    trip_title: 'Tapas, Gothic Quarter & Sunrise at Beach',
    time_ago: '5 hours ago',
    content: 'Found an incredible hidden tapas tavern near El Born! Patatas bravas and seafood paella were 10/10. Budget tip: get the local metro pass instead of single tickets.',
    image_url: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80',
    likes_count: 28,
    comments_count: 4,
    category: 'Foodie Trail',
  },
  {
    id: 'post-3',
    user_name: 'Sophia Chen',
    user_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    location: 'Interlaken, Switzerland',
    trip_title: 'Paragliding & Grindelwald First Cliff Walk',
    time_ago: '1 day ago',
    content: 'First time paragliding over Swiss lakes and snow peaks! Unforgettable adrenaline rush. Make sure to pack layered windbreakers even in late summer.',
    image_url: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80',
    likes_count: 65,
    comments_count: 14,
    category: 'Outdoor Adventure',
  },
];

export const CommunityPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroupBy, setSelectedGroupBy] = useState('none');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedSortBy, setSelectedSortBy] = useState('default');

  const [posts, setPosts] = useState<CommunityPost[]>(MOCK_COMMUNITY_POSTS);

  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p))
    );
  };

  const filteredPosts = posts.filter(
    (p) =>
      p.trip_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 font-sans pb-12 animate-fade-up">
      {/* ── Search bar + Group by / Filter / Sort by controls (Screen 10 Spec) ── */}
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

      {/* Main Layout: Feed on Left + Info Sidebar Panel on Right (Screen 10 Spec) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Vertical Feed (Avatar Left + Content Card Right) */}
        <div className="lg:col-span-2 space-y-6">
          {filteredPosts.map((post) => (
            <div key={post.id} className="flex gap-4 items-start">
              {/* Circular Avatar Left */}
              <img
                src={post.user_avatar}
                alt={post.user_name}
                className="w-12 h-12 rounded-full object-cover border-2 border-[#7C3AED]/30 shrink-0 shadow-sm"
              />

              {/* Content Card Right */}
              <Card className="flex-1 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="font-bold text-[#1A1523] text-sm font-heading">{post.user_name}</h3>
                    <p className="text-xs text-[#6B7280]">📍 {post.location} • {post.time_ago}</p>
                  </div>
                  <Badge variant="primary" size="sm">{post.category}</Badge>
                </div>

                <div>
                  <h4 className="font-extrabold text-base text-[#1A1523] font-heading">{post.trip_title}</h4>
                  <p className="text-sm text-[#6B7280] leading-relaxed mt-1">{post.content}</p>
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
          ))}
        </div>

        {/* Right Sidebar: Info Panel (Screen 10 Spec) */}
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
                <Button variant="primary" size="sm" className="w-full">
                  + Share Your Experience
                </Button>
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
