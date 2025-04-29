import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigation } from '@/App';
import { useRoom } from '@/context/RoomContext';
import RoomCard from '@/components/RoomCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function PublicRooms() {
  const { navigateTo } = useNavigation();
  const { publicRooms, joinRoom } = useRoom();

  const handleJoinRoom = (roomCode: string) => {
    joinRoom(roomCode);
    // Navigate to game lobby
    navigateTo('game-lobby');
  };

  if (!publicRooms) {
    return <PublicRoomsSkeleton />;
  }

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-heading font-bold">Public Game Rooms</h2>
        <Button
          variant="outline"
          className="bg-darkElevated hover:bg-gray-800 py-2 px-4 rounded-lg border border-gray-700 text-sm"
          onClick={() => navigateTo('home')}
        >
          Back
        </Button>
      </div>
      
      {publicRooms.length === 0 ? (
        <div className="text-center py-10">
          <h3 className="text-xl font-semibold mb-2">No Public Rooms Available</h3>
          <p className="text-gray-400 mb-6">Be the first to create a public game room!</p>
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={() => navigateTo('create-room')}
          >
            Create a Room
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {publicRooms.map((room) => (
              <RoomCard key={room.id} room={room} onJoin={handleJoinRoom} />
            ))}
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-400">
            Showing {publicRooms.length} available room{publicRooms.length !== 1 ? 's' : ''}
          </div>
        </>
      )}
    </div>
  );
}

function PublicRoomsSkeleton() {
  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-heading font-bold">Public Game Rooms</h2>
        <Button
          variant="outline"
          className="bg-darkElevated hover:bg-gray-800 py-2 px-4 rounded-lg border border-gray-700 text-sm"
          onClick={() => {}}
        >
          Back
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="game-card rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="p-4">
              <div className="flex justify-between text-sm mb-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-8" />
              </div>
              <div className="flex justify-between text-sm mb-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
