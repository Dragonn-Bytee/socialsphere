import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Send, User, Search, Info, Phone, Video, Image as ImageIcon, Smile } from 'lucide-react';

const Chat = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await api.get('/messages/conversations');
        setConversations(data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedFriend) {
      const fetchMessages = async () => {
        try {
          const { data } = await api.get(`/messages/${selectedFriend._id}`);
          setMessages(data);
          scrollToBottom();
        } catch (err) {
          console.error(err);
        }
      };
      fetchMessages();
    }
  }, [selectedFriend]);

  useEffect(() => {
    if (socket) {
      socket.on('receive_message', (data) => {
        if (selectedFriend && (data.senderId === selectedFriend._id || data.receiverId === selectedFriend._id)) {
          setMessages(prev => [...prev, data]);
          scrollToBottom();
        }
        // Update conversations list with latest message
        setConversations(prev => {
          const updated = prev.map(conv => {
            const otherUser = data.senderId === user.id ? data.receiverId : data.senderId;
            if (conv.user._id === otherUser) {
              return { ...conv, lastMessage: data.text, createdAt: data.createdAt };
            }
            return conv;
          });
          return updated;
        });
      });
    }
    return () => socket?.off('receive_message');
  }, [socket, selectedFriend, user.id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedFriend) return;

    const messageData = {
      receiverId: selectedFriend._id,
      text: newMessage
    };

    try {
      const { data } = await api.post('/messages', messageData);
      setMessages(prev => [...prev, data]);
      socket.emit('send_message', data);
      setNewMessage('');
      scrollToBottom();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 120px)', gap: '20px' }} className="fade-in">
      {/* Sidebar: Conversations */}
      <div className="glass-card" style={{ width: '360px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <h2 style={{ marginBottom: '20px', fontSize: '1.4rem' }}>Messages</h2>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              style={{ paddingLeft: '48px', height: '44px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}
            />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {conversations.map(conv => (
            <div 
              key={conv.user._id} 
              onClick={() => setSelectedFriend(conv.user)}
              style={{ 
                display: 'flex', 
                gap: '12px', 
                padding: '12px 16px', 
                borderRadius: '16px', 
                cursor: 'pointer',
                background: selectedFriend?._id === conv.user._id ? 'rgba(0, 209, 255, 0.1)' : 'transparent',
                transition: 'var(--transition)'
              }}
              className="action-btn"
            >
              <div className="avatar" style={{ width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0 }}>
                {conv.user.username[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{conv.user.username}</h4>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {new Date(conv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {conv.lastMessage}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main: Chat Window */}
      <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedFriend ? (
          <>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="avatar" style={{ width: '40px', height: '40px', borderRadius: '12px' }}>
                  {selectedFriend.username[0].toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{selectedFriend.username}</h3>
                  <span style={{ fontSize: '0.75rem', color: '#10b981' }}>Active now</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="action-btn" style={{ padding: '10px' }}><Phone size={20} /></button>
                <button className="action-btn" style={{ padding: '10px' }}><Video size={20} /></button>
                <button className="action-btn" style={{ padding: '10px' }}><Info size={20} /></button>
              </div>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    alignSelf: msg.senderId === user.id ? 'flex-end' : 'flex-start',
                    maxWidth: '70%'
                  }}
                >
                  <div style={{ 
                    padding: '12px 20px', 
                    borderRadius: msg.senderId === user.id ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                    background: msg.senderId === user.id ? 'var(--accent-gradient)' : 'rgba(255, 255, 255, 0.05)',
                    color: msg.senderId === user.id ? '#fff' : 'inherit',
                    border: msg.senderId === user.id ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: msg.senderId === user.id ? '0 4px 15px var(--primary-glow)' : 'none'
                  }}>
                    <p style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>{msg.text}</p>
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block', textAlign: msg.senderId === user.id ? 'right' : 'left' }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} style={{ padding: '20px 24px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button type="button" className="action-btn" style={{ padding: '10px' }}><ImageIcon size={22} /></button>
              <button type="button" className="action-btn" style={{ padding: '10px' }}><Smile size={22} /></button>
              <div style={{ flex: 1, position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  style={{ 
                    width: '100%', 
                    height: '48px', 
                    background: 'rgba(255, 255, 255, 0.03)', 
                    borderRadius: '24px', 
                    padding: '0 24px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '48px', height: '48px', padding: 0, borderRadius: '50%' }}>
                <Send size={20} />
              </button>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
            <div style={{ 
              width: '100px', 
              height: '100px', 
              borderRadius: '50%', 
              background: 'rgba(255, 255, 255, 0.03)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: '20px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <Send size={40} style={{ transform: 'rotate(-20deg)', color: 'var(--primary)' }} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Your Messages</h2>
            <p>Select a friend to start a conversation</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
