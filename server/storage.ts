import { eq, and, desc, asc } from 'drizzle-orm';
import { db } from './db';
import {
  users,
  type User,
  type InsertUser,
  rooms,
  type Room,
  type InsertRoom,
  players,
  type Player,
  type InsertPlayer,
  messages,
  type Message,
  type InsertMessage,
  RoomStatus,
  RoomType,
  PlayerStatus
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Room methods
  createRoom(roomData: InsertRoom): Promise<Room>;
  getRoomByCode(code: string): Promise<Room | undefined>;
  getRoomById(id: number): Promise<Room | undefined>;
  getPublicRooms(): Promise<Room[]>;
  updateRoomStatus(id: number, status: RoomStatus): Promise<Room | undefined>;
  updateRoomType(id: number, type: RoomType): Promise<Room | undefined>;
  deleteRoom(id: number): Promise<boolean>;
  
  // Player methods
  addPlayerToRoom(playerData: InsertPlayer): Promise<Player>;
  getPlayersInRoom(roomId: number): Promise<Player[]>;
  updatePlayerStatus(id: number, status: PlayerStatus): Promise<Player | undefined>;
  removePlayerFromRoom(id: number): Promise<boolean>;
  getPlayerByUsername(roomId: number, username: string): Promise<Player | undefined>;
  
  // Message methods
  addMessage(messageData: InsertMessage): Promise<Message>;
  getMessagesForRoom(roomId: number, limit?: number): Promise<Message[]>;
}

/**
 * PostgreSQL database implementation of the storage interface
 */
export class DatabaseStorage implements IStorage {
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.username, username));
    return results.length > 0 ? results[0] : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const results = await db.insert(users).values(insertUser).returning();
    return results[0];
  }
  
  // Room methods
  async createRoom(roomData: InsertRoom): Promise<Room> {
    // Generate a unique 6-character room code
    const code = generateRoomCode();
    
    // Insert the room with the generated code
    const results = await db.insert(rooms).values({
      ...roomData,
      code,
      status: RoomStatus.WAITING
    }).returning();
    
    return results[0];
  }
  
  async getRoomByCode(code: string): Promise<Room | undefined> {
    // Case-insensitive search for room code
    const results = await db.select().from(rooms)
      .where(eq(rooms.code, code.toUpperCase()));
      
    return results.length > 0 ? results[0] : undefined;
  }
  
  async getRoomById(id: number): Promise<Room | undefined> {
    const results = await db.select().from(rooms).where(eq(rooms.id, id));
    return results.length > 0 ? results[0] : undefined;
  }
  
  async getPublicRooms(): Promise<Room[]> {
    // Get all public rooms with waiting status
    return db.select().from(rooms).where(
      and(
        eq(rooms.type, RoomType.PUBLIC),
        eq(rooms.status, RoomStatus.WAITING)
      )
    );
  }
  
  async updateRoomStatus(id: number, status: RoomStatus): Promise<Room | undefined> {
    const results = await db.update(rooms)
      .set({ status })
      .where(eq(rooms.id, id))
      .returning();
      
    return results.length > 0 ? results[0] : undefined;
  }
  
  async updateRoomType(id: number, type: RoomType): Promise<Room | undefined> {
    const results = await db.update(rooms)
      .set({ type })
      .where(eq(rooms.id, id))
      .returning();
      
    return results.length > 0 ? results[0] : undefined;
  }
  
  async deleteRoom(id: number): Promise<boolean> {
    const results = await db.delete(rooms).where(eq(rooms.id, id)).returning();
    return results.length > 0;
  }
  
  // Player methods
  async addPlayerToRoom(playerData: InsertPlayer): Promise<Player> {
    const results = await db.insert(players).values(playerData).returning();
    return results[0];
  }
  
  async getPlayersInRoom(roomId: number): Promise<Player[]> {
    return db.select().from(players).where(eq(players.roomId, roomId));
  }
  
  async updatePlayerStatus(id: number, status: PlayerStatus): Promise<Player | undefined> {
    const results = await db.update(players)
      .set({ status })
      .where(eq(players.id, id))
      .returning();
      
    return results.length > 0 ? results[0] : undefined;
  }
  
  async removePlayerFromRoom(id: number): Promise<boolean> {
    const results = await db.delete(players).where(eq(players.id, id)).returning();
    return results.length > 0;
  }
  
  async getPlayerByUsername(roomId: number, username: string): Promise<Player | undefined> {
    const results = await db.select().from(players).where(
      and(
        eq(players.roomId, roomId),
        eq(players.username, username)
      )
    );
    
    return results.length > 0 ? results[0] : undefined;
  }
  
  // Message methods
  async addMessage(messageData: InsertMessage): Promise<Message> {
    const results = await db.insert(messages).values(messageData).returning();
    return results[0];
  }
  
  async getMessagesForRoom(roomId: number, limit: number = 50): Promise<Message[]> {
    // Get messages for a room, ordered by sent time (ascending)
    return db.select()
      .from(messages)
      .where(eq(messages.roomId, roomId))
      .orderBy(asc(messages.sentAt))
      .limit(limit);
  }
}

