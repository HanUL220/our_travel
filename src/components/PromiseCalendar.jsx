import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RotateCw, Calendar } from 'lucide-react';

export default function PromiseCalendar({ onResetView }) {
  // Calendar URL from environment variable
  const calendarUrl = import.meta.env.VITE_NAVER_CALENDAR_URL || '';
  
  // State to force-reload iframe
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRotating, setIsRotating] = useState(false);

  // DOM refs for synchronous touch/click interception
  const wrapperRef = useRef(null);
  const interceptorRef = useRef(null);

  // Handle manual reload
  const handleReload = () => {
    setIsRotating(true);
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
    setTimeout(() => {
      setIsRotating(false);
    }, 800);
  };

  // 모바일 전용: 상하단 월 스크롤은 100% 유지하면서, 날짜 탭(클릭 시 일간 뷰 전환)만 동기적으로 요격
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const interceptor = interceptorRef.current;
    if (!wrapper || !interceptor) return;

    let startX = 0;
    let startY = 0;
    let isScroll = false;
    let blockTimer = null;

    const onTouchStart = (e) => {
      if (e.touches && e.touches[0]) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isScroll = false;
      }
    };

    const onTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        const dx = Math.abs(e.touches[0].clientX - startX);
        const dy = Math.abs(e.touches[0].clientY - startY);
        // 손가락이 5px 이상 움직이면 상하단 월 스크롤 중임
        if (dy > 5 || dx > 5) {
          isScroll = true;
          // 스크롤 중에는 인터셉터를 꺼서 iframe 내부 상하 스크롤이 매끄럽게 작동하도록 통과
          interceptor.style.pointerEvents = 'none';
        }
      }
    };

    const onTouchEnd = () => {
      // 손가락 이동이 없었다면 단순 탭(날짜 클릭) 시도임!
      if (!isScroll) {
        // 즉시 동기(Synchronous)로 인터셉터의 pointer-events를 auto로 켜서 브라우저의 pending click을 가로챔!
        interceptor.style.pointerEvents = 'auto';

        if (blockTimer) clearTimeout(blockTimer);
        blockTimer = setTimeout(() => {
          if (interceptor) {
            interceptor.style.pointerEvents = 'none';
          }
        }, 400);
      }
    };

    // capture phase로 부모 창에서 먼저 터치를 감지
    wrapper.addEventListener('touchstart', onTouchStart, { capture: true, passive: true });
    wrapper.addEventListener('touchmove', onTouchMove, { capture: true, passive: true });
    wrapper.addEventListener('touchend', onTouchEnd, { capture: true, passive: true });

    return () => {
      wrapper.removeEventListener('touchstart', onTouchStart, { capture: true });
      wrapper.removeEventListener('touchmove', onTouchMove, { capture: true });
      wrapper.removeEventListener('touchend', onTouchEnd, { capture: true });
      if (blockTimer) clearTimeout(blockTimer);
    };
  }, []);

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
                ref={wrapperRef}
                className="calendar-iframe-scroll-wrapper"
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
                  2. 모바일 우측 상단 일간 보기 버튼 가림막 (불투명 흰색으로 덮어 완전히 지워버림)
                */}
                <div 
                  className="calendar-mobile-hide-right-menu" 
                  aria-hidden="true"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                />

                {/* 
                  3. 모바일 상단 52px 헤더 클릭 차단 레이어
                     - 2026. 10. 년/월 텍스트는 선명하게 보임
                     - 화살표(▼) 피커 열림 기능 원천 차단!
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
                  4. 모바일 날짜 탭 클릭 차단 스마트 인터셉터
                     - 상하단 스크롤 중에는 pointer-events: none 으로 풀려 부드럽게 스크롤 통과!
                     - 날짜를 제자리에서 탭(클릭)한 순간에만 동기적으로 pointer-events: auto가 켜져 일간 전환 차단!
                */}
                <div 
                  ref={interceptorRef}
                  className="calendar-mobile-tap-interceptor" 
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
