import React from 'react';
import { Search, X } from 'lucide-react';

export default function FilterBar({ searchQuery, onSearchChange }) {
  return (
    <div className="apple-filter-container">
      <div className="apple-search-box">
        <Search className="apple-search-icon" size={16} />
        <input
          type="text"
          className="apple-search-input"
          placeholder="여행지, 날짜, 제목, 추억 검색"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button 
            type="button"
            className="apple-search-clear"
            onClick={() => onSearchChange('')}
            title="검색어 초기화"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
