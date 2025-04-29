import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Room types
export enum RoomType {
  PUBLIC = "public",
  PRIVATE = "private",
}

export enum RoomStatus {
  WAITING = "waiting",
  STARTED = "started",
  ENDED = "ended",
}

export enum PlayerStatus {
  WAITING = "waiting",
  READY = "ready",
  PLAYING = "playing",
}

// Room model
export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull().default("public"), // public or private
  capacity: integer("capacity").notNull().default(8),
  allowChat: boolean("allow_chat").notNull().default(true),
  status: text("status").notNull().default("waiting"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertRoomSchema = createInsertSchema(rooms)
  .omit({ id: true, createdAt: true, code: true })
  .extend({
    type: z.enum(["public", "private"]),
    capacity: z.number().min(4).max(12),
  });

export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Room = typeof rooms.$inferSelect;

// Player model (players in a room)
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull(),
  userId: integer("user_id"),
  username: text("username").notNull(),
  status: text("status").notNull().default("waiting"),
  isHost: boolean("is_host").notNull().default(false),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

export const insertPlayerSchema = createInsertSchema(players)
  .omit({ id: true, joinedAt: true });

export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;

// Message model for chat
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull(),
  senderId: integer("sender_id"),
  senderName: text("sender_name").notNull(),
  content: text("content").notNull(),
  isSystem: boolean("is_system").notNull().default(false),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages)
  .omit({ id: true, sentAt: true });

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// WebSocket message types
export enum MessageType {
  JOIN_ROOM = "join_room",
  LEAVE_ROOM = "leave_room",
  CREATE_ROOM = "create_room",
  CHAT_MESSAGE = "chat_message",
  PLAYER_READY = "player_ready",
  START_GAME = "start_game",
  ROOM_UPDATE = "room_update",
  ERROR = "error",
  CONNECT = "connect",
  PLAYER_UPDATE = "player_update",
  ROOM_LIST_UPDATE = "room_list_update",
  UPDATE_ROOM_SETTINGS = "update_room_settings"
}

// WebSocket message format
export interface WebSocketMessage {
  type: MessageType;
  payload: any;
}
