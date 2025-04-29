import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocketServer, WebSocket } from "ws";
import { 
  MessageType, 
  type WebSocketMessage, 
  RoomStatus, 
  PlayerStatus, 
  type Room, 
  type Player 
} from "@shared/schema";

// Map to track connected clients
const clients = new Map<WebSocket, { username: string; roomId?: number; playerId?: number }>();

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // API route to get public rooms
  app.get("/api/rooms", async (req, res) => {
    try {
      const publicRooms = await storage.getPublicRooms();
      
      // For each room, get the player count
      const roomsWithPlayerCount = await Promise.all(
        publicRooms.map(async (room) => {
          const players = await storage.getPlayersInRoom(room.id);
          return {
            ...room,
            playerCount: players.length
          };
        })
      );
      
      res.json(roomsWithPlayerCount);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rooms" });
    }
  });

  // API route to get a room by code
  app.get("/api/rooms/:code", async (req, res) => {
    try {
      const { code } = req.params;
      const room = await storage.getRoomByCode(code);
      
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      
      const players = await storage.getPlayersInRoom(room.id);
      
      res.json({
        ...room,
        players
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch room" });
    }
  });

  const httpServer = createServer(app);

  // Set up WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('Client connected');
    
    // Initialize client data
    clients.set(ws, { username: "" });

    // Handle incoming messages
    ws.on('message', async (message) => {
      try {
        const data: WebSocketMessage = JSON.parse(message.toString());
        console.log(`Received: ${data.type}`, data.payload);

        switch (data.type) {
          case MessageType.CONNECT:
            handleConnect(ws, data.payload);
            break;
            
          case MessageType.CREATE_ROOM:
            await handleCreateRoom(ws, data.payload);
            break;
            
          case MessageType.JOIN_ROOM:
            await handleJoinRoom(ws, data.payload);
            break;
            
          case MessageType.LEAVE_ROOM:
            await handleLeaveRoom(ws, data.payload);
            break;
            
          case MessageType.CHAT_MESSAGE:
            await handleChatMessage(ws, data.payload);
            break;
            
          case MessageType.PLAYER_READY:
            await handlePlayerReady(ws, data.payload);
            break;
            
          case MessageType.START_GAME:
            await handleStartGame(ws, data.payload);
            break;
            
          default:
            sendErrorToClient(ws, "Unknown message type");
        }
      } catch (error) {
        console.error("Error processing message:", error);
        sendErrorToClient(ws, "Failed to process message");
      }
    });

    // Handle disconnect
    ws.on('close', async () => {
      const clientData = clients.get(ws);
      if (clientData && clientData.roomId && clientData.playerId) {
        await handlePlayerDisconnect(clientData.roomId, clientData.playerId);
      }
      clients.delete(ws);
      console.log('Client disconnected');
    });
  });

  return httpServer;
}

// WebSocket handler functions
function handleConnect(ws: WebSocket, payload: { username: string }) {
  const { username } = payload;
  clients.set(ws, { ...clients.get(ws)!, username });
  
  // Send confirmation
  sendToClient(ws, {
    type: MessageType.CONNECT,
    payload: { username, connected: true }
  });
  
  // Send public rooms list
  broadcastPublicRooms();
}

async function handleCreateRoom(ws: WebSocket, payload: {
  name: string;
  type: "public" | "private";
  capacity: number;
  allowChat: boolean;
  username: string;
}) {
  const { name, type, capacity, allowChat, username } = payload;
  
  try {
    // Create the room
    const room = await storage.createRoom({
      name,
      type,
      capacity,
      allowChat,
      createdBy: 0, // Since we don't have user auth, use 0 as a placeholder
      status: RoomStatus.WAITING
    });
    
    // Add the creator as a player and host
    const player = await storage.addPlayerToRoom({
      roomId: room.id,
      username,
      userId: null, // No user auth
      status: PlayerStatus.WAITING,
      isHost: true
    });
    
    // Update client data
    clients.set(ws, { 
      ...clients.get(ws)!, 
      roomId: room.id,
      playerId: player.id
    });
    
    // Add system message
    await storage.addMessage({
      roomId: room.id,
      senderId: null,
      senderName: "SYSTEM",
      content: `Room "${name}" created by ${username}`,
      isSystem: true
    });
    
    // Send room data to client
    sendToClient(ws, {
      type: MessageType.CREATE_ROOM,
      payload: { 
        room,
        player,
        success: true 
      }
    });
    
    // Update public rooms list for all clients
    if (type === 'public') {
      broadcastPublicRooms();
    }
  } catch (error) {
    console.error("Error creating room:", error);
    sendErrorToClient(ws, "Failed to create room");
  }
}

