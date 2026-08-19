import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Camera, MapPin, Calendar, X, ChevronLeft, ChevronRight, BookOpen, Sparkles, Image as ImageIcon } from 'lucide-react';
import { formatImageUrl } from '../utils/imageUtils';
import { formatDisplayDate } from '../utils/dateUtils';

export default function PhotosGallery({ posts = [], searchQuery = '', onSelectPost, onResetView }) {
  // Extract all photos across all posts
  const allPhotos = useMemo(() => {
    const photos = [];

    posts.forEach(post => {
      const postDateText = formatDisplayDate(post.date || post.startDate);

      // 1. Cover photo
      if (post.mainImage) {
        photos.push({
          id: `${post.id}-cover`,
          url: post.mainImage,
          caption: post.summary || '대표 사진',
          isCover: true,
          post,
          postTitle: post.title,
          postLocation: post.location,
          postDate: postDateText,
          sortDate: post.startDate || post.date || '',
        });
      }

      // 2. Block photos
      if (post.blocks && Array.isArray(post.blocks)) {
        post.blocks.forEach((block, bIdx) => {
          if (block.type === 'image' && block.url) {
            photos.push({
              id: `${post.id}-block-${block.id || bIdx}`,
              url: block.url,
              caption: block.caption || '',
              isCover: false,
              post,
              postTitle: post.title,
              postLocation: post.location,
              postDate: postDateText,
              dayTitle: block.dayTitle || '',
              sortDate: post.startDate || post.date || '',
            });
          }
        });
      }
    });

    // Sort newest first
    return photos.sort((a, b) => b.sortDate.localeCompare(a.sortDate));
  }, [posts]);

  // Filter photos by searchQuery
  const filteredPhotos = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return allPhotos;

    return allPhotos.filter(photo => {
      const inCaption = photo.caption?.toLowerCase().includes(q);
      const inTitle = photo.postTitle?.toLowerCase().includes(q);
      const inLocation = photo.postLocation?.toLowerCase().includes(q);
      const inDate = photo.postDate?.toLowerCase().includes(q);
      return inCaption || inTitle || inLocation || inDate;
    });
  }, [allPhotos, searchQuery]);

  // Lightbox Modal State
  const [activePhotoIndex, setActivePhotoIndex] = useState(null);

  const activePhoto = activePhotoIndex !== null ? filteredPhotos[activePhotoIndex] : null;

  const handlePrev = useCallback((e) => {
    if (e) e.stopPropagation();
    if (activePhotoIndex > 0) {
      setActivePhotoIndex(prev => prev - 1);
    } else {
      setActivePhotoIndex(filteredPhotos.length - 1); // loop
    }
  }, [activePhotoIndex, filteredPhotos.length]);

  const handleNext = useCallback((e) => {
    if (e) e.stopPropagation();
    if (activePhotoIndex < filteredPhotos.length - 1) {
      setActivePhotoIndex(prev => prev + 1);
    } else {
      setActivePhotoIndex(0); // loop
    }
  }, [activePhotoIndex, filteredPhotos.length]);

  const handleCloseLightbox = useCallback(() => {
    setActivePhotoIndex(null);
  }, []);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (activePhotoIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleCloseLightbox();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhotoIndex, handleCloseLightbox, handlePrev, handleNext]);

  const handleGoToPost = (post) => {
    handleCloseLightbox();
    if (onSelectPost) {
      onSelectPost(post);
    }
  };

  return (
    <div className="photos-gallery-view">
      {/* View Header Banner */}
      <div className="view-mode-header">
        <div className="view-mode-info">
          <div className="view-mode-badge photo-badge">
            <Camera size={15} />
            <span>간직한 사진 갤러리</span>
          </div>
          <p className="view-mode-desc">
            둘만의 모든 순간을 담은 <strong>{allPhotos.length}장</strong>의 사진 아카이브입니다.
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

      {filteredPhotos.length > 0 ? (
        <div className="photos-grid-layout">
          {filteredPhotos.map((photo, index) => (
            <div 
              key={photo.id} 
              className="gallery-photo-card"
              onClick={() => setActivePhotoIndex(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActivePhotoIndex(index);
                }
              }}
            >
              <div className="gallery-image-wrapper">
                <img 
                  src={formatImageUrl(photo.url)} 
                  alt={photo.caption || photo.postTitle}
                  className="gallery-photo-img"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80";
                  }}
                />
                
                {/* Hover / Tap Overlay Info */}
                <div className="gallery-photo-overlay">
                  <div className="overlay-top">
                    <span className="overlay-location-chip">
                      <MapPin size={11} />
                      {photo.postLocation}
                    </span>
                    {photo.isCover && (
                      <span className="overlay-cover-chip">대표</span>
                    )}
                  </div>

                  <div className="overlay-bottom">
                    <p className="overlay-title">{photo.postTitle}</p>
                    {photo.caption && (
                      <p className="overlay-caption">{photo.caption}</p>
                    )}
                    <span className="overlay-date">{photo.postDate}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="photos-empty-state">
          <ImageIcon size={42} className="empty-icon" />
          <h3>해당하는 사진을 찾을 수 없어요</h3>
          <p>다른 검색어로 검색하거나 새로운 추억 사진을 등록해 보세요.</p>
        </div>
      )}

      {/* Lightbox Modal */}
      {activePhoto && (
        <div className="photo-lightbox-overlay" onClick={handleCloseLightbox}>
          <div className="photo-lightbox-container" onClick={(e) => e.stopPropagation()}>
            {/* Top Bar Controls */}
            <div className="lightbox-top-bar">
              <div className="lightbox-counter">
                {activePhotoIndex + 1} / {filteredPhotos.length}
              </div>
              <button 
                className="lightbox-close-btn" 
                onClick={handleCloseLightbox}
                aria-label="닫기 (ESC)"
                title="닫기 (ESC)"
              >
                <X size={20} />
              </button>
            </div>

            {/* Main Stage with Navigation */}
            <div className="lightbox-stage">
              {filteredPhotos.length > 1 && (
                <button 
                  className="lightbox-nav-btn prev" 
                  onClick={handlePrev}
                  aria-label="이전 사진"
                >
                  <ChevronLeft size={28} />
                </button>
              )}

              <div className="lightbox-image-wrap">
                <img 
                  src={formatImageUrl(activePhoto.url)} 
                  alt={activePhoto.caption || activePhoto.postTitle}
                  className="lightbox-main-img" 
                />
              </div>

              {filteredPhotos.length > 1 && (
                <button 
                  className="lightbox-nav-btn next" 
                  onClick={handleNext}
                  aria-label="다음 사진"
                >
                  <ChevronRight size={28} />
                </button>
              )}
            </div>

            {/* Bottom Meta & Post Link */}
            <div className="lightbox-bottom-bar">
              <div className="lightbox-info">
                <div className="lightbox-meta-chips">
                  <span className="lightbox-meta-item">
                    <MapPin size={13} className="meta-icon" />
                    {activePhoto.postLocation}
                  </span>
                  <span className="lightbox-meta-item">
                    <Calendar size={13} className="meta-icon" />
                    {activePhoto.postDate}
                  </span>
                </div>
                <h4 className="lightbox-post-title">{activePhoto.postTitle}</h4>
                {activePhoto.caption && (
                  <p className="lightbox-caption">{activePhoto.caption}</p>
                )}
              </div>

              <button 
                className="lightbox-post-link-btn"
                onClick={() => handleGoToPost(activePhoto.post)}
              >
                <BookOpen size={15} />
                <span>해당 여행기 보기</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
