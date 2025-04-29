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
            <DramaMasksLogo size={36} className="mr-3" />
            <div className="flex flex-col">
              <h1 className="text-2xl font-heading font-bold text-textPrimary flex items-center">
                <span className="text-glow-purple group-hover:text-primary transition-all duration-300">Role</span>
                <span className="text-glow-red group-hover:text-secondary transition-all duration-300">Call</span>
              </h1>
              <span className="text-[9px] text-textSecondary -mt-1.5 font-mono tracking-wider">DECEPTION & MYSTERY</span>
            </div>
            <span className="ml-2 text-[10px] bg-accent/80 text-white px-2 py-0.5 rounded-sm font-mono tracking-wider">BETA</span>
          </button>
        </div>
        
        <div className="flex items-center">
          <div className="mr-3 text-sm text-textSecondary bg-darkElevated/80 px-3 py-1 rounded border border-darkBorder/50 flex items-center">
            <User className="h-3.5 w-3.5 mr-2 text-primary/80" />
            <span>{username}</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-md hover:bg-darkElevated border border-transparent hover:border-darkBorder/50 transition-all"
              >
                <Settings className="h-5 w-5 text-textSecondary" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="bg-darkElevated/95 backdrop-blur-md border-darkBorder text-textPrimary shadow-xl"
            >
              <DropdownMenuItem 
                onClick={() => navigate('/')}
                className="hover:bg-darkSurface focus:bg-darkSurface flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-darkBorder/50" />
              
              <DropdownMenuItem 
                onClick={() => setShowSettings(true)}
                className="hover:bg-darkSurface focus:bg-darkSurface flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                <span>Change Username</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-darkElevated border-darkBorder text-textPrimary shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-center font-heading tracking-wide">Identity Selection</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="relative">
              <Input
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="bg-darkBg border-darkBorder text-textPrimary pl-10"
                placeholder="Enter your alias"
                maxLength={20}
              />
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-textMuted" />
            </div>
            
            <Button 
              variant="outline" 
              onClick={handleRandomUsername}
              className="mt-3 w-full border-darkBorder bg-darkSurface hover:bg-darkSurface/80 text-textSecondary flex items-center justify-center gap-2"
            >
              <Shuffle className="h-4 w-4" />
              <span>Generate Random Identity</span>
            </Button>
          </div>
          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => setShowSettings(false)}
              className="text-textSecondary hover:text-textPrimary"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveUsername}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
