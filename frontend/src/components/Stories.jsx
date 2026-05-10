import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Stories = () => {
  const { user } = useAuth();
  const [storyFeeds, setStoryFeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const { data } = await api.get('/stories/feed');
        setStoryFeeds(data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchStories();
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      gap: '16px', 
      padding: '20px 0', 
      overflowX: 'auto', 
      scrollbarWidth: 'none',
      marginBottom: '20px',
      position: 'relative'
    }} className="stories-tray">
      {/* My Story Add */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', minWidth: '80px' }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          borderRadius: '50%', 
          padding: '2px', 
          background: 'var(--accent-gradient)',
          position: 'relative',
          cursor: 'pointer'
        }}>
          <div style={{ 
            width: '100%', 
            height: '100%', 
            borderRadius: '50%', 
            background: 'var(--bg)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            overflow: 'hidden',
            border: '2px solid var(--bg)'
          }}>
            <div className="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%' }}>
              {user?.username?.[0].toUpperCase()}
            </div>
          </div>
          <div style={{ 
            position: 'absolute', 
            bottom: '0', 
            right: '0', 
            background: 'var(--primary)', 
            borderRadius: '50%', 
            width: '20px', 
            height: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '2px solid var(--bg)'
          }}>
            <Plus size={14} color="#000" strokeWidth={3} />
          </div>
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Your Story</span>
      </div>

      {/* Other Stories */}
      {storyFeeds.map((feed) => (
        <div key={feed.user._id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', minWidth: '80px', cursor: 'pointer' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '50%', 
            padding: '2px', 
            background: 'var(--accent-gradient)',
            boxShadow: '0 0 10px var(--primary-glow)'
          }}>
            <div style={{ 
              width: '100%', 
              height: '100%', 
              borderRadius: '50%', 
              background: 'var(--bg)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              overflow: 'hidden',
              border: '2px solid var(--bg)'
            }}>
              <div className="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%' }}>
                {feed.user.username[0].toUpperCase()}
              </div>
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{feed.user.username}</span>
        </div>
      ))}
    </div>
  );
};

export default Stories;
