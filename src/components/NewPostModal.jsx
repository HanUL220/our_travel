import React, { useState } from 'react';
import { X, Image, Sparkles } from 'lucide-react';

export default function NewPostModal({ onClose, onAddPost, categories }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categories[1] || '바다');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [mainImage, setMainImage] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [tips, setTips] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('제목과 여행 일기 내용을 입력해 주세요!');
      return;
    }

    const defaultImg = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80";

    const newPost = {
      id: Date.now(),
      title: title.trim(),
      category,
      location: location.trim() || '소중한 여행지',
      date,
      mainImage: mainImage.trim() || defaultImg,
      images: [mainImage.trim() || defaultImg],
      summary: summary.trim() || content.trim().substring(0, 80) + '...',
      content: content.trim(),
      tips: tips.trim() ? `💡 ${tips.trim()}` : '',
      likes: 0,
      comments: []
    };

    onAddPost(newPost);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <button className="modal-close-btn" onClick={onClose} aria-label="닫기">
          <X size={20} />
        </button>

        <div className="modal-body">
          <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles color="var(--accent-pink)" size={24} />
            새로운 여행 추억 기록하기
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            여자친구와 함께 다녀온 장소와 사진, 스토리를 남아보세요.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">여행 제목 *</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="예: 푸른 바다가 매력적인 제주도 힐링 여행 🌊"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">카테고리</label>
                <select 
                  className="input-field" 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.filter(c => c !== '전체').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">방문 날짜</label>
                <input 
                  type="date" 
                  className="input-field" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">여행지 장소명 / 위치</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="예: 제주 서귀포 & 함덕해변"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">대표 사진 이미지 URL</label>
              <input 
                type="url" 
                className="input-field" 
                placeholder="https://images.unsplash.com/..."
                value={mainImage}
                onChange={(e) => setMainImage(e.target.value)}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '2px' }}>
                * 비워두시면 감성적인 기본 여행 이미지가 적용됩니다.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">한 줄 요약</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="포스트 카드에 보일 짧은 1~2줄 요약"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">여행일기 / 스토리 *</label>
              <textarea 
                className="input-field" 
                rows={5} 
                placeholder="함께 먹은 음식, 기분, 추억들을 자세히 적어보세요..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">여행 팁 (선택)</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="예: 카페 창가 자리는 오후 2시 전 방문 추천!"
                value={tips}
                onChange={(e) => setTips(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button type="button" className="btn-icon" onClick={onClose} style={{ width: 'auto', padding: '0.6rem 1.2rem', borderRadius: 'var(--radius-full)' }}>
                취소
              </button>
              <button type="submit" className="btn-primary">
                추억 기록 저장하기
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
