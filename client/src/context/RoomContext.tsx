import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useWebSocket } from '@/lib/websocket';
import { MessageType, type Room, type Player, type Message } from '@shared/schema';
import { useUser } from './UserContext';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface RoomContextType {
  // Room state
  currentRoom: Room | null;
  players: Player[];
  messages: Message[];
  loading: boolean;
  
  // Room actions
  createRoom: (roomData: {
    name: string;
    type: "public" | "private";
    capacity: number;
    allowChat: boolean;
  }) => void;
  joinRoom: (code: string) => void;
  leaveRoom: () => void;
  sendChatMessage: (content: string) => void;
  toggleReady: (ready: boolean) => void;
  startGame: () => void;
  updateRoomType: (isPublic: boolean) => void;
  
  // Public rooms
  publicRooms: (Room & { playerCount: number; hostName?: string })[];
  
  // Status
  isHost: boolean;
  isReady: boolean;
  error: string | null;
}

// Create initial default value
const defaultValue: RoomContextType = {
  currentRoom: null,
  players: [],
  messages: [],
  loading: false,
  publicRooms: [],
  isHost: false,
  isReady: false,
  error: null,
  createRoom: () => {},
  joinRoom: () => {},
  leaveRoom: () => {},
  sendChatMessage: () => {},
  toggleReady: () => {},
  startGame: () => {},
  updateRoomType: () => {}
};

const RoomContext = createContext<RoomContextType>(defaultValue);