/**
 * In-memory implementation of the storage interface (for testing/development)
 */
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private rooms: Map<number, Room>;
  private players: Map<number, Player>;
  private messages: Map<number, Message>;
  
  private userId: number;
  private roomId: number;
  private playerId: number;
  private messageId: number;

  constructor() {
    this.users = new Map();
    this.rooms = new Map();
    this.players = new Map();
    this.messages = new Map();
    
    this.userId = 1;
    this.roomId = 1;
    this.playerId = 1;
    this.messageId = 1;
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Room methods
  async createRoom(roomData: InsertRoom): Promise<Room> {
    const id = this.roomId++;
    // Generate a unique 6-character alphanumeric code
    const code = generateRoomCode();
    
    const room: Room = {
      ...roomData,
      id,
      code,
      createdAt: new Date(),
      status: RoomStatus.WAITING
    };
    
    this.rooms.set(id, room);
    return room;
  }
  
  async getRoomByCode(code: string): Promise<Room | undefined> {
    return Array.from(this.rooms.values()).find(
      (room) => room.code.toLowerCase() === code.toLowerCase(),
    );
  }
  
  async getRoomById(id: number): Promise<Room | undefined> {
    return this.rooms.get(id);
  }
  
  async getPublicRooms(): Promise<Room[]> {
    return Array.from(this.rooms.values()).filter(
      (room) => room.type === RoomType.PUBLIC && room.status === RoomStatus.WAITING,
    );
  }
  
  async updateRoomStatus(id: number, status: RoomStatus): Promise<Room | undefined> {
    const room = this.rooms.get(id);
    if (room) {
      const updatedRoom = { ...room, status };
      this.rooms.set(id, updatedRoom);
      return updatedRoom;
    }
    return undefined;
  }
  
  async updateRoomType(id: number, type: RoomType): Promise<Room | undefined> {
    const room = this.rooms.get(id);
    if (room) {
      const updatedRoom = { ...room, type };
      this.rooms.set(id, updatedRoom);
      return updatedRoom;
    }
    return undefined;
  }
  
  async deleteRoom(id: number): Promise<boolean> {
    return this.rooms.delete(id);
  }
  
  // Player methods
  async addPlayerToRoom(playerData: InsertPlayer): Promise<Player> {
    const id = this.playerId++;
    const player: Player = {
      ...playerData,
      id,
      joinedAt: new Date(),
    };
    
    this.players.set(id, player);
    return player;
  }
  
  async getPlayersInRoom(roomId: number): Promise<Player[]> {
    return Array.from(this.players.values()).filter(
      (player) => player.roomId === roomId,
    );
  }
  
  async updatePlayerStatus(id: number, status: PlayerStatus): Promise<Player | undefined> {
    const player = this.players.get(id);
    if (player) {
      const updatedPlayer = { ...player, status };
      this.players.set(id, updatedPlayer);
      return updatedPlayer;
    }
    return undefined;
  }
  
  async removePlayerFromRoom(id: number): Promise<boolean> {
    return this.players.delete(id);
  }
  
  async getPlayerByUsername(roomId: number, username: string): Promise<Player | undefined> {
    return Array.from(this.players.values()).find(
      (player) => player.roomId === roomId && player.username === username,
    );
  }
  
  // Message methods
  async addMessage(messageData: InsertMessage): Promise<Message> {
    const id = this.messageId++;
    const message: Message = {
      ...messageData,
      id,
      sentAt: new Date(),
    };
    
    this.messages.set(id, message);
    return message;
  }
  
  async getMessagesForRoom(roomId: number, limit: number = 50): Promise<Message[]> {
    const roomMessages = Array.from(this.messages.values())
      .filter((message) => message.roomId === roomId)
      .sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());
    
    return roomMessages.slice(-limit);
  }
}

/**
 * Generate a better, more readable room code
 * Format: 6 characters, uppercase letters and numbers (avoiding ambiguous characters)
 */
function generateRoomCode(): string {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking characters (O/0, I/1)
  let code = '';
  
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }
  
  return code;
}

// Switch from MemStorage to DatabaseStorage for persistent data
export const storage = new DatabaseStorage();
