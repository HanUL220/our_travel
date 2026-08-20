import React, { useState, useMemo } from 'react';
import { 
  MapPin, 
  ArrowLeft, 
  Plus 
} from 'lucide-react';
import { KOREA_REGIONS, REGION_MAP, groupPostsByRegion } from '../utils/koreaRegionMapper';
import { KOREA_MAP_PATHS } from '../data/koreaMapSvgData';
import PostCard from './PostCard';

export default function KoreaMapCollection({ 
  posts = [], 
  onSelectPost, 
  onOpenCreate,
  onResetView 
}) {
  // Currently selected region ID (null for all posts, or 'seoul', 'gangwon', etc.)
  const [selectedRegionId, setSelectedRegionId] = useState(null);
  const [hoveredRegionId, setHoveredRegionId] = useState(null);

  // Group all posts by 17 regions
  const groupedData = useMemo(() => {
    return groupPostsByRegion(posts);
  }, [posts]);

  // Selected region metadata
  const selectedRegion = selectedRegionId ? (REGION_MAP[selectedRegionId] || groupedData[selectedRegionId]?.region) : null;

  // Filtered posts for the selected region (or all posts if null)
  const displayedPosts = useMemo(() => {
    if (!selectedRegionId) return posts;
    return groupedData[selectedRegionId]?.posts || [];
  }, [selectedRegionId, groupedData, posts]);

  const handleRegionClick = (regionId) => {
    // Toggle: clicking active region clears selection
    if (selectedRegionId === regionId) {
      setSelectedRegionId(null);
    } else {
      setSelectedRegionId(regionId);
    }
  };

  return (
    <div className="korea-map-collection-container">
      {/* Top Navigation Bar */}
      <div className="map-view-header">
        <button 
          type="button" 
          className="map-back-btn" 
          onClick={onResetView}
          title="전체 타임라인 피드로 돌아가기"
        >
          <ArrowLeft size={16} />
          <span>전체 피드로 돌아가기</span>
        </button>
      </div>

      {/* Main 2-Column Split Section */}
      <div className="korea-map-main-layout">
        {/* Left Column: Interactive Korea SVG Map */}
        <div className="map-interactive-card">
          <div className="map-card-header">
            <div className="map-card-title-row">
              <span className="map-card-emoji">🗺️</span>
              <div>
                <h3 className="map-card-title">시·도별 함께한 지도</h3>
                <p className="map-card-subtitle">
                  지도의 지역을 클릭하면 해당 지역의 여행기만 모아볼 수 있어요.
                </p>
              </div>
            </div>

            {selectedRegionId && (
              <button 
                type="button" 
                className="map-clear-filter-btn"
                onClick={() => setSelectedRegionId(null)}
              >
                전체 지역 보기
              </button>
            )}
          </div>

          {/* Quick Region Selector Pills */}
          <div className="map-region-pills-bar" role="tablist" aria-label="지역 빠른 선택">
            <button
              type="button"
              className={`region-pill-btn ${selectedRegionId === null ? 'active' : ''}`}
              onClick={() => setSelectedRegionId(null)}
            >
              전체 ({posts.length})
            </button>
            {KOREA_REGIONS.map(reg => {
              const count = groupedData[reg.id]?.count || 0;
              const isVisited = count > 0;
              const isSelected = selectedRegionId === reg.id;

              return (
                <button
                  key={reg.id}
                  type="button"
                  className={`region-pill-btn ${isSelected ? 'active' : ''} ${isVisited ? 'visited' : 'unvisited'}`}
                  onClick={() => handleRegionClick(reg.id)}
                  title={`${reg.fullName} (${count}개 기록)`}
                >
                  <span className="pill-name">{reg.name}</span>
                  {count > 0 && <span className="pill-count">{count}</span>}
                </button>
              );
            })}
          </div>

          {/* SVG Map Container */}
          <div className="korea-svg-wrapper">
            <svg 
              className="korea-vector-map" 
              viewBox="0 0 540 720" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Glow filter for active/visited regions */}
                <filter id="mapGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="rgba(255, 45, 85, 0.45)" />
                </filter>
                <filter id="hoverGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="rgba(0, 122, 255, 0.35)" />
                </filter>
                <linearGradient id="visitedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF2D55" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#FF6482" stopOpacity="0.95" />
                </linearGradient>
                <linearGradient id="selectedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF2D55" stopOpacity="1" />
                  <stop offset="100%" stopColor="#E00034" stopOpacity="1" />
                </linearGradient>
              </defs>

              {/* Map Region Paths */}
              <g className="map-regions-group">
                {KOREA_MAP_PATHS.map((item) => {
                  const regId = item.id;
                  const count = groupedData[regId]?.count || 0;
                  const isVisited = count > 0;
                  const isSelected = selectedRegionId === regId;
                  const isHovered = hoveredRegionId === regId;

                  let regionClassName = 'korea-region-path';
                  if (isSelected) regionClassName += ' is-selected';
                  else if (isVisited) regionClassName += ' is-visited';
                  else regionClassName += ' is-unvisited';
                  if (isHovered) regionClassName += ' is-hovered';

                  return (
                    <path
                      key={regId}
                      id={`region-${regId}`}
                      d={item.d}
                      className={regionClassName}
                      onClick={() => handleRegionClick(regId)}
                      onMouseEnter={() => setHoveredRegionId(regId)}
                      onMouseLeave={() => setHoveredRegionId(null)}
                      filter={isSelected ? 'url(#mapGlow)' : isHovered ? 'url(#hoverGlow)' : undefined}
                    >
                      <title>{`${item.fullName}: ${count}개의 여행 기록`}</title>
                    </path>
                  );
                })}
              </g>

              {/* Dokdo & Ulleungdo Callout Annotations */}
              <g className="map-islands-annotations">
                <text x="475" y="172" className="island-label">울릉도</text>
                <text x="502" y="182" className="island-label">독도</text>
              </g>

              {/* Region Label & Count Badges */}
              <g className="map-labels-group" pointerEvents="none">
                {KOREA_MAP_PATHS.map((item) => {
                  const regId = item.id;
                  const count = groupedData[regId]?.count || 0;
                  const isVisited = count > 0;
                  const isSelected = selectedRegionId === regId;
                  const pos = item.badgePos || item.center;

                  return (
                    <g 
                      key={`label-${regId}`} 
                      transform={`translate(${pos.x}, ${pos.y})`}
                      className={`map-badge-node ${isVisited ? 'has-visits' : ''} ${isSelected ? 'selected' : ''}`}
                    >
                      {isVisited ? (
                        <>
                          <circle 
                            r={isSelected ? 16 : 14} 
                            className="map-badge-bubble" 
                          />
                          <text 
                            y="-2" 
                            textAnchor="middle" 
                            className="map-badge-text name"
                          >
                            {item.name}
                          </text>
                          <text 
                            y="9" 
                            textAnchor="middle" 
                            className="map-badge-text count"
                          >
                            {count}
                          </text>
                        </>
                      ) : (
                        <text 
                          textAnchor="middle" 
                          className="map-simple-label"
                        >
                          {item.name}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        </div>

        {/* Right Column: Filtered Region Post List */}
        <div className="map-posts-section">
          <div className="region-posts-header-card">
            <div className="region-header-info">
              <span className="region-header-emoji">
                {selectedRegion ? selectedRegion.emoji : '✨'}
              </span>
              <div>
                <h2 className="region-header-title">
                  {selectedRegion ? selectedRegion.fullName : '전체 여행 기록'}
                </h2>
                <p className="region-header-desc">
                  {selectedRegion ? (
                    displayedPosts.length > 0 
                      ? `${selectedRegion.name}에서 함께 만든 ${displayedPosts.length}개의 소중한 추억들`
                      : `${selectedRegion.name}에 아직 등록된 여행기가 없습니다.`
                  ) : (
                    `우리가 함께한 총 ${posts.length}개의 여행기록`
                  )}
                </p>
              </div>
            </div>

            {selectedRegion && (
              <button
                type="button"
                className="region-create-cta"
                onClick={() => onOpenCreate && onOpenCreate({ location: selectedRegion.name })}
                title={`${selectedRegion.name} 여행 기록 추가`}
              >
                <Plus size={14} />
                <span>이 지역 추억 기록</span>
              </button>
            )}
          </div>

          {/* Posts Grid or Region Empty State */}
          {displayedPosts.length > 0 ? (
            <div className="region-posts-grid">
              {displayedPosts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onSelectPost={onSelectPost}
                />
              ))}
            </div>
          ) : (
            <div className="region-empty-state-card">
              <div className="empty-state-emoji">{selectedRegion ? selectedRegion.emoji : '✈️'}</div>
              <h3 className="empty-state-title">
                아직 <strong>{selectedRegion ? selectedRegion.fullName : '이 지역'}</strong>에 함께한 여행기가 없어요
              </h3>
              <p className="empty-state-text">
                둘만의 다음 여행지로 {selectedRegion ? selectedRegion.name : '이곳'}을 계획해보는 건 어떨까요? 🚗💨
              </p>
              <button 
                type="button" 
                className="apple-header-cta"
                onClick={() => onOpenCreate && onOpenCreate({ location: selectedRegion ? selectedRegion.name : '' })}
              >
                <Plus size={15} />
                <span>{selectedRegion ? selectedRegion.name : '이 지역'}에 첫 추억 남기기</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
