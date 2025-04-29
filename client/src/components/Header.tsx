import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings, User, Shuffle, Home } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { generateRandomUsername } from '@/lib/utils';
import { useLocation } from 'wouter';
import DramaMasksLogo from './DramaMasksLogo';

export default function Header() {
  // Simplified version without context dependency
  const [username, setUsernameState] = useState<string>(() => {
    // Try to get from localStorage or generate a new one
    try {
      const saved = localStorage.getItem('rolecall_username');
      return saved || generateRandomUsername();
    } catch (e) {
      return generateRandomUsername();
    }
  });
  
  const [showSettings, setShowSettings] = useState(false);
  const [newUsername, setNewUsername] = useState(username);
  const [_, navigate] = useLocation();

  // Save username to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('rolecall_username', username);
    } catch (e) {
      console.warn('Could not save username to localStorage', e);
    }
  }, [username]);

  const setUsername = (name: string) => {
    setUsernameState(name);
  };

  const handleSaveUsername = () => {
    if (newUsername.trim()) {
      setUsername(newUsername.trim());
      setShowSettings(false);
    }
  };

  const handleRandomUsername = () => {
    const random = generateRandomUsername();
    setNewUsername(random);
  };

  return (
    <header className="bg-darkBgAlt/80 backdrop-blur-md py-4 border-b border-darkBorder/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center group"
          >
            <div className="flex flex-col">
              <h1 className="text-2xl font-heading font-bold text-white flex items-center relative pb-1">
                <span className="group-hover:text-white/80 transition-all duration-300">Role</span>
                <span className="text-white group-hover:text-white/80 transition-all duration-300">Call</span>
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-secondary"></span>
              </h1>
              <span className="text-[9px] text-white/70 -mt-0.5 font-mono tracking-wider">DECEPTION & MYSTERY</span>
            </div>
            <span className="ml-2 text-[10px] bg-secondary/80 text-white px-2 py-0.5 rounded-sm font-mono tracking-wider">BETA</span>
          </button>
        </div>
        
        <div className="flex items-center">
          <div className="mr-3 text-sm text-white bg-darkElevated/80 px-3 py-1 rounded border border-secondary/30 flex items-center">
            <User className="h-3.5 w-3.5 mr-2 text-secondary" />
            <span>{username}</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-md hover:bg-darkElevated border border-transparent hover:border-secondary/30 transition-all"
              >
                <Settings className="h-5 w-5 text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="bg-darkElevated/95 backdrop-blur-md border-secondary/30 text-white shadow-xl"
            >
              <DropdownMenuItem 
                onClick={() => navigate('/')}
                className="hover:bg-darkSurface focus:bg-darkSurface flex items-center gap-2"
              >
                <Home className="h-4 w-4 text-secondary" />
                <span>Home</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-secondary/30" />
              
              <DropdownMenuItem 
                onClick={() => setShowSettings(true)}
                className="hover:bg-darkSurface focus:bg-darkSurface flex items-center gap-2"
              >
                <User className="h-4 w-4 text-secondary" />
                <span>Change Username</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-darkElevated border-secondary/30 text-white shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-center font-heading tracking-wide">Identity Selection</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="relative">
              <Input
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="bg-darkBg border-secondary/30 text-white pl-10"
                placeholder="Enter your alias"
                maxLength={20}
              />
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary" />
            </div>
            
            <Button 
              variant="outline" 
              onClick={handleRandomUsername}
              className="mt-3 w-full border-secondary/30 bg-darkSurface hover:bg-darkSurface/80 text-white flex items-center justify-center gap-2"
            >
              <Shuffle className="h-4 w-4 text-secondary" />
              <span>Generate Random Identity</span>
            </Button>
          </div>
          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => setShowSettings(false)}
              className="text-white/70 hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveUsername}
              className="bg-secondary hover:bg-secondary/90 text-white"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
