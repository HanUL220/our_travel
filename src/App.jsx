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

export default function App() {
  // Posts state with LocalStorage persistence & Supabase fallback
  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem('our_travel_posts');
    return saved ? JSON.parse(saved) : initialPosts;
  });

  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);

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
          if (cloudPosts.length > 0) {
            setPosts(cloudPosts);
          } else {
            // If Supabase table is brand new & empty, seed with initialPosts to Supabase
            setPosts(initialPosts);
            for (const post of initialPosts) {
              await savePostToSupabase(post).catch(() => {});
            }
          }
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
        return false;
      });
    }

    return inTitle || inLocation || inDate || inSummary || inBlocks;
  });

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
          totalPhotos={totalPhotosCount}
        />

        <FilterBar 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {filteredPosts.length > 0 ? (
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
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-light)' }}>
            <Frown size={48} style={{ marginBottom: '1rem', opacity: 0.6 }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
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
