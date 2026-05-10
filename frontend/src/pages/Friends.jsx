import React, { useState, useEffect } from 'react';
import { Search, UserPlus, UserCheck, UserX, Users } from 'lucide-react';
import api from '../services/api';

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [friendsRes, requestsRes] = await Promise.all([
        api.get('/friends'),
        api.get('/friends/requests')
      ]);
      setFriends(friendsRes.data);
      setRequests(requestsRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 1) {
      try {
        const { data } = await api.get(`/users/search?query=${query}`);
        setSearchResults(data);
      } catch (err) {
        console.error(err);
      }
    } else {
      setSearchResults([]);
    }
  };

  const sendFriendRequest = async (userId) => {
    try {
      await api.post(`/friends/request/${userId}`);
      alert('Friend request sent!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending request');
    }
  };

  const handleRequest = async (requestId, action) => {
    try {
      await api.post(`/friends/${action}/${requestId}`);
      setRequests(requests.filter(r => r._id !== requestId));
      if (action === 'accept') fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="fade-in" style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;

  return (
    <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div className="glass-card" style={{ padding: '30px', marginBottom: '30px', borderRadius: '24px' }}>
        <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Users size={28} color="var(--primary)" />
          Find Friends
        </h2>
        <div style={{ position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchQuery}
            onChange={handleSearch}
            style={{ 
              paddingLeft: '48px', 
              height: '54px', 
              borderRadius: '16px', 
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              width: '100%'
            }}
          />
        </div>

        {searchResults.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            {searchResults.map(user => (
              <div key={user._id} className="fade-in" style={{ display: 'flex', alignItems: 'center', padding: '15px', borderRadius: '14px', border: '1px solid var(--border)', marginBottom: '10px' }}>
                <div className="avatar" style={{ width: '40px', height: '40px' }}>
                  {user.username[0].toUpperCase()}
                </div>
                <div style={{ marginLeft: '15px' }}>
                  <h4 style={{ margin: 0 }}>{user.username}</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.bio}</p>
                </div>
                <button 
                  onClick={() => sendFriendRequest(user._id)}
                  className="btn btn-primary" 
                  style={{ marginLeft: 'auto', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <UserPlus size={18} />
                  Add Friend
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
        {requests.length > 0 && (
          <div className="glass-card" style={{ padding: '30px', borderRadius: '24px' }}>
            <h3 style={{ marginBottom: '20px' }}>Friend Requests</h3>
            {requests.map(request => (
              <div key={request._id} style={{ display: 'flex', alignItems: 'center', padding: '15px', borderRadius: '14px', border: '1px solid var(--border)', marginBottom: '10px' }}>
                <div className="avatar" style={{ width: '40px', height: '40px' }}>
                  {request.sender.username[0].toUpperCase()}
                </div>
                <div style={{ marginLeft: '15px' }}>
                  <h4 style={{ margin: 0 }}>{request.sender.username}</h4>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
                  <button onClick={() => handleRequest(request._id, 'accept')} className="btn btn-primary" style={{ padding: '8px 12px' }}>
                    <UserCheck size={18} />
                  </button>
                  <button onClick={() => handleRequest(request._id, 'decline')} className="btn" style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                    <UserX size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="glass-card" style={{ padding: '30px', borderRadius: '24px' }}>
          <h3 style={{ marginBottom: '20px' }}>My Friends</h3>
          {friends.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No friends yet. Start searching to add some!</p>
          ) : (
            friends.map(friend => (
              <div key={friend._id} style={{ display: 'flex', alignItems: 'center', padding: '15px', borderRadius: '14px', border: '1px solid var(--border)', marginBottom: '10px' }}>
                <div className="avatar" style={{ width: '40px', height: '40px' }}>
                  {friend.username[0].toUpperCase()}
                </div>
                <div style={{ marginLeft: '15px' }}>
                  <h4 style={{ margin: 0 }}>{friend.username}</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{friend.bio}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Friends;