async function handleJoinRoom(ws: WebSocket, payload: {
  code: string;
  username: string;
}) {
  const { code, username } = payload;
  
  try {
    // Find the room
    const room = await storage.getRoomByCode(code);
    
    if (!room) {
      return sendErrorToClient(ws, "Room not found");
    }
    
    if (room.status !== RoomStatus.WAITING) {
      return sendErrorToClient(ws, "Game has already started");
    }
    
    // Check if username is already taken in this room
    const existingPlayer = await storage.getPlayerByUsername(room.id, username);
    if (existingPlayer) {
      return sendErrorToClient(ws, "Username already taken in this room");
    }
    
    // Check if room is full
    const players = await storage.getPlayersInRoom(room.id);
    if (players.length >= room.capacity) {
      return sendErrorToClient(ws, "Room is full");
    }
    
    // Add player to room
    const player = await storage.addPlayerToRoom({
      roomId: room.id,
      username,
      userId: null, // No user auth
      status: PlayerStatus.WAITING,
      isHost: false
    });
    
    // Update client data
    clients.set(ws, { 
      ...clients.get(ws)!, 
      roomId: room.id,
      playerId: player.id
    });
    
    // Add system message
    await storage.addMessage({
      roomId: room.id,
      senderId: null,
      senderName: "SYSTEM",
      content: `${username} has joined the room`,
      isSystem: true
    });
    
    // Get messages for the room
    const messages = await storage.getMessagesForRoom(room.id);
    
    // Send room data to the client
    sendToClient(ws, {
      type: MessageType.JOIN_ROOM,
      payload: { 
        room,
        players,
        player,
        messages,
        success: true 
      }
    });
    
    // Notify other players in the room
    broadcastRoomUpdate(room.id);
  } catch (error) {
    console.error("Error joining room:", error);
    sendErrorToClient(ws, "Failed to join room");
  }
}

async function handleLeaveRoom(ws: WebSocket, payload: { playerId: number }) {
  const { playerId } = payload;
  const clientData = clients.get(ws);
  
  if (!clientData || !clientData.roomId) {
    return sendErrorToClient(ws, "Not in a room");
  }
  
  try {
    const room = await storage.getRoomById(clientData.roomId);
    if (!room) return;
    
    const player = await removePlayerFromRoom(clientData.roomId, playerId);
    if (!player) return;
    
    // Update client data
    clients.set(ws, { 
      username: clientData.username,
    });
    
    // Send confirmation to client
    sendToClient(ws, {
      type: MessageType.LEAVE_ROOM,
      payload: { success: true }
    });
    
    // Update public rooms list
    if (room.type === "public") {
      broadcastPublicRooms();
    }
  } catch (error) {
    console.error("Error leaving room:", error);
    sendErrorToClient(ws, "Failed to leave room");
  }
}

async function handleChatMessage(ws: WebSocket, payload: { content: string }) {
  const { content } = payload;
  const clientData = clients.get(ws);
  
  if (!clientData || !clientData.roomId) {
    return sendErrorToClient(ws, "Not in a room");
  }
  
  try {
    // Create message
    const message = await storage.addMessage({
      roomId: clientData.roomId,
      senderId: null,
      senderName: clientData.username,
      content,
      isSystem: false
    });
    
    // Broadcast to all clients in the room
    broadcastToRoom(clientData.roomId, {
      type: MessageType.CHAT_MESSAGE,
      payload: { message }
    });
  } catch (error) {
    console.error("Error sending chat message:", error);
    sendErrorToClient(ws, "Failed to send message");
  }
}

async function handlePlayerReady(ws: WebSocket, payload: { ready: boolean }) {
  const { ready } = payload;
  const clientData = clients.get(ws);
  
  if (!clientData || !clientData.roomId || !clientData.playerId) {
    return sendErrorToClient(ws, "Not in a room");
  }
  
  try {
    // Update player status
    const status = ready ? PlayerStatus.READY : PlayerStatus.WAITING;
    const updatedPlayer = await storage.updatePlayerStatus(clientData.playerId, status);
    
    if (updatedPlayer) {
      // Broadcast player update to all clients in the room
      broadcastRoomUpdate(clientData.roomId);
    }
  } catch (error) {
    console.error("Error updating player status:", error);
    sendErrorToClient(ws, "Failed to update status");
  }
}

