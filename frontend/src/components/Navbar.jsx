import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, User, LogOut, Moon, Sun, Users, Home as HomeIcon, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { notifications } = useSocket();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 1) {
        try {
          const { data } = await api.get(`/users/search?q=${searchQuery}`);
          setSearchResults(data);
          setShowResults(true);
        } catch (err) {
          console.error(err);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <nav className="glass" style={{
      position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)',
      width: 'calc(100% - 32px)', maxWidth: '1280px', zIndex: 1000,
      height: '76px', display: 'flex', alignItems: 'center', padding: '0 32px',
      borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <h2 
          onClick={() => navigate('/')}
          style={{ 
            fontSize: '1.8rem', 
            fontWeight: 800, 
            background: 'var(--accent-gradient)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent', 
            cursor: 'pointer',
            letterSpacing: '-0.04em'
          }}
        >
          SocialSphere
        </h2>

        <div ref={searchRef} style={{ position: 'relative', maxWidth: '400px', width: '100%', margin: '0 40px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Explore the Sphere..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length > 1 && setShowResults(true)}
            style={{ 
              paddingLeft: '48px', 
              background: 'rgba(255, 255, 255, 0.03)', 
              border: '1px solid rgba(255, 255, 255, 0.1)',
              height: '44px',
              width: '100%',
              borderRadius: '14px',
              color: '#fff'
            }}
          />

          {showResults && searchResults.length > 0 && (
            <div className="glass-card" style={{ 
              position: 'absolute', 
              top: '54px', 
              left: 0, 
              right: 0, 
              maxHeight: '400px', 
              overflowY: 'auto', 
              zIndex: 1001,
              padding: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              {searchResults.map(u => (
                <div 
                  key={u._id} 
                  onClick={() => {
                    navigate(`/profile/${u._id}`);
                    setShowResults(false);
                    setSearchQuery('');
                  }}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    padding: '10px 16px', 
                    borderRadius: '12px', 
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                  className="action-btn"
                >
                  <div className="avatar" style={{ width: '36px', height: '36px', fontSize: '0.9rem', borderRadius: '10px' }}>
                    {u.username[0].toUpperCase()}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{u.username}</h4>
                    {u.bio && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{u.bio}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/" className="action-btn" style={{ padding: '12px' }}>
            <HomeIcon size={24} />
          </Link>
          
          <Link to="/friends" className="action-btn" style={{ padding: '12px' }}>
            <Users size={24} />
          </Link>

          <Link to="/chat" className="action-btn" style={{ padding: '12px' }}>
            <MessageSquare size={24} />
          </Link>

          <button onClick={toggleTheme} className="action-btn" style={{ padding: '12px' }}>
            {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
          </button>
          
          <div style={{ position: 'relative', cursor: 'pointer', padding: '12px' }} className="action-btn">
            <Bell size={24} />
            {notifications.length > 0 && (
              <span style={{
                position: 'absolute', top: '8px', right: '8px',
                background: 'var(--primary)', color: '#000', borderRadius: '50%',
                fontSize: '10px', width: '18px', height: '18px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800,
                boxShadow: '0 0 10px var(--primary-glow)'
              }}>
                {notifications.length}
              </span>
            )}
          </div>

          <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.1)', margin: '0 8px' }}></div>

          <Link to={`/profile/${user?.id}`} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            padding: '4px 4px 4px 16px', 
            borderRadius: '16px', 
            cursor: 'pointer', 
            background: 'rgba(255, 255, 255, 0.05)', 
            border: '1px solid rgba(255, 255, 255, 0.1)', 
            textDecoration: 'none', 
            color: 'inherit',
            transition: 'var(--transition)'
          }} className="action-btn">
            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{user?.username}</span>
            <div className="avatar" style={{ width: '36px', height: '36px', fontSize: '0.9rem', borderRadius: '12px' }}>
              {user?.username?.[0].toUpperCase()}
            </div>
          </Link>

          <button onClick={logout} className="action-btn" title="Logout" style={{ padding: '12px', color: '#ff4b4b' }}>
            <LogOut size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
