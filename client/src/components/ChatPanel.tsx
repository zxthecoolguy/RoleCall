import React, { useState, useRef, useEffect } from 'react';
import { useRoom } from '@/context/RoomContext';
import { type Message } from '@shared/schema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ChatPanel() {
  const { messages, sendChatMessage, currentRoom } = useRoom();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && currentRoom?.allowChat) {
      sendChatMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <div className="game-card rounded-lg overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h3 className="font-heading font-semibold">Lobby Chat</h3>
      </div>
      
      <div className="flex-grow p-4 overflow-y-auto h-96 flex flex-col space-y-3">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-3 border-t border-gray-800">
        <form className="flex" onSubmit={handleSendMessage}>
          <Input
            type="text"
            className="flex-grow bg-darkBg border border-gray-700 rounded-lg p-2 text-white"
            placeholder={currentRoom?.allowChat ? "Type your message..." : "Chat is disabled"}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={!currentRoom?.allowChat}
          />
          <Button 
            type="submit" 
            size="icon"
            className="ml-2 bg-primary hover:bg-primary/90 p-2 rounded-lg"
            disabled={!message.trim() || !currentRoom?.allowChat}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}

interface ChatMessageProps {
  message: Message;
}

function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div className={cn(
      "chat-message p-2 bg-darkBg rounded-lg",
      message.isSystem && "system border-l-accent border-l-[3px]"
    )}>
      <p className={cn(
        "text-xs mb-1",
        message.isSystem ? "text-accent" : "text-secondary"
      )}>
        {message.senderName}
      </p>
      <p className="text-sm">{message.content}</p>
    </div>
  );
}
