import React from 'react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { Users, Swords, Eye, Shield, UserCheck } from 'lucide-react';

export default function Home() {
  const [_, setLocation] = useLocation();

  return (
    <div className="flex flex-col items-center justify-center h-full py-10 relative">
      {/* Mysterious animated gradient overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-glowBlue rounded-full filter blur-[100px] animate-pulse" 
             style={{animationDuration: '7s'}}></div>
        <div className="absolute bottom-0 right-0 w-1/4 h-1/4 bg-glowPurple rounded-full filter blur-[100px] animate-pulse"
             style={{animationDuration: '10s'}}></div>
      </div>
      
      <div className="max-w-md w-full text-center z-10">
        <h1 className="text-6xl font-heading font-bold mb-2">
          <span className="text-white text-glow">Role</span>
          <span className="text-white">Call</span>
        </h1>
        
        <div className="h-0.5 w-32 bg-gradient-to-r from-transparent via-secondary/60 to-transparent mx-auto mb-6"></div>
        
        <p className="text-lg mb-10 text-textSecondary leading-relaxed">
          A mysterious game of deduction, deception, and hidden loyalties
        </p>
        
        <div className="space-y-5">
          <Button
            className="w-full bg-primary hover:bg-primary/90 py-6 px-6 rounded-md font-bold text-lg relative group overflow-hidden"
            onClick={() => setLocation('/create-room')}
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              <Users className="h-5 w-5" />
              <span>Create Game Room</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-glowBlue opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Button>
          
          <Button
            className="w-full bg-secondary hover:bg-secondary/90 text-black py-6 px-6 rounded-md font-bold text-lg relative group overflow-hidden"
            onClick={() => setLocation('/join-room')}
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              <UserCheck className="h-5 w-5" />
              <span>Join Private Room</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary to-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Button>
          
          <Button
            variant="outline"
            className="w-full bg-darkElevated hover:bg-darkElevated py-6 px-6 rounded-md font-bold text-lg border border-darkBorder hover:border-accent/30 relative group"
            onClick={() => setLocation('/public-rooms')}
          >
            <span className="relative z-10 flex items-center justify-center gap-3 group-hover:text-accent/90 transition-colors">
              <Eye className="h-5 w-5" />
              <span>Browse Public Rooms</span>
            </span>
          </Button>
        </div>
      </div>
      
      <div className="mt-24 text-center max-w-xl z-10">
        <h3 className="font-heading font-semibold text-xl mb-4 text-textPrimary relative inline-block">
          <span className="relative z-10">The Secret War</span>
          <div className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/60 to-transparent"></div>
        </h3>
        
        <div className="grid grid-cols-2 gap-6 mb-5">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-darkElevated flex items-center justify-center mb-3 border border-darkBorder">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <p className="text-textSecondary text-sm">
              Discover allies and protect your team from enemy infiltrators
            </p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-darkElevated flex items-center justify-center mb-3 border border-darkBorder">
              <Swords className="h-6 w-6 text-error" />
            </div>
            <p className="text-textSecondary text-sm">
              Use your unique role abilities to uncover traitors and survive
            </p>
          </div>
        </div>
        
        <p className="text-textMuted text-sm italic">
          "Trust no one—for appearances can be deceiving, and loyalty is merely an illusion..."
        </p>
      </div>
    </div>
  );
}
