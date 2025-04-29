import React from 'react';
import { Button } from '@/components/ui/button';
import { type Room } from '@shared/schema';
import { getRoomStatusBadge } from '@/lib/utils';

interface RoomCardProps {
  room: Room & { playerCount: number };
  onJoin: (roomCode: string) => void;
}

export default function RoomCard({ room, onJoin }: RoomCardProps) {
  const { color, text } = getRoomStatusBadge(room.status, room.playerCount, room.capacity);
  const isFull = room.playerCount >= room.capacity;

  return (
    <div className="game-card rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <h3 className="font-heading font-semibold">{room.name}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${color} text-black`}>{text}</span>
      </div>
      <div className="p-4">
        <div className="flex justify-between text-sm mb-3">
          <span className="text-gray-400">Players</span>
          <span>{room.playerCount}/{room.capacity}</span>
        </div>
        <div className="flex justify-between text-sm mb-4">
          <span className="text-gray-400">Room Code</span>
          <span className="font-mono">{room.code}</span>
        </div>
        {isFull ? (
          <Button 
            className="w-full bg-gray-700 cursor-not-allowed opacity-60" 
            disabled
          >
            Room Full
          </Button>
        ) : (
          <Button
            className="w-full bg-secondary hover:bg-secondary/90 text-black font-bold"
            onClick={() => onJoin(room.code)}
          >
            Join Game
          </Button>
        )}
      </div>
    </div>
  );
}
