import React, { useState } from 'react';
import { X, ArrowUp, ArrowDown, Trash2, Image as ImageIcon, Heading, Calendar, CalendarDays, MapPin, Search, CheckCircle2 } from 'lucide-react';
import ImageUploader from './ImageUploader';
import { geocodeKoreanAddress } from '../utils/geoUtils';

export default function PostEditorModal({ onClose, onSavePost, postToEdit = null }) {
  const isEditMode = Boolean(postToEdit);

  // Determine initial trip type (당일 vs 연박)
  const initialTripType = postToEdit?.tripType || (postToEdit?.endDate && postToEdit?.endDate !== postToEdit?.startDate ? 'multi' : 'single');

  // Form States
  const [tripType, setTripType] = useState(initialTripType);
  const [startDate, setStartDate] = useState(postToEdit?.startDate || postToEdit?.date?.split(' ~ ')[0] || new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(postToEdit?.endDate || postToEdit?.date?.split(' ~ ')[1] || new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState(postToEdit?.title || '');
  const [location, setLocation] = useState(postToEdit?.location || '');
  const [mainImage, setMainImage] = useState(postToEdit?.mainImage || '');

  // Initialize Blocks state (text block type removed from new additions)
  const [blocks, setBlocks] = useState(() => {
    if (postToEdit?.blocks && Array.isArray(postToEdit.blocks) && postToEdit.blocks.length > 0) {
      return postToEdit.blocks.filter(b => b.type !== 'tip');
    }
    if (postToEdit?.content) {
      return [
        { id: 'init-day', type: 'day', dayTitle: '1일차', dayDate: postToEdit.startDate || postToEdit.date || '' }
      ];
    }
    return [];
  });

  const calculateNights = (start, end) => {
    if (!start || !end) return '';
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = e - s;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 0) {
      return `${diffDays}박 ${diffDays + 1}일`;
    } else if (diffDays === 0) {
      return '당일치기';
    }
    return '';
  };

  const addBlock = (type) => {
    const newId = `block-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    let newBlock = { id: newId, type };

    if (type === 'day') {
      const existingDayCount = blocks.filter(b => b.type === 'day').length;
      newBlock.dayTitle = `${existingDayCount + 1}일차`;
      newBlock.dayDate = tripType === 'multi' ? startDate : '';
    } else if (type === 'heading') {
      newBlock.content = '';
    } else if (type === 'place') {
      newBlock.placeName = '';
      newBlock.address = '';
      newBlock.lat = null;
      newBlock.lng = null;
    } else if (type === 'image') {
      newBlock.url = '';
      newBlock.caption = '';
    }

    setBlocks(prev => [...prev, newBlock]);
  };

  // Safe update for fields without altering other fixed coordinates
  const updateBlock = (id, field, value) => {
    setBlocks(prev => prev.map(block => {
      if (block.id === id) {
        return { ...block, [field]: value };
      }
      return block;
    }));
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

  // Open Kakao (Daum) Postcode address search popup with precision geocoding
  const handleOpenSearchForBlock = (blockId) => {
    const openPostcode = () => {
      new window.daum.Postcode({
        oncomplete: async (data) => {
          const selectedPlace = data.buildingName ? data.buildingName : (data.roadAddress || data.address);
          const roadAddr = data.roadAddress || data.address;

          // Multi-stage high precision geocoding using full postal details
          const coords = await geocodeKoreanAddress(roadAddr, location, {
            sido: data.sido,
            sigungu: data.sigungu,
            bname: data.bname,
            roadname: data.roadname,
            buildingName: data.buildingName,
            zonecode: data.zonecode,
            jibunAddress: data.jibunAddress,
            autoJibunAddress: data.autoJibunAddress
          });

          setBlocks(prev => prev.map(b => {
            if (b.id === blockId) {
              return {
                ...b,
                placeName: b.placeName && b.placeName.trim() ? b.placeName : selectedPlace,
                address: roadAddr,
                lat: coords?.lat ? parseFloat(coords.lat) : null,
                lng: coords?.lng ? parseFloat(coords.lng) : null,
                originalSpotName: selectedPlace
              };
            }
            return b;
          }));
        }
      }).open();
    };

    if (window.daum && window.daum.Postcode) {
      openPostcode();
    } else {
      const script = document.createElement('script');
      script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
      script.onload = openPostcode;
      document.head.appendChild(script);
    }
  };

  const handleClearCoords = (blockId) => {
    setBlocks(prev => prev.map(b => {
      if (b.id === blockId) {
        return {
          ...b,
          address: '',
          lat: null,
          lng: null
        };
      }
      return b;
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('여행 제목을 입력해 주세요!');
      return;
    }

    if (tripType === 'multi' && startDate > endDate) {
      alert('종료 날짜는 시작 날짜보다 빠를 수 없습니다.');
      return;
    }

    const defaultImg = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80";
    
    let resolvedMainImage = mainImage.trim();
    if (!resolvedMainImage) {
      const firstImgBlock = blocks.find(b => b.type === 'image' && b.url && b.url.trim());
      if (firstImgBlock) {
        resolvedMainImage = firstImgBlock.url.trim();
      } else {
        resolvedMainImage = defaultImg;
      }
    }

    const durationText = tripType === 'multi' ? calculateNights(startDate, endDate) : '';
    const formattedDate = tripType === 'single' ? startDate : `${startDate} ~ ${endDate}`;

    const savedPost = {
      id: postToEdit ? postToEdit.id : Date.now(),
      title: title.trim(),
      location: location.trim() || '소중한 여행지',
      tripType: tripType,
      startDate: startDate,
      endDate: tripType === 'multi' ? endDate : startDate,
      date: formattedDate,
      durationText: durationText,
      mainImage: resolvedMainImage,
      blocks: blocks
    };

    onSavePost(savedPost);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card apple-modal-card apple-editor-card" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="apple-modal-form">
          {/* Pinned Top Header */}
          <div className="apple-modal-header">
            <h2 className="apple-modal-title">
              {isEditMode ? '여행 기록 수정' : '새로운 여행 기록'}
            </h2>
            <button type="button" className="apple-close-btn" onClick={onClose} aria-label="닫기">
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="apple-modal-body">
            <p className="apple-editor-desc">
              일정(날짜)별 구분과 사진, 소제목, 방문 장소를 원하는 순서대로 자유롭게 배치하세요.
            </p>

            {/* General Info Section */}
            <div className="apple-section-card">
              <h4 className="apple-section-header">기본 정보</h4>

              <div className="apple-form-group">
                <label className="apple-form-label">여행 제목 *</label>
                <input 
                  type="text" 
                  className="apple-input full-width-input" 
                  placeholder="예: 에메랄드빛 바다와 함께한 제주 서귀포 여행 🌊"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Apple Segmented Control: 당일 vs 연박 */}
              <div className="apple-form-group">
                <label className="apple-form-label">일정 구분</label>
                <div className="apple-segmented-control">
                  <button
                    type="button"
                    className={`apple-segment-btn ${tripType === 'single' ? 'active' : ''}`}
                    onClick={() => setTripType('single')}
                  >
                    <Calendar size={14} />
                    <span>당일 여행</span>
                  </button>
                  <button
                    type="button"
                    className={`apple-segment-btn ${tripType === 'multi' ? 'active' : ''}`}
                    onClick={() => setTripType('multi')}
                  >
                    <CalendarDays size={14} />
                    <span>연박 여행</span>
                  </button>
                </div>
              </div>

              {/* Dates & Location */}
              {tripType === 'single' ? (
                <div className="apple-grid-2">
                  <div className="apple-form-group">
                    <label className="apple-form-label">여행 날짜 *</label>
                    <input 
                      type="date" 
                      className="apple-input full-width-input" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="apple-form-group">
                    <label className="apple-form-label">여행지 지역명</label>
                    <input 
                      type="text" 
                      className="apple-input full-width-input" 
                      placeholder="예: 제주 서귀포, 강릉, 부산"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="apple-grid-3">
                    <div className="apple-form-group">
                      <label className="apple-form-label">시작일 *</label>
                      <input 
                        type="date" 
                        className="apple-input full-width-input" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                    </div>

                    <div className="apple-form-group">
                      <label className="apple-form-label">종료일 *</label>
                      <input 
                        type="date" 
                        className="apple-input full-width-input" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                      />
                    </div>

                    <div className="apple-form-group">
                      <label className="apple-form-label">여행지 지역명</label>
                      <input 
                        type="text" 
                        className="apple-input full-width-input" 
                        placeholder="예: 제주 서귀포 & 함덕"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                  </div>

                  {calculateNights(startDate, endDate) && (
                    <div className="apple-duration-pill-info">
                      총 여행 기간: <strong>{calculateNights(startDate, endDate)}</strong> ({startDate} ~ {endDate})
                    </div>
                  )}
                </>
              )}

              {/* Main Cover Image Uploader */}
              <div className="apple-form-group" style={{ marginTop: '0.8rem', marginBottom: 0 }}>
                <ImageUploader 
                  label="대표 사진 이미지"
                  value={mainImage}
                  onChange={(newUrl) => setMainImage(newUrl)}
                  placeholder="https://drive.google.com/file/d/... 또는 이미지 URL"
                />
              </div>
            </div>

            {/* Content Blocks Section */}
            <div className="apple-section-card">
              <div className="apple-section-header-row">
                <h4 className="apple-section-header" style={{ margin: 0 }}>
                  본문 블록 구성
                </h4>
                <span className="apple-block-count-badge">
                  {blocks.length}개 블록
                </span>
              </div>

              {/* Block Action Pills: '글 쓰기' removed as requested */}
              <div className="apple-add-block-bar">
                <button type="button" className="apple-add-pill" onClick={() => addBlock('day')}>
                  <CalendarDays size={14} /> 일정 / 날짜
                </button>
                <button type="button" className="apple-add-pill" onClick={() => addBlock('place')}>
                  <MapPin size={14} /> 장소 / 스팟
                </button>
                <button type="button" className="apple-add-pill" onClick={() => addBlock('heading')}>
                  <Heading size={14} /> 소제목
                </button>
                <button type="button" className="apple-add-pill" onClick={() => addBlock('image')}>
                  <ImageIcon size={14} /> 사진 추가
                </button>
              </div>

              {/* Blocks List */}
              {blocks.length === 0 ? (
                <div className="apple-empty-blocks-guide">
                  <div className="apple-empty-guide-icon">✨</div>
                  <p className="apple-empty-guide-title">본문 블록이 아직 비어있습니다</p>
                  <p className="apple-empty-guide-sub">
                    위의 <strong>[일정/날짜]</strong>, <strong>[장소/스팟]</strong>, <strong>[소제목]</strong>, <strong>[사진 추가]</strong> 버튼을 눌러 원하는 순서대로 자유롭게 추억을 채워보세요!
                  </p>
                </div>
              ) : (
                <div className="apple-blocks-list">
                  {blocks.map((block, idx) => {
                    const placeIndex = block.type === 'place' 
                      ? blocks.slice(0, idx + 1).filter(b => b.type === 'place').length 
                      : null;

                    return (
                      <div key={block.id} className="apple-block-card">
                        <div className="apple-block-card-header">
                          <span className="apple-block-type-pill">
                            {block.type === 'day' && <><CalendarDays size={12} /> 일정 구분</>}
                            {block.type === 'place' && <><MapPin size={12} /> 장소 #{placeIndex}</>}
                            {block.type === 'heading' && <><Heading size={12} /> 소제목</>}
                            {block.type === 'text' && <>본문 글</>}
                            {block.type === 'image' && <><ImageIcon size={12} /> 사진</>}
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
                                placeholder="구분 제목 (예: 1일차, DAY 1, 또는 6월 25일)"
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
                              <div className="apple-place-input-row">
                                <input 
                                  type="text" 
                                  className="apple-input full-width-input" 
                                  placeholder="본문에 표시될 장소명 (예: 협재해수욕장, 우리 숙소)"
                                  value={block.placeName || ''}
                                  onChange={(e) => updateBlock(block.id, 'placeName', e.target.value)}
                                />
                                <button 
                                  type="button" 
                                  className="apple-search-spot-btn"
                                  onClick={() => handleOpenSearchForBlock(block.id)}
                                  title="카카오 주소/위치 검색으로 정확한 좌표 설정"
                                >
                                  <Search size={13} />
                                  <span>주소/위치 검색</span>
                                </button>
                              </div>

                              {/* Fixed Address and Coordinates Badge (Does NOT change when placeName changes) */}
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
                                    <div className="naver-badge-hint">
                                      💡 장소명을 "{block.placeName || '자유 텍스트'}"로 변경하셔도 위 주소 기준 좌표가 안전하게 유지됩니다.
                                    </div>
                                  </div>
                                  <div className="naver-badge-actions">
                                    <button 
                                      type="button" 
                                      className="naver-badge-rechange-btn"
                                      onClick={() => handleOpenSearchForBlock(block.id)}
                                    >
                                      주소 변경
                                    </button>
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
                                  <span>💡 우측 <strong>[주소/위치 검색]</strong> 버튼을 눌러 주소를 선택하면 해당 주소 기준 좌표가 정확하게 고정됩니다.</span>
                                </div>
                              )}
                            </div>
                          )}

                          {block.type === 'heading' && (
                            <input 
                              type="text" 
                              className="apple-input full-width-input apple-heading-input" 
                              placeholder="소제목을 입력하세요"
                              value={block.content || ''}
                              onChange={(e) => updateBlock(block.id, 'content', e.target.value)}
                            />
                          )}

                          {block.type === 'text' && (
                            <textarea 
                              className="apple-input full-width-input apple-textarea" 
                              placeholder="여행 내용"
                              value={block.content || ''}
                              onChange={(e) => updateBlock(block.id, 'content', e.target.value)}
                            />
                          )}

                          {block.type === 'image' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%' }}>
                              <ImageUploader 
                                value={block.url || ''}
                                onChange={(newUrl) => updateBlock(block.id, 'url', newUrl)}
                                placeholder="사진 URL 또는 구글 드라이브 링크를 입력하세요"
                                compact={true}
                              />
                              <input 
                                type="text" 
                                className="apple-input full-width-input" 
                                placeholder="사진 아래에 들어갈 설명 캡션 (선택)"
                                value={block.caption || ''}
                                onChange={(e) => updateBlock(block.id, 'caption', e.target.value)}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Pinned Bottom Footer */}
          <div className="apple-modal-footer">
            <button 
              type="button" 
              className="apple-btn-secondary" 
              onClick={onClose}
            >
              취소
            </button>
            <button type="submit" className="apple-btn-primary">
              {isEditMode ? '수정 내용 저장' : '추억 저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
