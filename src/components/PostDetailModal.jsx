import React from 'react';
import { X, MapPin, Calendar, CalendarDays, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import { formatImageUrl } from '../utils/imageUtils';

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
  const displayDateText = post.date || post.startDate || '';

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
                          {block.dayDate && <span className="apple-day-date">{block.dayDate}</span>}
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
                        {block.content.split('\n').map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    );
                  case 'image':
                    return (
                      <figure key={block.id || idx} className="apple-block-figure">
                        <img 
                          src={formatImageUrl(block.url)} 
                          alt={block.caption || '여행 사진'} 
                          className="apple-block-img"
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80";
                          }}
                        />
                        {block.caption && (
                          <figcaption className="apple-block-caption">
                            <ImageIcon size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                            {block.caption}
                          </figcaption>
                        )}
                      </figure>
                    );
                  default:
                    return null;
                }
              })
            ) : (
              <div className="apple-block-text">
                {post.content && post.content.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            )}
          </article>
        </div>
      </div>
    </div>
  );
}
