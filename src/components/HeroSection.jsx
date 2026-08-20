import React from 'react';
import { MapPin, Camera } from 'lucide-react';

export default function HeroSection({ 
  totalPosts, 
  totalLocations,
  totalPhotos, 
  activeView = 'posts', 
  onViewChange 
}) {
  const handlePillClick = (viewName) => {
    if (!onViewChange) return;
    // Toggle: clicking active view returns to 'posts' (all posts view)
    if (activeView === viewName) {
      onViewChange('posts');
    } else {
      onViewChange(viewName);
    }
  };

  const locationCount = totalLocations !== undefined ? totalLocations : totalPosts;

  return (
    <section className="apple-hero-section">
      <div className="hero-content">
        <h1 className="hero-headline hero-headline-caps">
          OUR TRAVEL DIARY
        </h1>
        
        <div className="hero-stats-group">
          <div className="apple-stat-pill">
            <MapPin size={14} className="stat-icon" />
            <span>함께한 여행지 <strong>{locationCount}</strong>곳</span>
          </div>

          <button
            type="button"
            className={`apple-stat-pill interactive ${activeView === 'photos' ? 'active' : ''}`}
            onClick={() => handlePillClick('photos')}
            aria-pressed={activeView === 'photos'}
            title={activeView === 'photos' ? '전체 여행기로 돌아가기' : '사진 갤러리로 모아보기'}
          >
            <Camera size={14} className="stat-icon" />
            <span>간직한 사진 <strong>{totalPhotos}</strong>장</span>
            {activeView === 'photos' && <span className="stat-pill-active-dot" />}
          </button>
        </div>
      </div>
    </section>
  );
}
