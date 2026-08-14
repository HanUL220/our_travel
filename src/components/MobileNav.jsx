import React from 'react';
import { Home, Plus } from 'lucide-react';

export default function MobileNav({ onOpenNewPost }) {
  return (
    <nav className="apple-mobile-nav">
      <button 
        className="apple-nav-item active"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <Home size={18} />
        <span>홈</span>
      </button>

      <button 
        className="apple-nav-item apple-nav-add"
        onClick={onOpenNewPost}
      >
        <Plus size={18} />
        <span>추억 쓰기</span>
      </button>
    </nav>
  );
}
