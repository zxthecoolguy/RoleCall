import React from 'react';
import { cn, getInitial, getAvatarColor, getPlayerStatusText, getPlayerStatusColor } from '@/lib/utils';
import { type Player } from '@shared/schema';
import { Crown } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
  isCurrentPlayer?: boolean;
}

export default function PlayerCard({ player, isCurrentPlayer = false }: PlayerCardProps) {
  const initial = getInitial(player.username);
  const avatarColor = getAvatarColor(player.username);
  const statusText = getPlayerStatusText(player.status);
  const statusColor = getPlayerStatusColor(player.status);

  return (
    <div className={cn(
      "bg-darkBg rounded-lg p-3 flex items-center",
      isCurrentPlayer && "ring-1 ring-primary"
    )}>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center mr-3",
        avatarColor
      )}>
        <span className={cn(
          "font-bold",
          avatarColor === "bg-secondary" ? "text-darkBg" : "text-white"
        )}>
          {initial}
        </span>
      </div>
      <div>
        <p className="font-medium">{player.username}</p>
        {player.isHost ? (
          <span className="text-xs bg-accent px-2 py-0.5 rounded text-darkBg">Host</span>
        ) : (
          player.status === "ready" ? (
            <span className="text-xs bg-success px-2 py-0.5 rounded text-darkBg">Ready</span>
          ) : (
            <span className="text-xs text-gray-400">{statusText}</span>
          )
        )}
      </div>
    </div>
  );
}

export function EmptyPlayerSlot() {
  return (
    <div className="bg-darkBg rounded-lg p-3 flex items-center opacity-60">
      <div className="w-8 h-8 rounded-full bg-darkElevated flex items-center justify-center mr-3 border-2 border-dashed border-gray-700">
        <span className="text-2xl text-gray-500">+</span>
      </div>
      <div>
        <p className="font-medium text-gray-500">Open Slot</p>
      </div>
    </div>
  );
}
