import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { PageType } from '@/App';
import { useWebSocket } from '@/lib/websocket';
import { MessageType, WebSocketMessage } from '@shared/schema';

export default function AdminTools({
  onNavigate
}: {
  onNavigate: (page: PageType) => void
}) {
  const [message, setMessage] = useState<string | null>(null);
  const { isConnected, sendMessage, lastMessage, connect } = useWebSocket();
  const [isLoading, setIsLoading] = useState(false);
  
  // Ensure connection is established when visiting admin page
  useEffect(() => {
    if (!isConnected) {
      connect('Admin');
    }
  }, [isConnected, connect]);

  useEffect(() => {
    if (lastMessage?.type === MessageType.ADMIN_RESPONSE) {
      setIsLoading(false);
      setMessage(lastMessage.payload.message);
      toast({
        title: 'Admin Action',
        description: lastMessage.payload.message,
      });
    }
  }, [lastMessage]);
  
  const handleDeleteAllRooms = () => {
    if (!isConnected) {
      toast({
        title: 'Connection Error',
        description: 'Not connected to server',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);
    sendMessage({
      type: MessageType.ADMIN_COMMAND,
      payload: {
        command: 'delete_all_rooms'
      }
    });
  };

  return (
    <div className="max-w-lg mx-auto py-6">
      <h2 className="text-2xl font-heading font-bold mb-6">Admin Tools</h2>
      
      <Card className="game-card rounded-lg bg-darkSurface border-gray-800 mb-6">
        <CardContent className="pt-6">
          <h3 className="text-xl font-bold mb-4">Room Management</h3>
          
          <div className="mb-4 space-y-4">
            <Button 
              variant="destructive"
              onClick={handleDeleteAllRooms}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Processing...' : 'Delete All Rooms'}
            </Button>
            
            {message && (
              <div className="p-4 bg-darkElevated rounded-lg border border-gray-700">
                <p className="text-sm">{message}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Button
        variant="outline"
        className="w-full bg-darkElevated hover:bg-gray-800 border border-gray-700"
        onClick={() => onNavigate('home')}
      >
        Back to Home
      </Button>
    </div>
  );
}