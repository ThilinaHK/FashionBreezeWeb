'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface SocketContextType {
  socket: any;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false
});

export const useSocket = () => useContext(SocketContext);

export default function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Mock socket for now - can be replaced with actual socket.io later
    const mockSocket = {
      emit: () => {},
      on: () => {},
      off: () => {},
      disconnect: () => {}
    };
    
    setSocket(mockSocket);
    setIsConnected(true);

    return () => {
      setIsConnected(false);
      setSocket(null);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}