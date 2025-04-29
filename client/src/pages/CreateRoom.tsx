import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useNavigation } from '@/App';
import { useRoom } from '@/context/RoomContext';
import { RoomType } from '@shared/schema';

export default function CreateRoom() {
  const { navigateTo } = useNavigation();
  const { createRoom, loading, currentRoom } = useRoom();
  
  const [formData, setFormData] = useState({
    name: "",
    type: RoomType.PRIVATE,
    capacity: 8,
    allowChat: true
  });

  // Navigate to game lobby when room is created
  useEffect(() => {
    if (currentRoom) {
      navigateTo('game-lobby');
    }
  }, [currentRoom, navigateTo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRoom(formData);
    // Navigate immediately
    navigateTo('game-lobby');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoomTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, type: value as RoomType }));
  };

  const handleCapacityChange = (value: number[]) => {
    setFormData(prev => ({ ...prev, capacity: value[0] }));
  };

  const handleChatToggle = (checked: boolean) => {
    setFormData(prev => ({ ...prev, allowChat: checked }));
  };

  return (
    <div className="max-w-lg mx-auto py-6">
      <h2 className="text-2xl font-heading font-bold mb-6">Create New Game Room</h2>
      
      <Card className="game-card rounded-lg bg-darkSurface border-gray-800">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Label htmlFor="name" className="block text-gray-300 mb-2">Room Name</Label>
              <Input
                id="name"
                name="name"
                className="w-full bg-darkBg border border-gray-700 rounded p-2 text-white"
                placeholder="Enter a name for your room"
                required
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="mb-4">
              <Label className="block text-gray-300 mb-2">Room Type</Label>
              <RadioGroup 
                value={formData.type} 
                onValueChange={handleRoomTypeChange}
                className="flex space-x-4"
              >
                <div className="flex items-center">
                  <RadioGroupItem value="public" id="public" className="mr-2" />
                  <Label htmlFor="public">Public</Label>
                </div>
                <div className="flex items-center">
                  <RadioGroupItem value="private" id="private" className="mr-2" />
                  <Label htmlFor="private">Private</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="mb-4">
              <Label className="block text-gray-300 mb-2">Player Capacity</Label>
              <div className="flex items-center">
                <Slider
                  min={4}
                  max={12}
                  step={1}
                  value={[formData.capacity]}
                  onValueChange={handleCapacityChange}
                  className="w-full mr-4"
                />
                <span className="font-mono">{formData.capacity} players</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Minimum: 4 players, Maximum: 12 players</p>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="allowChat"
                  checked={formData.allowChat}
                  onCheckedChange={handleChatToggle}
                />
                <Label htmlFor="allowChat">Enable in-game chat</Label>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <Button 
                type="submit" 
                className="btn-primary py-2 px-6 rounded-lg font-bold flex-grow bg-primary hover:bg-primary/90"
                disabled={loading}
              >
                Create Room
              </Button>
              <Button 
                type="button"
                variant="outline"
                className="bg-darkElevated hover:bg-gray-800 py-2 px-6 rounded-lg border border-gray-700"
                onClick={() => navigateTo('home')}
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
