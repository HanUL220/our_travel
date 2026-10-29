import React, { useState } from 'react';
import { ArrowLeft, RotateCw, Calendar } from 'lucide-react';

export default function PromiseCalendar({ onResetView }) {
  // Calendar URL from environment variable (no hardcoded fallback for privacy)
  const calendarUrl = import.meta.env.VITE_NAVER_CALENDAR_URL || '';
  
  // State to force-reload iframe
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRotating, setIsRotating] = useState(false);

  // Handle manual reload
  const handleReload = () => {
    setIsRotating(true);
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
    setTimeout(() => {
      setIsRotating(false);
    }, 800);
  };

  return (
    <div className="promise-calendar-container animate-fade-in">
      {/* Top Header Navigation */}
      <div className="calendar-view-header">
        <button 
          type="button" 
          className="map-back-btn" 
          onClick={onResetView}
          title="전체 타임라인 피드로 돌아가기"
        >
          <ArrowLeft size={16} />
          <span>전체 피드로 돌아가기</span>
        </button>

        <div className="calendar-header-actions">
          {/* 실시간 연동 중 뱃지 (새로고침 왼쪽) */}
          <div className="live-sync-indicator" title="네이버 클라우드와 실시간 동기화 상태입니다">
            <span className="pulse-dot" />
            <span className="sync-text">실시간 연동 중</span>
          </div>

          {/* 새로고침 버튼 */}
          <button
            type="button"
            className={`calendar-action-btn ${isRotating ? 'rotating' : ''}`}
            onClick={handleReload}
            title="캘린더 새로고침"
          >
            <RotateCw size={15} />
            <span className="action-btn-text">새로고침</span>
          </button>
        </div>
      </div>

      {/* Main Calendar Card */}
      <div className="calendar-card-frame">
        {/* Card Header Bar (깔끔하게 타이틀만 유지) */}
        <div className="calendar-card-header">
          <div className="calendar-badge">
            <Calendar size={18} className="calendar-title-icon" />
            <span>약속 캘린더</span>
          </div>
        </div>

        {/* Iframe Viewport Container */}
        <div className="calendar-iframe-viewport">
          {!calendarUrl ? (
            <div className="calendar-loading-overlay">
              <p style={{ fontWeight: 600, color: 'var(--apple-foreground)' }}>네이버 캘린더 주소가 설정되지 않았습니다</p>
              <p style={{ fontSize: '0.84rem', color: 'var(--apple-muted)' }}>
                .env 파일 또는 GitHub Secrets에 VITE_NAVER_CALENDAR_URL을 등록해 주세요.
              </p>
            </div>
          ) : (
            <>
              {isLoading && (
                <div className="calendar-loading-overlay">
                  <div className="apple-spinner" />
                  <p>네이버 약속 캘린더 불러오는 중...</p>
                </div>
              )}

              <div className="calendar-iframe-scroll-wrapper">
                <iframe
                  key={iframeKey}
                  src={calendarUrl}
                  title="네이버 약속 캘린더"
                  className={`calendar-iframe ${isLoading ? 'loading' : 'loaded'}`}
                  onLoad={() => setIsLoading(false)}
                  loading="eager"
                />

                {/* 
                  1. 데스크톱용 일정 클릭 팝업 차단 오버레이 
                */}
                <div 
                  className="calendar-schedule-click-blocker" 
                  title="일정 조회 전용"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                />

                {/* 
                  2. 모바일용 우측 상단 일간 보기 버튼 가림막 (보이지도 않고 눌리지도 않게 차단)
                */}
                <div 
                  className="calendar-mobile-hide-right-menu" 
                  aria-hidden="true"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


