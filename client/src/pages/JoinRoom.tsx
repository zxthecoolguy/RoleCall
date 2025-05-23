import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageType } from '@/App';
import { useRoom } from '@/context/RoomContext';
import { useUser } from '@/context/UserContext';

export default function JoinRoom({
  onNavigate
}: {
  onNavigate: (page: PageType) => void
}) {
  const { joinRoom, loading, currentRoom, error } = useRoom();
  const { username, setUsername } = useUser();
  
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState(username);
  const [joinAttempted, setJoinAttempted] = useState(false);
  const joinTimeoutRef = useRef<number | null>(null);

  // Track when we're trying to join
  useEffect(() => {
    return () => {
      // Clean up any pending timeouts when component unmounts
      if (joinTimeoutRef.current) {
        clearTimeout(joinTimeoutRef.current);
      }
    };
  }, []);

  // Debug current username value from context
  useEffect(() => {
    console.log('JoinRoom component - current username from context:', username);
  }, [username]);

  // Navigate to game lobby when successfully joined a room
  useEffect(() => {
    if (currentRoom && joinAttempted) {
      console.log('Successfully joined room, navigating to game lobby');
      onNavigate('game-lobby');
    }
  }, [currentRoom, joinAttempted, onNavigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Join Room form submitted - roomCode: ${roomCode}, playerName: ${playerName}, current username: ${username}`);
    
    // Set flag that we're attempting to join
    setJoinAttempted(true);
    
    // First update the username if changed
    if (playerName !== username) {
      console.log(`Username changing from ${username} to ${playerName}`);
      setUsername(playerName);
      
      // Give WebSocket connection time to update with the new username
      // before attempting to join the room
      console.log('Scheduling delayed join room call to allow username update to propagate');
      
      // Clear any existing timeout
      if (joinTimeoutRef.current) {
        clearTimeout(joinTimeoutRef.current);
      }
      
      // Set new timeout 
      joinTimeoutRef.current = window.setTimeout(() => {
        console.log(`Executing delayed join room with code: ${roomCode} as user: ${playerName}`);
        joinRoom(roomCode.toUpperCase()); // Ensure uppercase for consistency
        joinTimeoutRef.current = null;
      }, 1000);
    } else {
      // Username unchanged, join immediately
      console.log(`Joining room immediately with code: ${roomCode} as user: ${username}`);
      joinRoom(roomCode.toUpperCase()); // Ensure uppercase for consistency
    }
    
    // Let the useEffect handle navigation
  };

  // Reset join attempts if error occurs
  useEffect(() => {
    if (error) {
      console.error('Error occurred during join attempt:', error);
      setJoinAttempted(false);
    }
  }, [error]);

  return (
    <div className="max-w-lg mx-auto py-6">
      <h2 className="text-2xl font-heading font-bold mb-6">Join Game Room</h2>
      
      <Card className="game-card rounded-lg bg-darkSurface border-gray-800">
        <CardContent className="pt-6">
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded text-white text-sm">
              Error: {error}
            </div>
          )}
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
                onClick={() => onNavigate('home')}
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
