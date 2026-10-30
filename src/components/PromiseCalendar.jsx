import React, { useState } from 'react';
import { ArrowLeft, RotateCw } from 'lucide-react';

export default function PromiseCalendar({ onResetView }) {
  // Calendar URL from environment variable
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
                  2. 모바일 상단 년·월 화살표(▼) 피커 차단 레이어
                     - 2026. 10. 년/월 텍스트는 선명하게 보임
                     - 화살표(▼) 피커 열림 기능 차단 유지!
                     - 우측의 일간/월간 보기 전환 버튼은 비워두어 자유롭게 클릭 활성화!
                */}
                <div 
                  className="calendar-mobile-header-blocker" 
                  aria-hidden="true"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
