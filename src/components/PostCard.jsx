import React from 'react';
import { MapPin, Calendar, CalendarDays } from 'lucide-react';
import { formatImageUrl } from '../utils/imageUtils';
import { formatDisplayDate } from '../utils/dateUtils';

export default function PostCard({ post, onSelectPost }) {
  const imageUrl = formatImageUrl(post.mainImage);
  const isMultiDay = post.tripType === 'multi' || post.date?.includes(' ~ ');
  const formattedDate = formatDisplayDate(post.date);

  return (
    <article className="post-card" onClick={() => onSelectPost(post)}>
      <div className="card-image-wrap">
        <img 
          src={imageUrl} 
          alt={post.title} 
          className="card-image"
          loading="lazy"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80";
          }}
        />
        {post.durationText && (
          <span className="card-duration-badge">{post.durationText}</span>
        )}
      </div>

      <div className="card-content">
        <div className="card-meta">
          <div className="card-meta-item">
            {isMultiDay ? <CalendarDays size={13} className="meta-icon" /> : <Calendar size={13} className="meta-icon" />}
            <span>{formattedDate}</span>
          </div>
          <div className="card-meta-item">
            <MapPin size={13} className="meta-icon" />
            <span>{post.location}</span>
          </div>
        </div>

        <h3 className="card-title">{post.title}</h3>
      </div>
    </article>
  );
}
