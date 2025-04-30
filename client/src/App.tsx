import { useState, createContext, useContext, useEffect } from "react";
import Home from "@/pages/Home";
import CreateRoom from "@/pages/CreateRoom";
import JoinRoom from "@/pages/JoinRoom";
import PublicRooms from "@/pages/PublicRooms";
import GameLobby from "@/pages/GameLobby";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { RoomProvider } from "@/context/RoomContext";
import { UserProvider } from "@/context/UserContext";
import TestNavigation from "@/pages/TestNavigation";

// Create a navigation context that will control which page to show
export type PageType = 'home' | 'create-room' | 'join-room' | 'public-rooms' | 'game-lobby';

interface NavigationContextType {
  currentPage: PageType;
  navigateTo: (page: PageType) => void;
}

export const NavigationContext = createContext<NavigationContextType>({
  currentPage: 'home',
  navigateTo: () => {},
});

// Custom hook for navigation
export function useNavigation() {
  return useContext(NavigationContext);
}

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');

  const navigateTo = (page: PageType) => {
    console.log('Navigating to:', page);
    setCurrentPage(page);
    
    // For debugging: 
    window.setTimeout(() => {
      console.log('Current page after navigation:', page);
    }, 100);
  };

  // Log current page state for debugging
  useEffect(() => {
    console.log('Current page state:', currentPage);
  }, [currentPage]);

  // Direct navigation function for passing to components
  const directNavigate = (page: PageType) => {
    console.log('Direct navigation called to:', page);
    setCurrentPage(page);
  };

  // Render the appropriate page based on the current state
  const renderPage = () => {
    console.log('Rendering page:', currentPage);
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={directNavigate} />;
      case 'create-room':
        return <CreateRoom onNavigate={directNavigate} />;
      case 'join-room':
        return <JoinRoom onNavigate={directNavigate} />;
      case 'public-rooms':
        return <PublicRooms onNavigate={directNavigate} />;
      case 'game-lobby':
        return <GameLobby onNavigate={directNavigate} />;
      default:
        return <Home onNavigate={directNavigate} />;
    }
  };

  return (
    <NavigationContext.Provider value={{ currentPage, navigateTo }}>
      <UserProvider>
        <RoomProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto p-4 md:p-6">
              {/* Test navigation component at the top */}
              <div className="mb-8 p-4 border border-gray-700 rounded-lg bg-gray-800">
                <h2 className="text-xl font-bold mb-3">Navigation Test Panel</h2>
                <TestNavigation onNavigate={(page) => {
                  console.log('Direct navigation to:', page);
                  setCurrentPage(page as PageType);
                }} />
              </div>
              {/* Actual page content */}
              {renderPage()}
            </main>
            <Footer />
          </div>
        </RoomProvider>
      </UserProvider>
    </NavigationContext.Provider>
  );
}

export default App;
