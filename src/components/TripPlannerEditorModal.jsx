import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowUp, ArrowDown, Trash2, Calendar, CalendarDays, MapPin, StickyNote, CheckCircle2 } from 'lucide-react';
import { searchKnownLocations, searchKakaoPlaces, isKakaoMapConfigured } from '../utils/geoUtils';

export default function TripPlannerEditorModal({ onClose, onSaveSchedule, scheduleToEdit = null }) {
  const isEditMode = Boolean(scheduleToEdit && scheduleToEdit.id);

  const initialTripType =
    scheduleToEdit?.tripType ||
    (scheduleToEdit?.endDate && scheduleToEdit?.endDate !== scheduleToEdit?.startDate ? 'multi' : 'single');

  const todayStr = new Date().toISOString().split('T')[0];

  const [tripType, setTripType] = useState(initialTripType);
  const [startDate, setStartDate] = useState(scheduleToEdit?.startDate || todayStr);
  const [endDate, setEndDate] = useState(scheduleToEdit?.endDate || todayStr);
  const [location, setLocation] = useState(scheduleToEdit?.location || '');

  const [blocks, setBlocks] = useState(() => {
    if (scheduleToEdit?.blocks && Array.isArray(scheduleToEdit.blocks) && scheduleToEdit.blocks.length > 0) {
      return scheduleToEdit.blocks;
    }
    return [];
  });

  // Kakao Places API + Known Locations Autocomplete state
  const [activeSuggestionBlockId, setActiveSuggestionBlockId] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [searchSource, setSearchSource] = useState('local');
  const searchTimerRef = useRef(null);
  const searchRequestIdRef = useRef(0);

  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (!e.target.closest('.apple-place-autocomplete-container')) {
        setActiveSuggestionBlockId(null);
      }
    };
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, []);

  const calculateNights = (start, end) => {
    if (!start || !end) return '';
    const s = new Date(start);
    const e = new Date(end);
    const diffDays = Math.round((e - s) / (1000 * 60 * 60 * 24));
    if (diffDays > 0) return `${diffDays}박 ${diffDays + 1}일`;
    return '당일치기';
  };

  const addBlock = (type) => {
    const newId = `sched-block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    let newBlock = { id: newId, type };

    if (type === 'day') {
      const dayCount = blocks.filter(b => b.type === 'day').length + 1;
      let nextDate = startDate;
      if (startDate) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + (dayCount - 1));
        nextDate = d.toISOString().split('T')[0];
      }
      newBlock = { id: newId, type: 'day', dayTitle: `${dayCount}일차`, dayDate: nextDate };
    } else if (type === 'place') {
      newBlock = { id: newId, type: 'place', placeName: '', address: '', lat: null, lng: null, originalSpotName: '' };
    } else if (type === 'memo') {
      newBlock = { id: newId, type: 'memo', content: '' };
    }

    setBlocks(prev => [...prev, newBlock]);
  };

  const updateBlock = (id, field, value) => {
    setBlocks(prev => prev.map(block => (block.id === id ? { ...block, [field]: value } : block)));
  };

  const moveBlock = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;
    setBlocks(prev => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
  };

  const removeBlock = (id) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
  };

  const executePlaceSearch = async (blockId, rawQuery) => {
    const query = (rawQuery || '').trim();
    if (!query) {
      setSuggestions([]);
      setActiveSuggestionBlockId(null);
      setIsSearchingPlaces(false);
      return;
    }

    const requestId = ++searchRequestIdRef.current;

    if (isKakaoMapConfigured()) {
      setActiveSuggestionBlockId(blockId);
      setIsSearchingPlaces(true);

      const kakaoResults = await searchKakaoPlaces(query, 10);
      if (requestId !== searchRequestIdRef.current) return;

      setIsSearchingPlaces(false);
      if (kakaoResults !== null) {
        setSuggestions(kakaoResults);
        setSearchSource('kakao');
        setActiveSuggestionBlockId(blockId);
        return;
      }
    }

    const localResults = searchKnownLocations(query, 6);
    if (requestId !== searchRequestIdRef.current) return;
    setSuggestions(localResults);
    setSearchSource('local');
    setActiveSuggestionBlockId(localResults.length > 0 ? blockId : null);
  };

  const handlePlaceInputChange = (blockId, value) => {
    updateBlock(blockId, 'placeName', value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    const trimmed = (value || '').trim();
    if (!trimmed) {
      searchRequestIdRef.current++;
      setSuggestions([]);
      setActiveSuggestionBlockId(null);
      setIsSearchingPlaces(false);
      return;
    }

    if (isKakaoMapConfigured()) {
      setActiveSuggestionBlockId(blockId);
      setIsSearchingPlaces(true);
      searchTimerRef.current = setTimeout(() => {
        executePlaceSearch(blockId, trimmed);
      }, 250);
    } else {
      executePlaceSearch(blockId, trimmed);
    }
  };

  const handleSelectSuggestion = (blockId, spot) => {
    setBlocks(prev => prev.map(b => {
      if (b.id === blockId) {
        return {
          ...b,
          placeName: spot.name,
          address: spot.address,
          lat: spot.lat,
          lng: spot.lng,
          originalSpotName: spot.name
        };
      }
      return b;
    }));
    setActiveSuggestionBlockId(null);
    setSuggestions([]);
  };

  const handleClearCoords = (blockId) => {
    setBlocks(prev => prev.map(b => (b.id === blockId ? { ...b, address: '', lat: null, lng: null } : b)));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!location.trim()) {
      alert('여행 지역명을 입력해 주세요!');
      return;
    }
    if (tripType === 'multi' && startDate > endDate) {
      alert('종료 날짜가 시작 날짜보다 빠를 수 없습니다.');
      return;
    }

    const validBlocks = blocks.filter(b => {
      if (b.type === 'day') return (b.dayTitle || '').trim() || (b.dayDate || '').trim();
      if (b.type === 'place') return (b.placeName || '').trim();
      if (b.type === 'memo') return (b.content || '').trim();
      return false;
    });

    const formattedDate =
      tripType === 'multi' && endDate && endDate !== startDate
        ? `${startDate} ~ ${endDate}`
        : startDate;

    const durationText = tripType === 'multi' ? calculateNights(startDate, endDate) : '당일치기';

    const scheduleData = {
      id: isEditMode ? scheduleToEdit.id : `trip_${Date.now()}`,
      location: location.trim(),
      tripType,
      startDate,
      endDate: tripType === 'multi' ? endDate : startDate,
      date: formattedDate,
      durationText,
      blocks: validBlocks,
      createdAt: isEditMode ? scheduleToEdit.createdAt : new Date().toISOString()
    };

    onSaveSchedule(scheduleData);
    onClose();
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card apple-modal-card apple-editor-card" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="apple-modal-form">
          {/* Pinned Top Header */}
          <div className="apple-modal-header">
            <h2 className="apple-modal-title">
              {isEditMode ? '여행 일정 수정' : '새 여행 추가'}
            </h2>
            <button type="button" className="apple-close-btn" onClick={onClose} aria-label="닫기">
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="apple-modal-body">
            <p className="apple-editor-desc">
              지역과 날짜를 정하고, 일차별 방문 장소와 메모를 차곡차곡 담아보세요.
            </p>

            {/* 기본 여행 정보 (제목 없이: 일정 구분, 날짜, 지역명) */}
            <div className="apple-section-card">
              <div className="apple-section-header">1. 여행 기본 정보</div>

              {/* 일정 구분 */}
              <div className="apple-form-group">
                <label className="apple-form-label">일정 구분</label>
                <div className="apple-segmented-control">
                  <button
                    type="button"
                    className={`apple-segment-btn ${tripType === 'single' ? 'active' : ''}`}
                    onClick={() => {
                      setTripType('single');
                      setEndDate(startDate);
                    }}
                  >
                    <Calendar size={14} /> 당일치기
                  </button>
                  <button
                    type="button"
                    className={`apple-segment-btn ${tripType === 'multi' ? 'active' : ''}`}
                    onClick={() => setTripType('multi')}
                  >
                    <CalendarDays size={14} /> 연박 (N박 N+1일)
                  </button>
                </div>
              </div>

              {/* 날짜 */}
              {tripType === 'single' ? (
                <div className="apple-form-group">
                  <label className="apple-form-label">여행 날짜 *</label>
                  <input
                    type="date"
                    className="apple-input full-width-input"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setEndDate(e.target.value);
                    }}
                    required
                  />
                </div>
              ) : (
                <div className="apple-form-group">
                  <div className="apple-grid-2">
                    <div>
                      <label className="apple-form-label">시작 날짜 *</label>
                      <input
                        type="date"
                        className="apple-input full-width-input"
                        value={startDate}
                        onChange={(e) => {
                          const newStart = e.target.value;
                          setStartDate(newStart);
                          if (endDate < newStart) setEndDate(newStart);
                        }}
                        required
                      />
                    </div>
                    <div>
                      <label className="apple-form-label">종료 날짜 *</label>
                      <input
                        type="date"
                        className="apple-input full-width-input"
                        value={endDate}
                        min={startDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  {startDate && endDate && endDate >= startDate && (
                    <div className="apple-duration-pill-info">
                      🗓️ <strong>{calculateNights(startDate, endDate)}</strong> ({startDate} ~ {endDate})
                    </div>
                  )}
                </div>
              )}

              {/* 지역명 */}
              <div className="apple-form-group" style={{ marginBottom: 0 }}>
                <label className="apple-form-label">지역명 *</label>
                <input
                  type="text"
                  className="apple-input full-width-input"
                  placeholder="예: 제주도, 부산, 강릉, 여수"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* 본문 블록: 일정/날짜, 장소/스팟, 메모 */}
            <div className="apple-section-card">
              <div className="apple-section-header-row">
                <div className="apple-section-header" style={{ marginBottom: 0 }}>2. 세부 일정 구성</div>
                <span className="apple-block-count-badge">{blocks.length}개 블록</span>
              </div>

              <div className="apple-add-block-bar planner-add-block-bar">
                <button type="button" className="apple-add-pill" onClick={() => addBlock('day')}>
                  <Calendar size={14} /> + 일정/날짜
                </button>
                <button type="button" className="apple-add-pill" onClick={() => addBlock('place')}>
                  <MapPin size={14} /> + 장소/스팟
                </button>
                <button type="button" className="apple-add-pill" onClick={() => addBlock('memo')}>
                  <StickyNote size={14} /> + 메모
                </button>
              </div>

              <div className="apple-blocks-list">
                {blocks.length === 0 ? (
                  <div className="planner-empty-blocks-hint">
                    위 버튼을 눌러 <strong>일정/날짜</strong>, <strong>장소/스팟</strong>, <strong>메모</strong>를 추가해 보세요.
                  </div>
                ) : (
                  blocks.map((block, idx) => (
                    <div key={block.id} className="apple-block-card">
                      <div className="apple-block-card-header">
                        <span className="apple-block-type-pill">
                          {block.type === 'day' && <><Calendar size={12} /> 일정/날짜</>}
                          {block.type === 'place' && <><MapPin size={12} /> 장소/스팟</>}
                          {block.type === 'memo' && <><StickyNote size={12} /> 메모</>}
                        </span>

                        <div className="apple-block-controls">
                          <button
                            type="button"
                            className="apple-ctrl-btn"
                            onClick={() => moveBlock(idx, -1)}
                            disabled={idx === 0}
                            title="위로 이동"
                          >
                            <ArrowUp size={13} />
                          </button>
                          <button
                            type="button"
                            className="apple-ctrl-btn"
                            onClick={() => moveBlock(idx, 1)}
                            disabled={idx === blocks.length - 1}
                            title="아래로 이동"
                          >
                            <ArrowDown size={13} />
                          </button>
                          <button
                            type="button"
                            className="apple-ctrl-btn apple-ctrl-delete"
                            onClick={() => removeBlock(block.id)}
                            title="블록 삭제"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <div className="apple-block-card-body">
                        {block.type === 'day' && (
                          <div className="apple-day-input-grid">
                            <input
                              type="text"
                              className="apple-input full-width-input"
                              placeholder="구분 (예: 1일차, DAY 1)"
                              value={block.dayTitle || ''}
                              onChange={(e) => updateBlock(block.id, 'dayTitle', e.target.value)}
                            />
                            <input
                              type="date"
                              className="apple-input full-width-input apple-date-input"
                              value={block.dayDate || ''}
                              onChange={(e) => updateBlock(block.id, 'dayDate', e.target.value)}
                              title="해당 날짜 선택"
                            />
                          </div>
                        )}

                        {block.type === 'place' && (
                          <div className="apple-place-block-editor">
                            <div className="apple-place-autocomplete-container">
                              <div className="apple-place-input-row">
                                <input
                                  type="text"
                                  className="apple-input full-width-input"
                                  placeholder="장소·상호명 검색"
                                  value={block.placeName || ''}
                                  onChange={(e) => handlePlaceInputChange(block.id, e.target.value)}
                                  onFocus={(e) => {
                                    if (e.target.value && e.target.value.trim().length >= 1) {
                                      executePlaceSearch(block.id, e.target.value);
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Escape') {
                                      setActiveSuggestionBlockId(null);
                                    } else if (e.key === 'Enter') {
                                      e.preventDefault();
                                      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
                                      executePlaceSearch(block.id, block.placeName || '');
                                    }
                                  }}
                                />
                              </div>

                              {activeSuggestionBlockId === block.id && (isSearchingPlaces || suggestions.length > 0 || (searchSource === 'kakao' && (block.placeName || '').trim().length >= 1)) && (
                                <div className="apple-spot-autocomplete-dropdown">
                                  <div className="apple-autocomplete-header">
                                    <span>
                                      {searchSource === 'kakao' ? '카카오맵 장소 검색' : '추천 명소 / 교통 거점'}
                                    </span>
                                    <span className="apple-autocomplete-count">
                                      {isSearchingPlaces ? '검색 중...' : `${suggestions.length}개 발견`}
                                    </span>
                                  </div>
                                  <div className="apple-autocomplete-list">
                                    {isSearchingPlaces && suggestions.length === 0 ? (
                                      <div className="apple-autocomplete-status">
                                        카카오맵에서 장소를 찾는 중...
                                      </div>
                                    ) : suggestions.length === 0 ? (
                                      <div className="apple-autocomplete-status">
                                        검색 결과가 없습니다. 다른 키워드로 검색해 보세요.
                                      </div>
                                    ) : (
                                      suggestions.map((spot, sIdx) => (
                                        <button
                                          key={`${spot.id || spot.name}-${sIdx}`}
                                          type="button"
                                          className="apple-autocomplete-item"
                                          onClick={() => handleSelectSuggestion(block.id, spot)}
                                        >
                                          <div className="apple-autocomplete-emoji">{spot.emoji || '📍'}</div>
                                          <div className="apple-autocomplete-info">
                                            <div className="apple-autocomplete-title-row">
                                              <strong className="apple-autocomplete-name">{spot.name}</strong>
                                              {spot.category && (
                                                <span className="apple-autocomplete-cat-badge">{spot.category}</span>
                                              )}
                                              {spot.region && (
                                                <span className="apple-autocomplete-region-badge">{spot.region}</span>
                                              )}
                                            </div>
                                            <div className="apple-autocomplete-address">📍 {spot.address}</div>
                                          </div>
                                        </button>
                                      ))
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>

                            {block.lat && block.lng ? (
                              <div className="apple-spot-confirmed-badge naver-confirmed-badge">
                                <div className="naver-badge-info">
                                  <div className="naver-badge-status">
                                    <CheckCircle2 size={13} className="naver-check-icon" />
                                    <strong>주소 기준 좌표 고정됨</strong>
                                  </div>
                                  <div className="naver-badge-addr">
                                    📍 {block.address || '주소 등록 완료'} ({Number(block.lat).toFixed(4)}, {Number(block.lng).toFixed(4)})
                                  </div>
                                </div>
                                <div className="naver-badge-actions">
                                  <button
                                    type="button"
                                    className="naver-badge-clear-btn"
                                    onClick={() => handleClearCoords(block.id)}
                                    title="좌표 초기화"
                                  >
                                    좌표 해제
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="apple-spot-unconfirmed-guide">
                                <span>💡 장소나 상호명을 입력하고 검색 목록에서 선택하면 좌표가 정확하게 고정됩니다.</span>
                              </div>
                            )}
                          </div>
                        )}

                        {block.type === 'memo' && (
                          <textarea
                            className="apple-input full-width-input planner-memo-textarea"
                            rows={3}
                            placeholder="예약 시간, 준비물, 이동 팁 등 자유롭게 메모하세요"
                            value={block.content || ''}
                            onChange={(e) => updateBlock(block.id, 'content', e.target.value)}
                          />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Pinned Bottom Footer */}
          <div className="apple-modal-footer">
            <button type="button" className="apple-btn-secondary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="apple-btn-primary">
              {isEditMode ? '일정 수정 완료' : '여행 일정 저장'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
