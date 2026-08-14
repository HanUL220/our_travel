import React, { useState, useRef } from 'react';
import { UploadCloud, Link as LinkIcon, Image as ImageIcon, X, Loader2, CheckCircle2 } from 'lucide-react';
import { uploadImage } from '../utils/supabaseClient';
import { formatImageUrl } from '../utils/imageUtils';

export default function ImageUploader({ 
  value = '', 
  onChange, 
  placeholder = '사진 URL 또는 구글 드라이브 링크를 입력하세요',
  label = '',
  compact = false 
}) {
  const [activeTab, setActiveTab] = useState(value && value.startsWith('http') && !value.includes('supabase') ? 'link' : 'upload');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('이미지 파일(JPG, PNG, WebP 등)만 업로드 가능합니다.');
      return;
    }

    // Limit raw file size to 25MB before client-side compression
    if (file.size > 25 * 1024 * 1024) {
      setUploadError('파일 용량이 너무 큽니다. (최대 25MB 이하 권장)');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError('');
      const result = await uploadImage(file);
      onChange(result.url);
    } catch (err) {
      console.error(err);
      setUploadError(err.message || '이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`apple-image-uploader ${compact ? 'compact' : ''}`}>
      {label && <label className="apple-form-label">{label}</label>}

      {/* If an image is already set, show preview with action controls */}
      {value ? (
        <div className="apple-uploader-preview-card">
          <div className="apple-uploader-img-wrapper">
            <img 
              src={formatImageUrl(value)} 
              alt="선택된 이미지" 
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'; }}
            />
          </div>
          <div className="apple-uploader-preview-info">
            <span className="apple-uploader-status-badge">
              <CheckCircle2 size={13} color="#10b981" />
              <span>사진 등록 완료</span>
            </span>
            <div className="apple-uploader-actions">
              <button 
                type="button" 
                className="apple-btn-outline-sm"
                onClick={() => {
                  onChange('');
                  setTimeout(() => fileInputRef.current?.click(), 50);
                }}
              >
                사진 변경
              </button>
              <button 
                type="button" 
                className="apple-btn-danger-sm" 
                onClick={handleClear}
                title="사진 삭제"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* When no image is set, show upload/link switch interface */
        <div className="apple-uploader-main">
          {/* Tab Selector */}
          <div className="apple-uploader-tabs">
            <button
              type="button"
              className={`apple-uploader-tab ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => { setActiveTab('upload'); setUploadError(''); }}
            >
              <UploadCloud size={14} />
              <span>사진 직접 업로드</span>
            </button>
            <button
              type="button"
              className={`apple-uploader-tab ${activeTab === 'link' ? 'active' : ''}`}
              onClick={() => { setActiveTab('link'); setUploadError(''); }}
            >
              <LinkIcon size={14} />
              <span>링크 URL 입력</span>
            </button>
          </div>

          {activeTab === 'upload' ? (
            <div 
              className={`apple-dropzone ${isDragging ? 'drag-over' : ''} ${isUploading ? 'uploading' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !isUploading && fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />

              {isUploading ? (
                <div className="apple-dropzone-content uploading">
                  <Loader2 size={24} className="apple-spin" />
                  <p className="apple-dropzone-title">사진 최적화 및 업로드 중...</p>
                  <span className="apple-dropzone-subtitle">대용량 사진도 자동으로 빠르게 압축됩니다.</span>
                </div>
              ) : (
                <div className="apple-dropzone-content">
                  <div className="apple-dropzone-icon-circle">
                    <ImageIcon size={20} />
                  </div>
                  <p className="apple-dropzone-title">
                    <strong>클릭하여 사진 선택</strong> 또는 여기로 드래그 앤 드롭
                  </p>
                  <span className="apple-dropzone-subtitle">
                    JPG, PNG, WebP 등 (자동으로 최적화 압축되어 등록됩니다)
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="apple-link-input-box">
              <div className="apple-input-with-icon">
                <LinkIcon size={16} className="apple-input-icon" />
                <input 
                  type="text" 
                  className="apple-input full-width-input" 
                  placeholder={placeholder}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                />
              </div>
              <span className="apple-hint-text">
                구글 드라이브 공유 링크 또는 웹 이미지 URL을 입력하시면 자동 변환됩니다.
              </span>
            </div>
          )}

          {uploadError && (
            <div className="apple-uploader-error">
              ⚠️ {uploadError}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