export function RoomProvider({ children }: { children: React.ReactNode }) {
  const { username } = useUser();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [publicRooms, setPublicRooms] = useState<(Room & { playerCount: number })[]>([]);
  const [loading, setLoading] = useState(false);
  const [playerId, setPlayerId] = useState<number | null>(null);
  
  const {
    isConnected,
    lastMessage,
    error,
    connect,
    sendMessage
  } = useWebSocket();
  
  // Connect to websocket when username is available
  useEffect(() => {
    if (username && !isConnected) {
      console.log('Connecting WebSocket with username:', username);
      connect(username);
    }
  }, [username, isConnected, connect]);
  
  // Handle WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;
    
    console.log('Processing message in RoomContext:', lastMessage.type);
    
    switch (lastMessage.type) {
      case MessageType.CREATE_ROOM:
        if (lastMessage.payload.success) {
          console.log('Room created successfully:', lastMessage.payload.room);
          setCurrentRoom(lastMessage.payload.room);
          setPlayers([lastMessage.payload.player]);
          setPlayerId(lastMessage.payload.player.id);
          setMessages([]);
          setLoading(false);
          setLocation('/game-lobby');
        }
        break;
      
      case MessageType.JOIN_ROOM:
        if (lastMessage.payload.success) {
          console.log('Joined room successfully:', lastMessage.payload.room);
          setCurrentRoom(lastMessage.payload.room);
          setPlayers(lastMessage.payload.players || []);
          setPlayerId(lastMessage.payload.player.id);
          setMessages(lastMessage.payload.messages || []);
          setLoading(false);
          setLocation('/game-lobby');
        }
        break;
      
      case MessageType.LEAVE_ROOM:
        if (lastMessage.payload.success) {
          console.log('Left room successfully');
          setCurrentRoom(null);
          setPlayers([]);
          setPlayerId(null);
          setMessages([]);
        }
        break;
      
      case MessageType.ROOM_UPDATE:
        if (currentRoom && lastMessage.payload.room && lastMessage.payload.room.id === currentRoom.id) {
          console.log('Room updated:', lastMessage.payload.room);
          setCurrentRoom(lastMessage.payload.room);
          setPlayers(lastMessage.payload.players || []);
          if (lastMessage.payload.messages) {
            setMessages(lastMessage.payload.messages);
          }
        }
        break;
      
      case MessageType.CHAT_MESSAGE:
        if (currentRoom && lastMessage.payload.message && 
            lastMessage.payload.message.roomId === currentRoom.id) {
          console.log('New chat message received');
          setMessages(prev => [...prev, lastMessage.payload.message]);
        }
        break;
      
      case MessageType.ROOM_LIST_UPDATE:
        console.log('Public room list updated:', lastMessage.payload.rooms.length, 'rooms');
        setPublicRooms(lastMessage.payload.rooms || []);
        break;
      
      case MessageType.ERROR:
        console.error('Error from server:', lastMessage.payload.message);
        toast({
          title: "Error",
          description: lastMessage.payload.message,
          variant: "destructive"
        });
        setLoading(false);
        break;
    }
  }, [lastMessage, currentRoom, toast, setLocation]);
  
  // Create a room
  const createRoom = useCallback((roomData: {
    name: string;
    type: "public" | "private";
    capacity: number;
    allowChat: boolean;
  }) => {
    console.log('Creating room with data:', roomData);
    setLoading(true);
    sendMessage({
      type: MessageType.CREATE_ROOM,
      payload: {
        ...roomData,
        username
      }
    });
  }, [sendMessage, username]);
  
  // Join a room
  const joinRoom = useCallback((code: string) => {
    console.log('Joining room with code:', code);
    setLoading(true);
    sendMessage({
      type: MessageType.JOIN_ROOM,
      payload: {
        code,
        username
      }
    });
  }, [sendMessage, username]);
  
  // Leave current room
  const leaveRoom = useCallback(() => {
    if (!currentRoom || playerId === null) {
      console.warn('Cannot leave room: No current room or player ID');
      return;
    }
    
    console.log('Leaving room:', currentRoom.name);
    sendMessage({
      type: MessageType.LEAVE_ROOM,
      payload: {
        playerId
      }
    });
  }, [currentRoom, playerId, sendMessage]);
  
  // Send a chat message
  const sendChatMessage = useCallback((content: string) => {
    if (!currentRoom) {
      console.warn('Cannot send message: No current room');
      return;
    }
    
    console.log('Sending chat message:', content.substring(0, 20) + (content.length > 20 ? '...' : ''));
    sendMessage({
      type: MessageType.CHAT_MESSAGE,
      payload: {
        content
      }
    });
  }, [currentRoom, sendMessage]);
  
  // Toggle ready status
  const toggleReady = useCallback((ready: boolean) => {
    if (!currentRoom) {
      console.warn('Cannot toggle ready status: No current room');
      return;
    }
    
    console.log('Toggling ready status:', ready);
    sendMessage({
      type: MessageType.PLAYER_READY,
      payload: {
        ready
      }
    });
  }, [currentRoom, sendMessage]);
  
  // Calculate if user is host
  const isHost = players.some(player => 
    player.username === username && player.isHost
  );
  
  // Calculate if user is ready
  const isReady = players.some(player => 
    player.username === username && player.status === "ready"
  );
  
  // Start the game (host only)
  const startGame = useCallback(() => {
    if (!currentRoom) {
      console.warn('Cannot start game: No current room');
      return;
    }
    
    // Recalculate isHost within this callback to avoid circular dependency
    const playerIsHost = players.some(player => 
      player.username === username && player.isHost
    );
    
    if (!playerIsHost) {
      console.warn('Cannot start game: Not the host');
      return;
    }
    
    console.log('Starting game');
    sendMessage({
      type: MessageType.START_GAME,
      payload: {}
    });
  }, [currentRoom, players, username, sendMessage]);
  
  // Update room type (public/private) - host only
  const updateRoomType = useCallback((isPublic: boolean) => {
    if (!currentRoom) {
      console.warn('Cannot update room type: No current room');
      return;
    }
    
    // Recalculate isHost within this callback to avoid circular dependency
    const playerIsHost = players.some(player => 
      player.username === username && player.isHost
    );
    
    if (!playerIsHost) {
      console.warn('Cannot update room type: Not the host');
      return;
    }
    
    const newType = isPublic ? 'public' : 'private';
    console.log(`Updating room type to ${newType}`);
    
    sendMessage({
      type: MessageType.UPDATE_ROOM_SETTINGS,
      payload: {
        roomId: currentRoom.id,
        settings: {
          type: newType
        }
      }
    });
  }, [currentRoom, players, username, sendMessage]);
  
  // Log when state changes for debugging
  useEffect(() => {
    console.log('Room context state updated:', {
      room: currentRoom?.name || 'none',
      players: players.length,
      isConnected,
      loading
    });
  }, [currentRoom, players.length, isConnected, loading]);
  
  const contextValue: RoomContextType = {
    currentRoom,
    players,
    messages,
    loading,
    publicRooms,
    isHost,
    isReady,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    sendChatMessage,
    toggleReady,
    startGame,
    updateRoomType
  };
  
  return (
    <RoomContext.Provider value={contextValue}>
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  const context = useContext(RoomContext);
  if (context === defaultValue) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
}
