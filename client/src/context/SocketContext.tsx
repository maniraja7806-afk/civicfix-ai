import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { NotificationItem } from '../types';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  liveNotification: NotificationItem | null;
  clearLiveNotification: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [liveNotification, setLiveNotification] = useState<NotificationItem | null>(null);

  useEffect(() => {
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const s = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    s.on('connect', () => {
      setIsConnected(true);
      if (user?.id) {
        s.emit('join:user', user.id);
      }
      if (user?.role === 'officer' && user.departmentId) {
        s.emit('join:department', user.departmentId);
      }
      if (user?.role === 'admin') {
        s.emit('join:admin');
      }
    });

    s.on('disconnect', () => {
      setIsConnected(false);
    });

    s.on('notification:new', (notif: NotificationItem) => {
      setLiveNotification(notif);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [user]);

  const clearLiveNotification = () => {
    setLiveNotification(null);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        liveNotification,
        clearLiveNotification
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
