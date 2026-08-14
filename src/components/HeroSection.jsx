import React from 'react';
import { MapPin, Camera } from 'lucide-react';

export default function HeroSection({ totalPosts, totalPhotos }) {
  return (
    <section className="apple-hero-section">
      <div className="hero-content">
        <h1 className="hero-headline hero-headline-caps">
          OUR TRAVEL DIARY
        </h1>
        
        <div className="hero-stats-group">
          <div className="apple-stat-pill">
            <MapPin size={14} className="stat-icon" />
            <span>함께한 여행지 <strong>{totalPosts}</strong>곳</span>
          </div>
          <div className="apple-stat-pill">
            <Camera size={14} className="stat-icon" />
            <span>간직한 사진 <strong>{totalPhotos}</strong>장</span>
          </div>
        </div>
      </div>
    </section>
  );
}
