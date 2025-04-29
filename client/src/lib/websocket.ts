import { useState, useEffect, useCallback, useRef } from 'react';
import { MessageType, type WebSocketMessage } from '@shared/schema';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectingRef = useRef(false);

  const connect = useCallback((username: string) => {
    // Prevent multiple connection attempts
    if (connectingRef.current || (socketRef.current && socketRef.current.readyState !== WebSocket.CLOSED)) {
      return;
    }

    connectingRef.current = true;
    
    try {
      // Close any existing socket
      if (socketRef.current) {
        try {
          socketRef.current.close();
        } catch (e) {
          console.error('Error closing existing socket:', e);
        }
      }

      // Create WebSocket connection
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      console.log(`Connecting to WebSocket at ${wsUrl}`);
      
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        setError(null);
        connectingRef.current = false;
        
        // Send initial connect message with username
        try {
          socket.send(JSON.stringify({
            type: MessageType.CONNECT,
            payload: { username }
          }));
        } catch (err) {
          console.error('Error sending initial connect message:', err);
        }
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          console.log('Received WebSocket message:', message.type);
          
          // Handle error messages
          if (message.type === MessageType.ERROR) {
            setError(message.payload.message);
          }
          
          setLastMessage(message);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      socket.onerror = (err) => {
        console.error('WebSocket error occurred:', err);
        setError('WebSocket connection error');
        connectingRef.current = false;
      };

      socket.onclose = (event) => {
        console.log(`WebSocket disconnected, code: ${event.code}, reason: ${event.reason}`);
        setIsConnected(false);
        connectingRef.current = false;
        
        // Only reconnect if not closed intentionally
        if (event.code !== 1000) {
          // Schedule reconnect
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          
          console.log('Scheduling reconnection attempt in 2 seconds...');
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect WebSocket...');
            connect(username);
          }, 2000);
        }
      };
    } catch (err) {
      console.error('Error creating WebSocket connection:', err);
      setError('Failed to create WebSocket connection');
      connectingRef.current = false;
    }
  }, []);

  const disconnect = useCallback(() => {
    console.log('Disconnecting WebSocket intentionally');
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (socketRef.current) {
      // Use close code 1000 to indicate normal closure
      socketRef.current.close(1000, 'Disconnected intentionally');
      socketRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (!socketRef.current) {
      console.error('Cannot send message: WebSocket is null');
      setError('WebSocket not initialized');
      return;
    }
    
    if (socketRef.current.readyState !== WebSocket.OPEN) {
      console.error(`Cannot send message: WebSocket not open (state: ${socketRef.current.readyState})`);
      setError('WebSocket not connected');
      return;
    }
    
    try {
      const messageStr = JSON.stringify(message);
      socketRef.current.send(messageStr);
      console.log('Sent message:', message.type);
    } catch (err) {
      console.error('Error sending WebSocket message:', err);
      setError('Failed to send message');
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    lastMessage,
    error,
    connect,
    disconnect,
    sendMessage
  };
}
