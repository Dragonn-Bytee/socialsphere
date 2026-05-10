import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, ChevronRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-bg-mesh"></div>
      <div className="auth-card glass-card fade-in" style={{ padding: '64px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            background: 'var(--accent-gradient)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent', 
            marginBottom: '12px',
            letterSpacing: '-0.06em'
          }}>
            SocialSphere
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 300, letterSpacing: '0.02em' }}>
            Enter the digital horizon
          </p>
        </div>

        {error && (
          <div style={{ 
            background: 'rgba(255, 180, 171, 0.1)', 
            color: '#ffb4ab', 
            padding: '16px 20px', 
            borderRadius: '16px', 
            marginBottom: '32px', 
            fontSize: '0.9rem', 
            border: '1px solid rgba(255, 180, 171, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ffb4ab' }}></div>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Authentication Email</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="explorer@sphere.com"
            />
          </div>
          <div className="input-group">
            <label>Security Key</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '18px', fontSize: '1rem', marginTop: '16px', borderRadius: '16px' }} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                Initiate Access <ChevronRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            New to the network?
          </p>
          <Link to="/register" style={{ 
            color: 'var(--primary)', 
            fontWeight: 700, 
            textDecoration: 'none', 
            fontSize: '1rem',
            transition: 'var(--transition)'
          }}>
            Create New Identity
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
