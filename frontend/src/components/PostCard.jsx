import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreVertical, Send, Cpu, ShieldCheck, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';

const PostCard = ({ post }) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const isLiked = likes.includes(user?.id);

  const handleLike = async () => {
    try {
      const { data } = await api.post(`/posts/${post._id}/like`);
      setLikes(data.likes);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComments = async () => {
    if (!showComments) {
      try {
        const { data } = await api.get(`/posts/${post._id}/comments`);
        setComments(data);
      } catch (err) {
        console.error(err);
      }
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const { data } = await api.post(`/posts/${post._id}/comments`, { text: commentText });
      setComments([...comments, data]);
      setCommentText('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="post-card glass-card fade-in" style={{ position: 'relative' }}>
      {/* Decorative Technical Labels */}
      <div style={{ position: 'absolute', top: '8px', right: '40px', display: 'flex', gap: '12px', opacity: 0.4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.6rem', color: 'var(--primary)', fontWeight: 800 }}>
          <Activity size={10} /> LIVE_FEED
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.6rem', color: 'var(--primary)', fontWeight: 800 }}>
          <ShieldCheck size={10} /> ENC_V2
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '8px', left: '24px', fontSize: '0.6rem', color: 'var(--primary)', fontWeight: 800, opacity: 0.3 }}>
        SYS_ID: 0x{post._id.slice(-6).toUpperCase()}
      </div>

      <div className="post-header" style={{ padding: '20px', display: 'flex', alignItems: 'center', zIndex: 10 }}>
        <Link to={`/profile/${post.userId._id}`} style={{ textDecoration: 'none' }}>
          <div className="avatar" style={{ borderRadius: '14px', width: '48px', height: '48px' }}>
            {post.userId.username[0].toUpperCase()}
          </div>
        </Link>
        <div style={{ marginLeft: '16px' }}>
          <Link to={`/profile/${post.userId._id}`} style={{ textDecoration: 'none' }}>
            <h4 style={{ fontWeight: 700, color: '#fff', fontSize: '1rem', marginBottom: '2px' }}>{post.userId.username}</h4>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
            <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--primary)', opacity: 0.5 }}></div>
            <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 800, letterSpacing: '0.05em' }}>LINK_STABLE</span>
          </div>
        </div>
        <button className="action-btn" style={{ marginLeft: 'auto', padding: '10px' }}>
          <MoreVertical size={20} />
        </button>
      </div>

      <div className="post-content" style={{ padding: '0 24px 20px', position: 'relative', zIndex: 10 }}>
        <p style={{ lineHeight: 1.7, fontSize: '1.05rem', color: 'var(--text)', fontWeight: 400 }}>{post.content}</p>
      </div>

      {post.image && (
        <div style={{ padding: '0 24px 24px', position: 'relative', zIndex: 10 }}>
          <img 
            src={post.image} 
            alt="Post content" 
            className="post-image" 
            style={{ borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'block', width: '100%', objectFit: 'cover' }} 
          />
        </div>
      )}

      {post.video && (
        <div style={{ padding: '0 24px 24px', position: 'relative', zIndex: 10 }}>
          <video 
            src={post.video} 
            controls 
            className="post-video" 
            style={{ borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'block', width: '100%' }} 
          />
        </div>
      )}

      <div className="post-actions" style={{ padding: '16px 24px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', gap: '12px', zIndex: 10 }}>
        <button 
          className={`action-btn ${isLiked ? 'active' : ''}`} 
          onClick={handleLike}
          style={{ 
            color: isLiked ? 'var(--primary)' : 'var(--text-muted)',
            background: isLiked ? 'rgba(0, 209, 255, 0.1)' : 'rgba(255, 255, 255, 0.03)'
          }}
        >
          <Heart size={22} fill={isLiked ? "var(--primary)" : "none"} />
          <span style={{ fontWeight: 600 }}>{likes.length}</span>
        </button>
        <button className="action-btn" onClick={fetchComments} style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
          <MessageCircle size={22} />
          <span style={{ fontWeight: 600 }}>{post.commentCount || 0}</span>
        </button>
        <button className="action-btn" style={{ marginLeft: 'auto', background: 'rgba(255, 255, 255, 0.03)' }}>
          <Share2 size={22} />
        </button>
      </div>

      {showComments && (
        <div className="comments-section" style={{ padding: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(0,0,0,0.1)', zIndex: 10 }}>
          <div className="comment-list" style={{ marginBottom: '24px' }}>
            {comments.map(comment => (
              <div key={comment._id} style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <div className="avatar" style={{ width: '36px', height: '36px', fontSize: '0.9rem', borderRadius: '12px' }}>
                  {comment.userId.username[0].toUpperCase()}
                </div>
                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.03)', 
                  padding: '12px 18px', 
                  borderRadius: '18px', 
                  flex: 1,
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <h5 style={{ margin: '0 0 6px', fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>{comment.userId.username}</h5>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input 
                type="text" 
                placeholder="Share your perspective..." 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                style={{ 
                  width: '100%',
                  padding: '12px 18px', 
                  borderRadius: '16px', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  color: '#fff',
                  fontSize: '0.95rem'
                }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '12px', borderRadius: '14px' }}>
              <Send size={20} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;
