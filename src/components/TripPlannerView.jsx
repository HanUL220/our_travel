import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  Calendar,
  MapPin,
  StickyNote,
  Edit3,
  Trash2,
  ExternalLink,
  Compass,
  ChevronRight
} from 'lucide-react';
import PlaceRouteTimeline from './PlaceRouteTimeline';
import TripPlannerEditorModal from './TripPlannerEditorModal';

function getDdayInfo(startDateStr, endDateStr) {
  if (!startDateStr) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(`${startDateStr}T00:00:00`);
  const end = new Date(`${(endDateStr || startDateStr)}T00:00:00`);

  const diffStart = Math.round((start - today) / (1000 * 60 * 60 * 24));
  const diffEnd = Math.round((end - today) / (1000 * 60 * 60 * 24));

  if (diffStart > 0) {
    return { label: `D-${diffStart}`, status: 'upcoming' };
  }
  if (diffStart <= 0 && diffEnd >= 0) {
    return { label: diffStart === 0 ? 'D-Day' : '여행 중', status: 'ongoing' };
  }
  return { label: `D+${Math.abs(diffStart)}`, status: 'past' };
}

function formatDateDots(dateStr) {
  if (!dateStr) return '';
  return dateStr.replace(/-/g, '.');
}

function groupBlocksByDay(blocks = []) {
  const groups = [];
  let currentGroup = null;

  for (const block of blocks) {
    if (block.type === 'day') {
      currentGroup = {
        id: block.id,
        dayTitle: block.dayTitle || `${groups.length + 1}일차`,
        dayDate: block.dayDate || '',
        items: []
      };
      groups.push(currentGroup);
    } else {
      if (!currentGroup) {
        currentGroup = {
          id: 'default-day',
          dayTitle: '전체 일정',
          dayDate: '',
          items: []
        };
        groups.push(currentGroup);
      }
      currentGroup.items.push(block);
    }
  }

  return groups;
}

