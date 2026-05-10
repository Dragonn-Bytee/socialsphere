import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';
import PostCard from '../components/PostCard';
import Stories from '../components/Stories';
import { Loader2, Image as ImageIcon, Film, Smile, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const observer = useRef();

  const lastPostElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/posts/feed?page=${page}&limit=10`);
        setPosts(prev => [...prev, ...data]);
        setHasMore(data.length > 0);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchPosts();
  }, [page]);

  return (
    <div className="home-feed fade-in" style={{ paddingTop: '20px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        
        <Stories />

        {/* Premium Create Post Card */}
        <div className="glass-card" style={{ padding: '24px', marginBottom: '40px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
            <div className="avatar" style={{ flexShrink: 0, width: '48px', height: '48px' }}>
              {user?.username?.[0].toUpperCase()}
            </div>
            <div style={{ 
              flex: 1, 
              background: 'rgba(255, 255, 255, 0.03)', 
              padding: '16px 24px', 
              borderRadius: '16px', 
              color: 'var(--text-muted)',
              cursor: 'pointer',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              fontSize: '1.05rem',
              fontWeight: 400,
              transition: 'var(--transition)'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
            >
              Share your thoughts with the sphere...
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '64px' }}>
            <div style={{ display: 'flex', gap: '20px' }}>
              <button className="action-btn" title="Add Image">
                <ImageIcon size={20} style={{ color: '#4cd6ff' }} />
                <span style={{ fontSize: '0.85rem' }}>Image</span>
              </button>
              <button className="action-btn" title="Add Video">
                <Film size={20} style={{ color: '#d1bcff' }} />
                <span style={{ fontSize: '0.85rem' }}>Video</span>
              </button>
              <button className="action-btn" title="Emoji">
                <Smile size={20} style={{ color: '#ffb4ab' }} />
                <span style={{ fontSize: '0.85rem' }}>Feeling</span>
              </button>
            </div>
            
            <button className="btn btn-primary" style={{ padding: '8px 24px', fontSize: '0.85rem' }}>
              <Plus size={18} /> Publish
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {posts.map((post, index) => {
            if (posts.length === index + 1) {
              return <div ref={lastPostElementRef} key={post._id}><PostCard post={post} /></div>;
            } else {
              return <PostCard key={post._id} post={post} />;
            }
          })}
        </div>

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <Loader2 className="animate-spin" size={32} style={{ color: 'var(--primary)' }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
