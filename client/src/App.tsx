import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import CreateRoom from "@/pages/CreateRoom";
import JoinRoom from "@/pages/JoinRoom";
import PublicRooms from "@/pages/PublicRooms";
import GameLobby from "@/pages/GameLobby";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/create-room" component={CreateRoom} />
          <Route path="/join-room" component={JoinRoom} />
          <Route path="/public-rooms" component={PublicRooms} />
          <Route path="/game-lobby" component={GameLobby} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

export default App;
