import React from 'react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

export default function Home() {
  const [_, setLocation] = useLocation();

  return (
    <div className="flex flex-col items-center justify-center h-full py-10">
      <div className="max-w-md w-full text-center">
        <h1 className="text-5xl font-heading font-bold mb-8">
          <span className="text-primary">Role</span><span className="text-secondary">Call</span>
        </h1>
        <p className="text-lg mb-10 text-gray-300">
          A text-based strategy game of deduction and deception
        </p>
        
        <div className="space-y-4">
          <Button
            className="w-full bg-primary hover:bg-primary/90 py-3 px-6 rounded-lg font-bold text-lg"
            onClick={() => setLocation('/create-room')}
          >
            Create Game Room
          </Button>
          
          <Button
            className="w-full bg-secondary hover:bg-secondary/90 text-black py-3 px-6 rounded-lg font-bold text-lg"
            onClick={() => setLocation('/join-room')}
          >
            Join Game Room
          </Button>
          
          <Button
            variant="outline"
            className="w-full bg-darkElevated hover:bg-gray-800 py-3 px-6 rounded-lg font-bold text-lg border border-gray-700"
            onClick={() => setLocation('/public-rooms')}
          >
            Browse Public Rooms
          </Button>
        </div>
      </div>
      
      <div className="mt-20 text-center">
        <h3 className="font-heading font-semibold text-lg mb-2">How to Play</h3>
        <p className="text-gray-400 max-w-lg">
          Discover who's on your team and eliminate enemies using your secret role abilities.
          Trust no one—appearances can be deceiving!
        </p>
      </div>
    </div>
  );
}
