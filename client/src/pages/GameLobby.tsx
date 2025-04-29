import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { useRoom } from '@/context/RoomContext';
import { useUser } from '@/context/UserContext';
import PlayerCard, { EmptyPlayerSlot } from '@/components/PlayerCard';
import ChatPanel from '@/components/ChatPanel';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRoomCode } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RoomType } from '@shared/schema';

export default function GameLobby() {
  const [_, setLocation] = useLocation();
  const { currentRoom, players, isHost, isReady, toggleReady, leaveRoom, startGame } = useRoom();
  const { username } = useUser();
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showDisbandDialog, setShowDisbandDialog] = useState(false);

  useEffect(() => {
    if (!currentRoom) {
      setLocation('/');
    }
  }, [currentRoom, setLocation]);

  if (!currentRoom || !players) {
    return <GameLobbySkeleton />;
  }

  const handleLeave = () => {
    leaveRoom();
    setLocation('/');
  };

  const handleDisband = () => {
    leaveRoom();
    setLocation('/');
  };

  const canStartGame = players.length >= 4 && 
    players.every(p => p.isHost || p.status === "ready");
  
  // Create empty slots based on room capacity
  const emptySlots = [];
  for (let i = 0; i < currentRoom.capacity - players.length; i++) {
    emptySlots.push(<EmptyPlayerSlot key={`empty-${i}`} />);
  }

  return (
    <div className="py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="game-card rounded-lg overflow-hidden bg-darkSurface border-gray-800">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-heading font-bold">{currentRoom.name}</h2>
              <div>
                <span className="room-code bg-darkBg text-white px-3 py-1 rounded text-sm font-mono">
                  CODE: {formatRoomCode(currentRoom.code)}
                </span>
              </div>
            </div>
            
            <div className="p-5">
              <div className="mb-6">
                <h3 className="font-heading font-semibold mb-3">Players</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {players.map((player) => (
                    <PlayerCard 
                      key={player.id} 
                      player={player}
                      isCurrentPlayer={player.username === username}
                    />
                  ))}
                  {emptySlots}
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-heading font-semibold mb-3">Room Settings</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between p-2 bg-darkBg rounded">
                    <span className="text-gray-400">Room Type</span>
                    <span className="capitalize">{currentRoom.type}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-darkBg rounded">
                    <span className="text-gray-400">Player Capacity</span>
                    <span>{currentRoom.capacity} players</span>
                  </div>
                  <div className="flex justify-between p-2 bg-darkBg rounded">
                    <span className="text-gray-400">In-game Chat</span>
                    <span>{currentRoom.allowChat ? "Enabled" : "Disabled"}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-darkBg rounded">
                    <span className="text-gray-400">Game Status</span>
                    <span className="text-success capitalize">{currentRoom.status}</span>
                  </div>
                </div>
              </div>
              
              {isHost ? (
                // Admin Controls
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button
                    className="bg-primary hover:bg-primary/90 py-2 px-6 rounded-lg font-bold"
                    onClick={startGame}
                    disabled={!canStartGame}
                  >
                    {players.length < 4 
                      ? "Start Game (Need 4+)" 
                      : players.some(p => !p.isHost && p.status !== "ready")
                        ? "Start Game (Not All Ready)"
                        : "Start Game"}
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-darkElevated hover:bg-gray-800 py-2 px-4 rounded-lg border border-gray-700"
                  >
                    Room Settings
                  </Button>
                  <Button
                    variant="outline"
                    className="hover:bg-error hover:text-white py-2 px-4 rounded-lg border border-error text-error"
                    onClick={() => setShowDisbandDialog(true)}
                  >
                    Disband Room
                  </Button>
                </div>
              ) : (
                // Player Controls
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button
                    className={isReady 
                      ? "bg-gray-700 hover:bg-gray-600 py-2 px-6 rounded-lg font-bold" 
                      : "bg-success hover:bg-success/90 py-2 px-6 rounded-lg font-bold"
                    }
                    onClick={() => toggleReady(!isReady)}
                  >
                    {isReady ? "Cancel Ready" : "Ready Up"}
                  </Button>
                  <Button
                    variant="outline"
                    className="hover:bg-error hover:text-white py-2 px-4 rounded-lg border border-error text-error"
                    onClick={() => setShowLeaveDialog(true)}
                  >
                    Leave Room
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <ChatPanel />
        </div>
      </div>

      {/* Leave Room Dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent className="bg-darkSurface text-white border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Room</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave this room? You'll need the room code to rejoin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-darkElevated hover:bg-gray-800 border-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-error hover:bg-error/90 text-white"
              onClick={handleLeave}
            >
              Leave Room
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Disband Room Dialog */}
      <AlertDialog open={showDisbandDialog} onOpenChange={setShowDisbandDialog}>
        <AlertDialogContent className="bg-darkSurface text-white border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle>Disband Room</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disband this room? This action will remove all players and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-darkElevated hover:bg-gray-800 border-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-error hover:bg-error/90 text-white"
              onClick={handleDisband}
            >
              Disband Room
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function GameLobbySkeleton() {
  return (
    <div className="py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="game-card rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-24" />
            </div>
            
            <div className="p-5">
              <div className="mb-6">
                <h3 className="font-heading font-semibold mb-3">Players</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-heading font-semibold mb-3">Room Settings</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-10 w-full rounded-lg" />
                  ))}
                </div>
              </div>
              
              <div className="mt-8 flex gap-3">
                <Skeleton className="h-10 w-32 rounded-lg" />
                <Skeleton className="h-10 w-32 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="game-card rounded-lg overflow-hidden h-full">
            <div className="p-4 border-b border-gray-800">
              <h3 className="font-heading font-semibold">Lobby Chat</h3>
            </div>
            
            <div className="p-4 h-96">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg mb-3" />
              ))}
            </div>
            
            <div className="p-3 border-t border-gray-800">
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
