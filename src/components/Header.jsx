import React from 'react';
import { Heart, Sun, Moon, Plus } from 'lucide-react';

export default function Header({ theme, toggleTheme, onOpenNewPost, startDate = "2026-06-20" }) {
  // Calculate D-day accurately (Day 1 starts on startDate 2026-06-20)
  const calculateDDay = (dateStr) => {
    const start = new Date(dateStr + "T00:00:00");
    const today = new Date();
    const now = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diffTime = now.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const dDay = calculateDDay(startDate);
  const dDayText = dDay > 0 ? `D+${dDay}일` : `D${dDay}일`;

  return (
    <header className="site-header">
      <div className="header-inner">
        <a href="#" className="brand-logo">
          <Heart className="brand-icon" size={18} fill="currentColor" />
          <span>Our Travel</span>
        </a>

        <div className="header-actions">
          <div className="dday-badge" title={`우리가 시작한 날: ${startDate}`}>
            <span className="dday-dot" />
            <span>함께한 지 <strong>{dDayText}</strong></span>
          </div>

          <button 
            className="btn-icon" 
            onClick={toggleTheme} 
            title={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
            aria-label="테마 전환"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <button className="apple-btn-primary" onClick={onOpenNewPost}>
            <Plus size={16} />
            <span>추억 기록</span>
          </button>
        </div>
      </div>
    </header>
  );
}
