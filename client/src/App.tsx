import { useState, createContext, useContext } from "react";
import Home from "@/pages/Home";
import CreateRoom from "@/pages/CreateRoom";
import JoinRoom from "@/pages/JoinRoom";
import PublicRooms from "@/pages/PublicRooms";
import GameLobby from "@/pages/GameLobby";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { RoomProvider } from "@/context/RoomContext";
import { UserProvider } from "@/context/UserContext";

// Create a navigation context that will control which page to show
export type PageType = 'home' | 'create-room' | 'join-room' | 'public-rooms' | 'game-lobby';

interface NavigationContextType {
  currentPage: PageType;
  navigateTo: (page: PageType) => void;
}

const NavigationContext = createContext<NavigationContextType>({
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

  // Render the appropriate page based on the current state
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />;
      case 'create-room':
        return <CreateRoom />;
      case 'join-room':
        return <JoinRoom />;
      case 'public-rooms':
        return <PublicRooms />;
      case 'game-lobby':
        return <GameLobby />;
      default:
        return <Home />;
    }
  };

  return (
    <NavigationContext.Provider value={{ currentPage, navigateTo }}>
      <UserProvider>
        <RoomProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto p-4 md:p-6">
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
