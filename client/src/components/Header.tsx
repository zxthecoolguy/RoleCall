import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { generateRandomUsername } from '@/lib/utils';

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
    <header className="bg-darkElevated py-4 border-b border-gray-800">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-heading font-bold text-white">
            <span className="text-primary">Role</span>
            <span className="text-secondary">Call</span>
          </h1>
          <span className="ml-2 text-xs bg-accent text-white px-2 py-0.5 rounded-full font-mono">BETA</span>
        </div>
        
        <div className="flex items-center">
          <span className="mr-3 text-sm opacity-80">{username}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-darkElevated transition-colors">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-darkElevated border-gray-700">
              <DropdownMenuItem 
                onClick={() => setShowSettings(true)}
                className="hover:bg-darkSurface focus:bg-darkSurface"
              >
                Change Username
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-darkSurface text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Change Your Username</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="bg-darkBg border-gray-700 text-white"
              placeholder="Enter new username"
              maxLength={20}
            />
            <Button 
              variant="outline" 
              onClick={handleRandomUsername}
              className="mt-2 w-full border-gray-700 hover:bg-gray-800"
            >
              Generate Random Username
            </Button>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowSettings(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveUsername}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
