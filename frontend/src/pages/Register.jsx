import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, UserPlus } from 'lucide-react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(username, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-bg-mesh"></div>
      <div className="auth-card glass-card fade-in" style={{ padding: '56px' }}>
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
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
            Initialize your presence
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
            <label>Unique Handle</label>
            <input 
              type="text" 
              required 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. space_cadet"
            />
          </div>
          <div className="input-group">
            <label>Network Email</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@sphere.com"
            />
          </div>
          <div className="input-group">
            <label>Access Code</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '18px', fontSize: '1rem', marginTop: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                Join the Network <UserPlus size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Already registered?
          </p>
          <Link to="/login" style={{ 
            color: 'var(--primary)', 
            fontWeight: 700, 
            textDecoration: 'none', 
            fontSize: '1rem'
          }}>
            Authenticate Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
