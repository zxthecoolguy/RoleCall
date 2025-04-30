import React from 'react';
import { Button } from '@/components/ui/button';

// Simple test navigation component without context
export default function TestNavigation({
  onNavigate
}: {
  onNavigate: (page: string) => void
}) {
  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Navigation Test</h1>
      <div className="space-y-4 mb-4">
        <Button onClick={() => onNavigate('home')}>
          Go to Home
        </Button>
        <Button onClick={() => onNavigate('create-room')}>
          Go to Create Room
        </Button>
        <Button onClick={() => onNavigate('join-room')}>
          Go to Join Room
        </Button>
        <Button onClick={() => onNavigate('public-rooms')}>
          Go to Public Rooms
        </Button>
        <Button onClick={() => onNavigate('game-lobby')}>
          Go to Game Lobby
        </Button>
        <Button onClick={() => onNavigate('admin')} variant="destructive">
          Admin Tools
        </Button>
      </div>
    </div>
  );
}