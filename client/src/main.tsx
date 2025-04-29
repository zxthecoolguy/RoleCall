import { createRoot } from "react-dom/client";
import React from "react";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Switch, Route } from "wouter";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Simplified app without complex providers for now
const SimpleApp = () => {
  return (
    <div className="min-h-screen flex flex-col bg-darkBg text-white">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6">
        <Switch>
          <Route path="/" component={Home} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
};

// Simplified provider structure
const AppProviders = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <SimpleApp />
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
