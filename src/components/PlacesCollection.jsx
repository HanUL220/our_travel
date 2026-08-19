import React, { useState, useMemo } from 'react';
import { MapPin, Calendar, Camera, ChevronRight, Sparkles, Navigation } from 'lucide-react';
import { formatImageUrl } from '../utils/imageUtils';
import { formatDisplayDate } from '../utils/dateUtils';

export default function PlacesCollection({ posts = [], searchQuery = '', onSelectPost, onResetView }) {
  // Group posts by location (case-insensitive & trimmed)
  const placeGroups = useMemo(() => {
    const map = new Map();

    posts.forEach(post => {
      const rawLoc = (post.location || '기타 여행지').trim();
      // Normalize key for grouping
      const key = rawLoc.toLowerCase();

      if (!map.has(key)) {
        map.set(key, {
          locationName: rawLoc,
          posts: [],
          allSpots: new Set(),
          totalPhotos: 0,
        });
      }

      const group = map.get(key);
      group.posts.push(post);

      // Extract spot names from place blocks
      if (post.blocks && Array.isArray(post.blocks)) {
        post.blocks.forEach(b => {
          if (b.type === 'place' && b.placeName && b.placeName.trim()) {
            group.allSpots.add(b.placeName.trim());
          }
          if (b.type === 'image' && b.url) {
            group.totalPhotos += 1;
          }
        });
      }
      if (post.mainImage) {
        group.totalPhotos += 1;
      }
    });

    // Convert map to array and sort by most recent post date
    return Array.from(map.values()).map(group => {
      // Sort posts in group by date desc
      group.posts.sort((a, b) => {
        const dateA = a.startDate || a.date || '';
        const dateB = b.startDate || b.date || '';
        return dateB.localeCompare(dateA);
      });

      const latestPost = group.posts[0];
      // Pick best cover image
      let coverImage = latestPost?.mainImage;
      if (!coverImage && latestPost?.blocks) {
        const imgBlock = latestPost.blocks.find(b => b.type === 'image' && b.url);
        if (imgBlock) coverImage = imgBlock.url;
      }

      return {
        ...group,
        latestPost,
        coverImage,
        spotsList: Array.from(group.allSpots),
      };
    });
  }, [posts]);

  // Filter based on searchQuery
  const filteredGroups = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return placeGroups;

    return placeGroups.filter(group => {
      const matchLocation = group.locationName.toLowerCase().includes(q);
      const matchSpots = group.spotsList.some(spot => spot.toLowerCase().includes(q));
      const matchPostTitle = group.posts.some(p => p.title?.toLowerCase().includes(q));
      return matchLocation || matchSpots || matchPostTitle;
    });
  }, [placeGroups, searchQuery]);

  // State to expand multi-post drawer for a location if needed
  const [expandedLocation, setExpandedLocation] = useState(null);

  const handleCardClick = (group) => {
    if (group.posts.length === 1) {
      onSelectPost(group.posts[0]);
    } else {
      setExpandedLocation(prev => (prev === group.locationName ? null : group.locationName));
    }
  };

  return (
    <div className="places-collection-view">
      {/* View Header Banner */}
      <div className="view-mode-header">
        <div className="view-mode-info">
          <div className="view-mode-badge">
            <MapPin size={15} />
            <span>함께한 여행지 모아보기</span>
          </div>
          <p className="view-mode-desc">
            둘만의 발자국이 닿았던 <strong>{placeGroups.length}곳</strong>의 소중한 여행지 목록입니다.
          </p>
        </div>
        {onResetView && (
          <button 
            type="button" 
            className="view-mode-reset-btn" 
            onClick={onResetView}
            title="전체 게시글 피드로 돌아가기"
          >
            전체 피드 보기
          </button>
        )}
      </div>

      {filteredGroups.length > 0 ? (
        <div className="places-grid">
          {filteredGroups.map(group => {
            const isExpanded = expandedLocation === group.locationName;
            const latestDate = group.latestPost?.date || group.latestPost?.startDate;
            const formattedDate = latestDate ? formatDisplayDate(latestDate) : '';

            return (
              <div 
                key={group.locationName} 
                className={`place-card ${isExpanded ? 'is-expanded' : ''}`}
              >
                {/* Card Main Action Area */}
                <div 
                  className="place-card-main" 
                  onClick={() => handleCardClick(group)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCardClick(group);
                    }
                  }}
                >
                  {/* Place Cover Image */}
                  <div className="place-card-image-wrap">
                    <img 
                      src={formatImageUrl(group.coverImage)} 
                      alt={group.locationName}
                      className="place-card-image"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80";
                      }}
                    />
                    <div className="place-card-badges">
                      <span className="place-count-badge">
                        {group.posts.length}개의 여행기
                      </span>
                      {group.totalPhotos > 0 && (
                        <span className="place-photo-count-badge">
                          <Camera size={11} /> {group.totalPhotos}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Place Content */}
                  <div className="place-card-body">
                    <div className="place-header-row">
                      <div className="place-title-wrap">
                        <MapPin size={16} className="place-pin-icon" />
                        <h3 className="place-title">{group.locationName}</h3>
                      </div>
                      <span className="place-action-hint">
                        {group.posts.length === 1 ? '여행기 보기' : isExpanded ? '접기' : '모아보기'}
                        <ChevronRight size={14} className={`action-chevron ${isExpanded ? 'rotated' : ''}`} />
                      </span>
                    </div>

                    {formattedDate && (
                      <div className="place-meta-date">
                        <Calendar size={13} className="meta-icon" />
                        <span>최근 방문: {formattedDate}</span>
                      </div>
                    )}

                    {group.spotsList.length > 0 && (
                      <div className="place-spots-flow">
                        {group.spotsList.slice(0, 4).map((spot, i) => (
                          <span key={i} className="place-spot-tag">
                            #{spot}
                          </span>
                        ))}
                        {group.spotsList.length > 4 && (
                          <span className="place-spot-tag more">
                            +{group.spotsList.length - 4}곳
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Posts Drawer (When region has multiple posts) */}
                {group.posts.length > 1 && isExpanded && (
                  <div className="place-posts-drawer">
                    <div className="drawer-divider" />
                    <div className="drawer-title-row">
                      <Navigation size={13} />
                      <span>{group.locationName} 여행기 목록 ({group.posts.length})</span>
                    </div>
                    <div className="drawer-posts-list">
                      {group.posts.map(post => (
                        <div 
                          key={post.id} 
                          className="drawer-post-item"
                          onClick={() => onSelectPost(post)}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="drawer-post-thumb">
                            <img 
                              src={formatImageUrl(post.mainImage)} 
                              alt={post.title}
                              onError={(e) => {
                                e.target.src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80";
                              }}
                            />
                          </div>
                          <div className="drawer-post-info">
                            <div className="drawer-post-title">{post.title}</div>
                            <div className="drawer-post-date">{formatDisplayDate(post.date || post.startDate)}</div>
                          </div>
                          <ChevronRight size={14} className="drawer-arrow" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="places-empty-state">
          <MapPin size={42} className="empty-icon" />
          <h3>해당하는 여행지를 찾을 수 없어요</h3>
          <p>다른 검색어로 검색하거나 전체 피드로 돌아가 보세요.</p>
        </div>
      )}
    </div>
  );
}
