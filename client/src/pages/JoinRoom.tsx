import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocation } from 'wouter';
import { useRoom } from '@/context/RoomContext';
import { useUser } from '@/context/UserContext';

export default function JoinRoom() {
  const [_, setLocation] = useLocation();
  const { joinRoom, loading, currentRoom } = useRoom();
  const { username, setUsername } = useUser();
  
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState(username);

  // Navigate to game lobby when room is joined
  useEffect(() => {
    if (currentRoom) {
      setLocation('/game-lobby');
    }
  }, [currentRoom, setLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (playerName !== username) {
      setUsername(playerName);
    }
    
    joinRoom(roomCode);
    // Use direct window location for navigation
    window.location.href = '/game-lobby';
  };

  return (
    <div className="max-w-lg mx-auto py-6">
      <h2 className="text-2xl font-heading font-bold mb-6">Join Game Room</h2>
      
      <Card className="game-card rounded-lg bg-darkSurface border-gray-800">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Label htmlFor="code" className="block text-gray-300 mb-2">Enter Room Code</Label>
              <Input
                id="code"
                className="w-full bg-darkBg border border-gray-700 rounded p-3 text-white font-mono tracking-widest text-center uppercase"
                placeholder="ABCD123"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                required
                maxLength={7}
              />
              <p className="text-xs text-gray-400 mt-1">Room codes are case-insensitive</p>
            </div>
            
            <div className="mb-6">
              <Label htmlFor="playerName" className="block text-gray-300 mb-2">Your Display Name</Label>
              <Input
                id="playerName"
                className="w-full bg-darkBg border border-gray-700 rounded p-2 text-white"
                placeholder="Enter your game name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                required
              />
            </div>
            
            <div className="flex space-x-4">
              <Button 
                type="submit" 
                className="bg-secondary hover:bg-secondary/90 text-black py-2 px-6 rounded-lg font-bold flex-grow"
                disabled={loading}
              >
                Join Room
              </Button>
              <Button 
                type="button"
                variant="outline"
                className="bg-darkElevated hover:bg-gray-800 py-2 px-6 rounded-lg border border-gray-700"
                onClick={() => setLocation('/')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
