import React, { useState, useRef } from 'react';
import { ArrowLeft, RotateCw, Calendar } from 'lucide-react';

export default function PromiseCalendar({ onResetView }) {
  // Calendar URL from environment variable
  const calendarUrl = import.meta.env.VITE_NAVER_CALENDAR_URL || '';
  
  // State to force-reload iframe
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRotating, setIsRotating] = useState(false);

  // 모바일 탭(클릭) 가로채기 상태: 스크롤은 통과시키고 탭 순간에만 클릭을 삼킴
  const [isClickBlocked, setIsClickBlocked] = useState(false);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const blockTimerRef = useRef(null);

  // Handle manual reload
  const handleReload = () => {
    setIsRotating(true);
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
    setTimeout(() => {
      setIsRotating(false);
    }, 800);
  };

  // 모바일 터치 시작
  const handleTouchStart = (e) => {
    if (e.touches && e.touches[0]) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now()
      };
    }
  };

  // 모바일 터치 끝: 제자리 탭(클릭)인 경우에만 350ms간 클릭 블로커를 활성화하여 일간 뷰 전환 차단
  const handleTouchEnd = (e) => {
    if (e.changedTouches && e.changedTouches[0]) {
      const dx = Math.abs(e.changedTouches[0].clientX - touchStartRef.current.x);
      const dy = Math.abs(e.changedTouches[0].clientY - touchStartRef.current.y);
      const dt = Date.now() - touchStartRef.current.time;

      // 손가락 이동이 8px 미만이고 400ms 미만의 탭 시도인 경우:
      // 브라우저의 pending click 이벤트를 가로채기 위해 350ms간 블로커 활성화
      if (dx < 8 && dy < 8 && dt < 400) {
        setIsClickBlocked(true);
        if (blockTimerRef.current) clearTimeout(blockTimerRef.current);
        blockTimerRef.current = setTimeout(() => {
          setIsClickBlocked(false);
        }, 350);
      }
    }
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

              <div 
                className="calendar-iframe-scroll-wrapper"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
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
                  2. 모바일 상단 50px 헤더 클릭 차단 오버레이
                     - 2026. 10. 년/월 텍스트는 선명하게 보임
                     - 화살표(▼) 피커 열림 기능 원천 차단!
                     - 우측 상단 일간 보기 버튼도 함께 원천 차단!
                */}
                <div 
                  className="calendar-mobile-header-blocker" 
                  aria-hidden="true"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                />

                {/* 
                  3. 모바일 날짜 탭 클릭 차단 오버레이 (스마트 인터셉터)
                     - 손가락 상하 스크롤 중에는 pointer-events: none 상태라 월 스크롤이 부드럽게 동작!
                     - 사용자가 날짜를 '탭(클릭)'한 순간에만 0.35초간 켜져서 클릭을 삼켜 일간 뷰 전환 방지!
                */}
                <div 
                  className={`calendar-mobile-tap-interceptor ${isClickBlocked ? 'active' : ''}`}
                  title="일정 조회 전용"
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