async function handleStartGame(ws: WebSocket, payload: any) {
  const clientData = clients.get(ws);
  
  if (!clientData || !clientData.roomId) {
    return sendErrorToClient(ws, "Not in a room");
  }
  
  try {
    // Verify player is host
    const players = await storage.getPlayersInRoom(clientData.roomId);
    const player = players.find(p => p.id === clientData.playerId);
    
    if (!player || !player.isHost) {
      return sendErrorToClient(ws, "Only the host can start the game");
    }
    
    const room = await storage.getRoomById(clientData.roomId);
    if (!room) return;
    
    // Check minimum players (4)
    if (players.length < 4) {
      return sendErrorToClient(ws, "Need at least 4 players to start");
    }
    
    // Check if all players are ready
    const allReady = players.every(p => p.isHost || p.status === PlayerStatus.READY);
    if (!allReady) {
      return sendErrorToClient(ws, "Not all players are ready");
    }
    
    // Update room status
    await storage.updateRoomStatus(clientData.roomId, RoomStatus.STARTED);
    
    // Add system message
    await storage.addMessage({
      roomId: clientData.roomId,
      senderId: null,
      senderName: "SYSTEM",
      content: "Game has started!",
      isSystem: true
    });
    
    // Broadcast game start to all clients in the room
    broadcastToRoom(clientData.roomId, {
      type: MessageType.START_GAME,
      payload: { started: true }
    });
    
    // Update public rooms list
    if (room.type === "public") {
      broadcastPublicRooms();
    }
  } catch (error) {
    console.error("Error starting game:", error);
    sendErrorToClient(ws, "Failed to start game");
  }
}

async function handlePlayerDisconnect(roomId: number, playerId: number) {
  try {
    const player = await removePlayerFromRoom(roomId, playerId);
    if (!player) return;
    
    const room = await storage.getRoomById(roomId);
    if (!room) return;
    
    // Update public rooms
    if (room.type === "public") {
      broadcastPublicRooms();
    }
  } catch (error) {
    console.error("Error handling player disconnect:", error);
  }
}

// Helper functions
async function removePlayerFromRoom(roomId: number, playerId: number): Promise<Player | null> {
  try {
    // Get player info before removing
    const players = await storage.getPlayersInRoom(roomId);
    const player = players.find(p => p.id === playerId);
    
    if (!player) return null;
    
    // Remove player from room
    await storage.removePlayerFromRoom(playerId);
    
    // Add system message
    await storage.addMessage({
      roomId,
      senderId: null,
      senderName: "SYSTEM",
      content: `${player.username} has left the room`,
      isSystem: true
    });
    
    // If player was host, assign a new host
    if (player.isHost && players.length > 1) {
      const remainingPlayers = players.filter(p => p.id !== playerId);
      const newHost = remainingPlayers[0];
      
      const updatedPlayer = await storage.addPlayerToRoom({
        ...newHost,
        isHost: true
      });
      
      // Add system message about new host
      await storage.addMessage({
        roomId,
        senderId: null,
        senderName: "SYSTEM",
        content: `${updatedPlayer.username} is now the host`,
        isSystem: true
      });
    }
    
    // If no players left, delete the room
    if (players.length <= 1) {
      await storage.deleteRoom(roomId);
    } else {
      // Otherwise, notify other players
      broadcastRoomUpdate(roomId);
    }
    
    return player;
  } catch (error) {
    console.error("Error removing player from room:", error);
    return null;
  }
}

async function broadcastPublicRooms() {
  try {
    const publicRooms = await storage.getPublicRooms();
    
    // For each room, get the player count
    const roomsWithPlayerCount = await Promise.all(
      publicRooms.map(async (room) => {
        const players = await storage.getPlayersInRoom(room.id);
        return {
          ...room,
          playerCount: players.length
        };
      })
    );
    
    // Broadcast to all connected clients
    for (const [client, data] of clients.entries()) {
      if (client.readyState === WebSocket.OPEN) {
        sendToClient(client, {
          type: MessageType.ROOM_LIST_UPDATE,
          payload: { rooms: roomsWithPlayerCount }
        });
      }
    }
  } catch (error) {
    console.error("Error broadcasting public rooms:", error);
  }
}

async function broadcastRoomUpdate(roomId: number) {
  try {
    const room = await storage.getRoomById(roomId);
    if (!room) return;
    
    const players = await storage.getPlayersInRoom(roomId);
    const messages = await storage.getMessagesForRoom(roomId);
    
    broadcastToRoom(roomId, {
      type: MessageType.ROOM_UPDATE,
      payload: { room, players, messages }
    });
  } catch (error) {
    console.error("Error broadcasting room update:", error);
  }
}

function broadcastToRoom(roomId: number, message: WebSocketMessage) {
  for (const [client, data] of clients.entries()) {
    if (data.roomId === roomId && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }
}

function sendToClient(client: WebSocket, message: WebSocketMessage) {
  if (client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(message));
  }
}

function sendErrorToClient(client: WebSocket, errorMessage: string) {
  sendToClient(client, {
    type: MessageType.ERROR,
    payload: { message: errorMessage }
  });
}
