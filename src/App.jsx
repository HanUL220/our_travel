import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import FilterBar from './components/FilterBar';
import PostCard from './components/PostCard';
import PostDetailModal from './components/PostDetailModal';
import PostEditorModal from './components/PostEditorModal';
import Footer from './components/Footer';

import { initialPosts } from './data/travelPosts';
import { Frown } from 'lucide-react';
import { 
  fetchPostsFromSupabase, 
  savePostToSupabase, 
  deletePostFromSupabase,
  isSupabaseConfigured 
} from './utils/supabaseClient';

import PlacesCollection from './components/PlacesCollection';
import PhotosGallery from './components/PhotosGallery';

export default function App() {
  // Posts state with LocalStorage persistence & Supabase fallback
  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem('our_travel_posts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Clean out legacy example posts (id 1, 2, 3) if present
        const cleaned = parsed.filter(p => p.id !== 1 && p.id !== 2 && p.id !== 3);
        return cleaned;
      } catch {
        return [];
      }
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);

  // View mode state: 'posts' (default feed) | 'places' (grouped by region) | 'photos' (gallery)
  const [viewMode, setViewMode] = useState('posts');

  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('our_travel_theme') || 'light';
  });

  // UI Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedPost, setSelectedPost] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState(null);

  // Fetch posts from Supabase on mount if configured
  useEffect(() => {
    async function loadCloudPosts() {
      if (!isSupabaseConfigured) return;
      try {
        const cloudPosts = await fetchPostsFromSupabase();
        if (cloudPosts && Array.isArray(cloudPosts)) {
          // Clean out legacy example posts (id 1, 2, 3)
          const cleaned = cloudPosts.filter(p => String(p.id) !== '1' && String(p.id) !== '2' && String(p.id) !== '3');
          setPosts(cleaned);
        }
      } catch (err) {
        console.warn('Could not load posts from Supabase, using local data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCloudPosts();
  }, []);

  // Sync theme with HTML document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('our_travel_theme', theme);
  }, [theme]);

  // Sync posts to LocalStorage as offline backup
  useEffect(() => {
    localStorage.setItem('our_travel_posts', JSON.stringify(posts));
  }, [posts]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleOpenCreate = () => {
    setPostToEdit(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (post) => {
    setPostToEdit(post);
    setIsEditorOpen(true);
  };

  const handleSavePost = async (savedPost) => {
    // 1. Optimistic / local state update
    setPosts(prev => {
      const exists = prev.some(p => String(p.id) === String(savedPost.id));
      if (exists) {
        return prev.map(p => String(p.id) === String(savedPost.id) ? savedPost : p);
      } else {
        return [savedPost, ...prev];
      }
    });

    // Update currently viewed post if open
    if (selectedPost && String(selectedPost.id) === String(savedPost.id)) {
      setSelectedPost(savedPost);
    }

    // 2. Cloud DB sync
    if (isSupabaseConfigured) {
      try {
        await savePostToSupabase(savedPost);
      } catch (err) {
        console.error('Failed to sync post to Supabase:', err);
        alert('클라우드 저장 중 오류가 발생하여 기기 로컬에 저장되었습니다.');
      }
    }
  };

  const handleDeletePost = async (postId) => {
    // 1. Local state update
    setPosts(prev => prev.filter(p => String(p.id) !== String(postId)));
    if (selectedPost && String(selectedPost.id) === String(postId)) {
      setSelectedPost(null);
    }

    // 2. Cloud DB sync
    if (isSupabaseConfigured) {
      try {
        await deletePostFromSupabase(postId);
      } catch (err) {
        console.error('Failed to delete post from Supabase:', err);
      }
    }
  };

  // Filter posts based on search query across title, location, dates, summary, and block contents
  const filteredPosts = posts.filter(post => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    const inTitle = post.title?.toLowerCase().includes(q);
    const inLocation = post.location?.toLowerCase().includes(q);
    const inDate = post.date?.includes(q) || post.startDate?.includes(q) || post.endDate?.includes(q);
    const inSummary = post.summary?.toLowerCase().includes(q);

    // Search in blocks
    let inBlocks = false;
    if (post.blocks && Array.isArray(post.blocks)) {
      inBlocks = post.blocks.some(b => {
        if (b.content && b.content.toLowerCase().includes(q)) return true;
        if (b.caption && b.caption.toLowerCase().includes(q)) return true;
        if (b.dayTitle && b.dayTitle.toLowerCase().includes(q)) return true;
        if (b.dayDate && b.dayDate.includes(q)) return true;
        if (b.placeName && b.placeName.toLowerCase().includes(q)) return true;
        return false;
      });
    }

    return inTitle || inLocation || inDate || inSummary || inBlocks;
  });

  // Calculate unique location count
  const uniqueLocationsCount = new Set(
    posts.map(p => (p.location || '').trim().toLowerCase()).filter(Boolean)
  ).size;

  // Calculate total photo count
  const totalPhotosCount = posts.reduce((sum, p) => {
    let count = p.mainImage ? 1 : 0;
    if (p.blocks && Array.isArray(p.blocks)) {
      count += p.blocks.filter(b => b.type === 'image' && b.url).length;
    }
    return sum + count;
  }, 0);

  return (
    <div className="app-container">
      <Header 
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenNewPost={handleOpenCreate}
        startDate="2026-06-20"
      />

      <main className="main-content">
        <HeroSection 
          totalPosts={posts.length} 
          totalLocations={uniqueLocationsCount}
          totalPhotos={totalPhotosCount}
          activeView={viewMode}
          onViewChange={setViewMode}
        />

        <FilterBar 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* View Mode Switching */}
        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4.5rem 1.5rem', color: 'var(--text-light)', background: 'var(--apple-canvas)', borderRadius: 'var(--radius-card)', margin: '1rem 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>✈️</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--apple-foreground)' }}>
              아직 등록된 여행 기록이 없어요
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--apple-muted)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              둘만의 소중한 여행 사진과 이야기를 첫 번째 기록으로 남겨보세요!
            </p>
            <button 
              type="button" 
              className="apple-header-cta" 
              onClick={handleOpenCreate}
              style={{ margin: '0 auto', display: 'inline-flex' }}
            >
              + 첫 번째 추억 추가하기
            </button>
          </div>
        ) : viewMode === 'places' ? (
          <PlacesCollection 
            posts={filteredPosts}
            searchQuery={searchQuery}
            onSelectPost={setSelectedPost}
            onResetView={() => setViewMode('posts')}
          />
        ) : viewMode === 'photos' ? (
          <PhotosGallery 
            posts={filteredPosts}
            searchQuery={searchQuery}
            onSelectPost={setSelectedPost}
            onResetView={() => setViewMode('posts')}
          />
        ) : filteredPosts.length > 0 ? (
          <div className="posts-grid">
            {filteredPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onSelectPost={setSelectedPost}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--apple-muted)' }}>
            <Frown size={42} style={{ marginBottom: '1rem', opacity: 0.6 }} />
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: 'var(--apple-foreground)' }}>
              검색된 여행 추억이 없어요
            </h3>
            <p style={{ fontSize: '0.9rem' }}>
              다른 검색어로 찾으시거나 상단 '추억 추가' 버튼으로 소중한 여행을 기록해 보세요!
            </p>
          </div>
        )}
      </main>

      {/* Post Detail Modal */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onEditPost={handleOpenEdit}
          onDeletePost={handleDeletePost}
        />
      )}

      {/* Post Creation / Edit Modal */}
      {isEditorOpen && (
        <PostEditorModal
          postToEdit={postToEdit}
          onClose={() => {
            setIsEditorOpen(false);
            setPostToEdit(null);
          }}
          onSavePost={handleSavePost}
        />
      )}

      <Footer />
    </div>
  );
}
