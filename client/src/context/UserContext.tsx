import React, { createContext, useState, useContext, useEffect } from 'react';
import { generateRandomUsername } from '@/lib/utils';

interface UserContextType {
  username: string;
  setUsername: (name: string) => void;
}

// Create initial default value to avoid undefined error
const defaultValue: UserContextType = {
  username: '',
  setUsername: () => {}
};

const UserContext = createContext<UserContextType>(defaultValue);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = useState<string>(() => {
    try {
      // Try to get from localStorage first
      const storedUsername = localStorage.getItem('rolecall_username');
      return storedUsername || generateRandomUsername();
    } catch (error) {
      // Fallback to generating a username if localStorage is not available
      console.warn('Error accessing localStorage:', error);
      return generateRandomUsername();
    }
  });
  
  // Save username to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('rolecall_username', username);
    } catch (error) {
      console.warn('Error storing in localStorage:', error);
    }
  }, [username]);
  
  return (
    <UserContext.Provider value={{ username, setUsername }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  // We don't need this check anymore since we provided a default value
  // but we'll keep it for type safety and explicit error when used incorrectly
  if (context === defaultValue) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
