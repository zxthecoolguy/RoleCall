import { createRoot } from "react-dom/client";
import React from "react";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import App from "./App";
import { UserProvider } from "./context/UserContext";
import { RoomProvider } from "./context/RoomContext";

// Provider structure - simplified to avoid circular dependencies
const AppProviders = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <UserProvider>
            <App />
            <Toaster />
          </UserProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

// Render the app
const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<AppProviders />);
} else {
  console.error("Failed to find the root element");
}
