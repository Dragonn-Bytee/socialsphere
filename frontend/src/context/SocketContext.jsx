import React, { createContext, useEffect, useState, useContext } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:5000');
      setSocket(newSocket);

      newSocket.emit('join', user.id);

      newSocket.on('notification', (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        // Show browser notification if needed or just update UI
      });

      return () => newSocket.close();
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, notifications }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
