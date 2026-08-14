import React from 'react';
import { X, MapPin, Calendar, CalendarDays, Edit2, Trash2, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { formatImageUrl } from '../utils/imageUtils';
import { formatDisplayDate } from '../utils/dateUtils';

export default function PostDetailModal({ post, onClose, onEditPost, onDeletePost }) {
  if (!post) return null;

  const handleDelete = () => {
    if (window.confirm('이 소중한 여행 추억을 정말 삭제하시겠습니까?')) {
      onDeletePost(post.id);
      onClose();
    }
  };

  const hasBlocks = post.blocks && Array.isArray(post.blocks) && post.blocks.length > 0;
  const isMultiDay = post.tripType === 'multi' || (post.startDate && post.endDate && post.startDate !== post.endDate) || post.date?.includes(' ~ ');
  const displayDateText = formatDisplayDate(post.date || post.startDate || '');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card apple-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Apple Modal Header Bar */}
        <div className="apple-modal-header">
          <div className="apple-modal-actions">
            <button 
              className="apple-action-btn apple-edit-btn" 
              onClick={() => onEditPost(post)}
              title="게시글 수정"
            >
              <Edit2 size={14} />
              <span>수정</span>
            </button>
            <button 
              className="apple-action-btn apple-delete-btn" 
              onClick={handleDelete}
              title="게시글 삭제"
            >
              <Trash2 size={14} />
              <span>삭제</span>
            </button>
          </div>
          <button className="apple-close-btn" onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </div>

        {/* Post Content Body */}
        <div className="apple-modal-body">
          <div className="apple-detail-meta-row">
            <div className="apple-meta-item">
              {isMultiDay ? <CalendarDays size={14} className="meta-icon" /> : <Calendar size={14} className="meta-icon" />}
              <span>{displayDateText}</span>
              {post.durationText && (
                <span className="apple-duration-tag">{post.durationText}</span>
              )}
            </div>
            <div className="apple-meta-item">
              <MapPin size={14} className="meta-icon" />
              <span>{post.location}</span>
            </div>
          </div>

          <h1 className="apple-detail-title">{post.title}</h1>

          {/* Cover image if available */}
          {post.mainImage && (
            <div className="apple-cover-image-wrap">
              <img 
                src={formatImageUrl(post.mainImage)} 
                alt={post.title}
                className="apple-cover-image" 
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Content Blocks */}
          <article className="apple-blog-content">
            {hasBlocks ? (
              post.blocks.map((block, idx) => {
                switch (block.type) {
                  case 'day':
                    return (
                      <div key={block.id || idx} className="apple-day-divider">
                        <div className="apple-day-pill">
                          <span className="apple-day-title">{block.dayTitle || '일정'}</span>
                          {block.dayDate && <span className="apple-day-date">{formatDisplayDate(block.dayDate)}</span>}
                        </div>
                        <div className="apple-day-line" />
                      </div>
                    );
                  case 'heading':
                    return (
                      <h3 key={block.id || idx} className="apple-block-heading">
                        {block.content}
                      </h3>
                    );
                  case 'text':
                    return (
                      <div key={block.id || idx} className="apple-block-text">
                        <p>{block.content}</p>
                      </div>
                    );
                  case 'place': {
                    if (!block.placeName || !block.placeName.trim()) return null;
                    const placeName = block.placeName.trim();
                    const kakaoMapUrl = `https://map.kakao.com/link/search/${encodeURIComponent(placeName)}`;
                    const naverMapUrl = `https://map.naver.com/v5/search/${encodeURIComponent(placeName)}`;

                    return (
                      <div key={block.id || idx} className="apple-spot-badge-card">
                        <div className="apple-spot-main-info">
                          <MapPin size={16} className="apple-spot-icon" />
                          <span className="apple-spot-name">{placeName}</span>
                        </div>

                        <div className="apple-spot-map-links">
                          <a 
                            href={kakaoMapUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="apple-map-link-btn"
                            title="카카오맵에서 위치 보기"
                          >
                            <span>카카오맵</span>
                            <ExternalLink size={11} />
                          </a>
                          <a 
                            href={naverMapUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="apple-map-link-btn"
                            title="네이버 지도에서 위치 보기"
                          >
                            <span>네이버 지도</span>
                            <ExternalLink size={11} />
                          </a>
                        </div>
                      </div>
                    );
                  }
                  case 'image':
                    return (
                      <figure key={block.id || idx} className="apple-block-figure">
                        {block.url ? (
                          <img 
                            src={formatImageUrl(block.url)} 
                            alt={block.caption || '여행 사진'} 
                            className="apple-block-img"
                            loading="lazy"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div style={{ padding: '2rem', background: 'var(--apple-canvas)', borderRadius: 'var(--radius-card)', color: 'var(--apple-muted)', fontSize: '13px' }}>
                            <ImageIcon size={24} style={{ marginBottom: '0.4rem', opacity: 0.5 }} />
                            <div>등록된 사진이 없습니다.</div>
                          </div>
                        )}
                        {block.caption && (
                          <figcaption className="apple-block-caption">{block.caption}</figcaption>
                        )}
                      </figure>
                    );
                  default:
                    return null;
                }
              })
            ) : (
              <div className="apple-block-text">
                <p>{post.content || '작성된 본문 내용이 없습니다.'}</p>
              </div>
            )}
          </article>
        </div>
      </div>
    </div>
  );
}
