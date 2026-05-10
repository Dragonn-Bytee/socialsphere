import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Settings, Grid, List, MapPin, Link as LinkIcon, Edit3 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [view, setView] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState('');

  const isOwnProfile = currentUser?.id === id;

  useEffect(() => {
    fetchProfileData();
  }, [id]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [profileRes, postsRes] = await Promise.all([
        api.get(`/users/${id}`),
        api.get(`/posts/user/${id}`)
      ]);
      setProfile(profileRes.data);
      setPosts(postsRes.data);
      setEditBio(profileRes.data.bio || '');
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleUpdateBio = async () => {
    try {
      const { data } = await api.put('/users/profile', { bio: editBio });
      setProfile({ ...profile, bio: data.bio });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFollow = async () => {
    try {
      await api.post(`/users/${id}/follow`);
      fetchProfileData(); // Refresh to get new counts
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="fade-in" style={{ textAlign: 'center', padding: '100px' }}>Loading profile...</div>;
  if (!profile) return <div style={{ textAlign: 'center', padding: '100px' }}>User not found</div>;

  return (
    <div className="fade-in" style={{ maxWidth: '935px', margin: '0 auto', padding: '30px 20px' }}>
      <header style={{ display: 'flex', gap: '30px', marginBottom: '44px', alignItems: 'flex-start' }}>
        <div className="avatar" style={{ width: '150px', height: '150px', fontSize: '3rem', flexShrink: 0 }}>
          {profile.username[0].toUpperCase()}
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 300 }}>{profile.username}</h2>
            {isOwnProfile ? (
              <>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="btn" 
                  style={{ background: 'var(--bg-secondary)', padding: '6px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem' }}
                >
                  Edit Profile
                </button>
                <Settings size={24} style={{ cursor: 'pointer' }} />
              </>
            ) : (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={handleFollow}
                  className="btn btn-primary" 
                  style={{ padding: '6px 24px', borderRadius: '8px', fontWeight: 600 }}
                >
                  {profile.followers?.some(f => f._id === currentUser?.id) ? 'Unfollow' : 'Follow'}
                </button>
                <button className="btn" style={{ background: 'var(--bg-secondary)', padding: '6px 16px', borderRadius: '8px', fontWeight: 600 }}>Message</button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '40px', marginBottom: '20px' }}>
            <span><strong>{posts.length}</strong> posts</span>
            <span><strong>{profile.followers?.length || 0}</strong> followers</span>
            <span><strong>{profile.following?.length || 0}</strong> following</span>
          </div>

          <div style={{ whiteSpace: 'pre-wrap' }}>
            <h4 style={{ fontWeight: 700, marginBottom: '4px' }}>{profile.username}</h4>
            {isEditing ? (
              <div style={{ marginTop: '10px' }}>
                <textarea 
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    borderRadius: '8px', 
                    background: 'var(--bg-secondary)', 
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    minHeight: '80px',
                    marginBottom: '10px'
                  }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handleUpdateBio} className="btn btn-primary" style={{ padding: '4px 12px' }}>Save</button>
                  <button onClick={() => setIsEditing(false)} className="btn" style={{ padding: '4px 12px' }}>Cancel</button>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text)' }}>{profile.bio || 'No bio yet.'}</p>
            )}
          </div>
        </div>
      </header>

      <div style={{ borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center', gap: '60px', marginBottom: '20px' }}>
        <button 
          onClick={() => setView('grid')}
          style={{ 
            background: 'none', border: 'none', padding: '15px 0', 
            color: view === 'grid' ? 'var(--text)' : 'var(--text-muted)',
            borderTop: view === 'grid' ? '1px solid var(--text)' : 'none',
            display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px',
            marginTop: '-1px', cursor: 'pointer'
          }}
        >
          <Grid size={16} /> POSTS
        </button>
        <button 
          onClick={() => setView('list')}
          style={{ 
            background: 'none', border: 'none', padding: '15px 0', 
            color: view === 'list' ? 'var(--text)' : 'var(--text-muted)',
            borderTop: view === 'list' ? '1px solid var(--text)' : 'none',
            display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px',
            marginTop: '-1px', cursor: 'pointer'
          }}
        >
          <List size={16} /> FEED VIEW
        </button>
      </div>

      {view === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px' }}>
          {posts.map(post => (
            <div key={post._id} style={{ position: 'relative', paddingTop: '100%', overflow: 'hidden', borderRadius: '4px', cursor: 'pointer', background: 'var(--bg-secondary)' }}>
              {post.image ? (
                <img 
                  src={post.image} 
                  alt="Post" 
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : post.video ? (
                <video 
                  src={post.video} 
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px', textAlign: 'center', fontSize: '0.8rem' }}>
                  {post.content.substring(0, 50)}...
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {posts.map(post => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