export default function TripPlannerView({
  schedules = [],
  onSaveSchedule,
  onDeleteSchedule,
  onResetView
}) {
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const [selectedDayFilter, setSelectedDayFilter] = useState('all');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [scheduleToEdit, setScheduleToEdit] = useState(null);

  const selectedSchedule = useMemo(
    () => schedules.find(s => String(s.id) === String(selectedScheduleId)) || null,
    [schedules, selectedScheduleId]
  );

  // Scroll to top whenever switching between trip list and trip detail view
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedScheduleId]);

  // Sort schedules strictly by trip startDate descending (later/newer dates first)
  const sortedSchedules = useMemo(() => {
    return [...schedules].sort((a, b) => {
      const aStart = (a.startDate || '').trim();
      const bStart = (b.startDate || '').trim();
      if (bStart !== aStart) return bStart.localeCompare(aStart);

      const aEnd = (a.endDate || aStart).trim();
      const bEnd = (b.endDate || bStart).trim();
      if (bEnd !== aEnd) return bEnd.localeCompare(aEnd);

      return String(b.id || '').localeCompare(String(a.id || ''));
    });
  }, [schedules]);

  const handleOpenCreate = () => {
    setScheduleToEdit(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (schedule) => {
    setScheduleToEdit(schedule);
    setIsEditorOpen(true);
  };

  const handleDelete = (schedule) => {
    if (window.confirm(`'${schedule.location}' 여행 일정을 삭제할까요?`)) {
      onDeleteSchedule(schedule.id);
      if (String(selectedScheduleId) === String(schedule.id)) {
        setSelectedScheduleId(null);
      }
    }
  };

  const handleSave = (saved) => {
    onSaveSchedule(saved);
    // Open newly created or edited schedule immediately
    setSelectedScheduleId(saved.id);
    setSelectedDayFilter('all');
  };

  // ==================== DETAIL VIEW (Triple-style Day Timeline) ====================
  if (selectedSchedule) {
    const dayGroups = groupBlocksByDay(selectedSchedule.blocks || []);
    const dday = getDdayInfo(selectedSchedule.startDate, selectedSchedule.endDate);

    const visibleGroups =
      selectedDayFilter === 'all'
        ? dayGroups
        : dayGroups.filter(g => g.id === selectedDayFilter);

    const visiblePlaces = visibleGroups.flatMap(g =>
      g.items.filter(item => item.type === 'place' && (item.placeName || '').trim())
    );

    const totalPlacesCount = (selectedSchedule.blocks || []).filter(
      b => b.type === 'place' && (b.placeName || '').trim()
    ).length;

    let runningSpotNumber = 0;

    return (
      <div className="trip-planner-container animate-fade-in">
        {/* Top Bar */}
        <div className="planner-view-header">
          <button
            type="button"
            className="map-back-btn"
            onClick={() => {
              setSelectedScheduleId(null);
              setSelectedDayFilter('all');
            }}
          >
            <ArrowLeft size={16} />
            <span>여행 목록으로</span>
          </button>

          <div className="planner-detail-actions">
            <button
              type="button"
              className="apple-action-btn apple-edit-btn"
              onClick={() => handleOpenEdit(selectedSchedule)}
            >
              <Edit3 size={14} />
              <span>수정</span>
            </button>
            <button
              type="button"
              className="apple-action-btn apple-delete-btn"
              onClick={() => handleDelete(selectedSchedule)}
            >
              <Trash2 size={14} />
              <span>삭제</span>
            </button>
          </div>
        </div>

        {/* Hero Summary Banner */}
        <div className="planner-detail-hero">
          <div className="planner-detail-hero-top">
            {dday && (
              <span className={`planner-dday-badge status-${dday.status}`}>
                {dday.label}
              </span>
            )}
            <span className="planner-duration-chip">
              {selectedSchedule.durationText || '당일치기'}
            </span>
          </div>

          <h2 className="planner-detail-location">{selectedSchedule.location}</h2>

          <div className="planner-detail-meta">
            <span className="planner-meta-chip">
              <Calendar size={14} />
              {selectedSchedule.tripType === 'multi' && selectedSchedule.endDate && selectedSchedule.endDate !== selectedSchedule.startDate
                ? `${formatDateDots(selectedSchedule.startDate)} ~ ${formatDateDots(selectedSchedule.endDate)}`
                : formatDateDots(selectedSchedule.startDate)}
            </span>
            <span className="planner-meta-chip">
              <MapPin size={14} />
              장소 {totalPlacesCount}곳
            </span>
          </div>
        </div>

        {/* Triple-style Day Filter Tabs */}
        {dayGroups.length > 1 && (
          <div className="planner-day-tabs-scroll" role="tablist" aria-label="일차 선택">
            <button
              type="button"
              className={`planner-day-tab ${selectedDayFilter === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedDayFilter('all')}
            >
              전체 일정
            </button>
            {dayGroups.map(group => (
              <button
                key={group.id}
                type="button"
                className={`planner-day-tab ${selectedDayFilter === group.id ? 'active' : ''}`}
                onClick={() => setSelectedDayFilter(group.id)}
              >
                <span>{group.dayTitle}</span>
                {group.dayDate && (
                  <span className="planner-day-tab-date">{group.dayDate.slice(5).replace('-', '.')}</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Route Map (Reusing existing PlaceRouteTimeline) */}
        {visiblePlaces.length > 0 && (
          <div className="planner-route-map-section">
            <PlaceRouteTimeline
              places={visiblePlaces}
              regionHint={selectedSchedule.location}
            />
          </div>
        )}

        {/* Triple-style Vertical Day Timeline */}
        <div className="planner-timeline-sections">
          {visibleGroups.length === 0 ? (
            <div className="planner-empty-detail">
              <p>아직 등록된 세부 일정이 없습니다.</p>
              <button
                type="button"
                className="apple-btn-primary"
                onClick={() => handleOpenEdit(selectedSchedule)}
              >
                + 장소·메모 추가하기
              </button>
            </div>
          ) : (
            visibleGroups.map(group => (
              <section key={group.id} className="planner-day-section">
                <div className="planner-day-section-header">
                  <span className="planner-day-badge">{group.dayTitle}</span>
                  {group.dayDate && (
                    <span className="planner-day-date">{formatDateDots(group.dayDate)}</span>
                  )}
                </div>

                {group.items.length === 0 ? (
                  <div className="planner-day-empty-note">등록된 장소나 메모가 없어요.</div>
                ) : (
                  <div className="planner-vertical-timeline">
                    {group.items.map((item) => {
                      if (item.type === 'place') {
                        runningSpotNumber += 1;
                        const spotNum = runningSpotNumber;
                        const kakaoUrl = `https://map.kakao.com/link/search/${encodeURIComponent(item.placeName)}`;
                        const naverUrl = `https://map.naver.com/v5/search/${encodeURIComponent(item.placeName)}`;

                        return (
                          <div key={item.id} className="planner-timeline-row is-place">
                            <div className="planner-timeline-rail">
                              <div className="planner-timeline-dot">{spotNum}</div>
                              <div className="planner-timeline-line" />
                            </div>
                            <div className="planner-timeline-card planner-place-card">
                              <div className="planner-place-card-main">
                                <div className="planner-place-name">{item.placeName}</div>
                                {item.address && (
                                  <div className="planner-place-addr">📍 {item.address}</div>
                                )}
                              </div>
                              <div className="planner-place-links">
                                <a
                                  href={kakaoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="apple-map-link-btn"
                                >
                                  카카오맵 <ExternalLink size={11} />
                                </a>
                                <a
                                  href={naverUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="apple-map-link-btn"
                                >
                                  네이버지도 <ExternalLink size={11} />
                                </a>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      if (item.type === 'memo') {
                        return (
                          <div key={item.id} className="planner-timeline-row is-memo">
                            <div className="planner-timeline-rail">
                              <div className="planner-timeline-memo-dot">
                                <StickyNote size={12} />
                              </div>
                              <div className="planner-timeline-line" />
                            </div>
                            <div className="planner-timeline-card planner-memo-card">
                              <p className="planner-memo-text">{item.content}</p>
                            </div>
                          </div>
                        );
                      }

                      return null;
                    })}
                  </div>
                )}
              </section>
            ))
          )}
        </div>

        {/* Editor Modal */}
        {isEditorOpen && (
          <TripPlannerEditorModal
            scheduleToEdit={scheduleToEdit}
            onClose={() => {
              setIsEditorOpen(false);
              setScheduleToEdit(null);
            }}
            onSaveSchedule={handleSave}
          />
        )}
      </div>
    );
  }

  // ==================== LIST VIEW (Trip Cards) ====================
  return (
    <div className="trip-planner-container animate-fade-in">
      {/* Top Bar */}
      <div className="planner-view-header">
        <button
          type="button"
          className="map-back-btn"
          onClick={onResetView}
          title="전체 타임라인 피드로 돌아가기"
        >
          <ArrowLeft size={16} />
          <span>전체 피드로 돌아가기</span>
        </button>

        <button
          type="button"
          className="apple-btn-primary planner-add-btn"
          onClick={handleOpenCreate}
        >
          <Plus size={15} />
          <span>여행 추가</span>
        </button>
      </div>

      {/* Trip Schedule Cards */}
      {sortedSchedules.length === 0 ? (
        <div className="planner-empty-state">
          <div className="planner-empty-icon">
            <Compass size={36} />
          </div>
          <h3>아직 계획된 여행이 없어요</h3>
          <p>
            다음에 함께 떠날 여행 지역과 날짜, 가고 싶은 장소들을 미리 정리해 보세요!
          </p>
          <button
            type="button"
            className="apple-btn-primary"
            onClick={handleOpenCreate}
          >
            <Plus size={15} />
            <span>첫 번째 여행 추가하기</span>
          </button>
        </div>
      ) : (
        <div className="planner-cards-grid">
          {sortedSchedules.map(schedule => {
            const dday = getDdayInfo(schedule.startDate, schedule.endDate);
            const places = (schedule.blocks || []).filter(
              b => b.type === 'place' && (b.placeName || '').trim()
            );
            const memoCount = (schedule.blocks || []).filter(
              b => b.type === 'memo' && (b.content || '').trim()
            ).length;

            return (
              <div
                key={schedule.id}
                className="planner-trip-card"
                onClick={() => {
                  setSelectedScheduleId(schedule.id);
                  setSelectedDayFilter('all');
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedScheduleId(schedule.id);
                    setSelectedDayFilter('all');
                  }
                }}
              >
                <div className="planner-trip-card-top">
                  <div className="planner-trip-card-badges">
                    {dday && (
                      <span className={`planner-dday-badge status-${dday.status}`}>
                        {dday.label}
                      </span>
                    )}
                    <span className="planner-duration-chip">
                      {schedule.durationText || '당일치기'}
                    </span>
                  </div>
                  <ChevronRight size={18} className="planner-card-arrow" />
                </div>

                <h3 className="planner-trip-location">{schedule.location}</h3>

                <div className="planner-trip-date">
                  <Calendar size={13} />
                  <span>
                    {schedule.tripType === 'multi' && schedule.endDate && schedule.endDate !== schedule.startDate
                      ? `${formatDateDots(schedule.startDate)} ~ ${formatDateDots(schedule.endDate)}`
                      : formatDateDots(schedule.startDate)}
                  </span>
                </div>

                {/* Spot preview pills */}
                {places.length > 0 && (
                  <div className="planner-spot-preview-row">
                    {places.slice(0, 3).map((p, idx) => (
                      <span key={p.id || idx} className="planner-spot-preview-pill">
                        {p.placeName}
                      </span>
                    ))}
                    {places.length > 3 && (
                      <span className="planner-spot-preview-more">+{places.length - 3}</span>
                    )}
                  </div>
                )}

                <div className="planner-trip-card-footer">
                  <span>장소 {places.length}곳</span>
                  {memoCount > 0 && <span>· 메모 {memoCount}개</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Editor Modal */}
      {isEditorOpen && (
        <TripPlannerEditorModal
          scheduleToEdit={scheduleToEdit}
          onClose={() => {
            setIsEditorOpen(false);
            setScheduleToEdit(null);
          }}
          onSaveSchedule={handleSave}
        />
      )}
    </div>
  );
}
