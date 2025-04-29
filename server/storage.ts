import { v4 as uuidv4 } from "uuid";
import {
  users,
  type User,
  type InsertUser,
  type Room,
  type InsertRoom,
  type Player,
  type InsertPlayer,
  type Message,
  type InsertMessage,
  RoomStatus,
  RoomType,
  PlayerStatus
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need
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

// Helper function to generate a random room code (6 characters, alphanumeric)
function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export const storage = new MemStorage();
