import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateRandomUsername(): string {
  const adjectives = ["Brave", "Clever", "Mighty", "Swift", "Silent", "Shadow", "Crimson", "Azure", "Emerald", "Golden"];
  const nouns = ["Wolf", "Eagle", "Dragon", "Knight", "Ranger", "Agent", "Ninja", "Phoenix", "Tiger", "Hawk"];
  
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 100);
  
  return `${randomAdjective}${randomNoun}${randomNumber}`;
}

export function formatRoomCode(code: string): string {
  return code.toUpperCase();
}

export function getRoomStatusBadge(
  status: string,
  playerCount: number,
  capacity: number
): { color: string; text: string } {
  if (status !== "waiting") {
    return { color: "bg-gray-700", text: "In Progress" };
  }
  
  const ratio = playerCount / capacity;
  
  if (ratio >= 1) {
    return { color: "bg-error", text: "Full" };
  }
  
  if (ratio >= 0.8) {
    return { color: "bg-warning", text: "Almost Full" };
  }
  
  return { color: "bg-success", text: "Open" };
}

export function getPlayerStatusColor(status: string): string {
  switch (status) {
    case "ready":
      return "bg-success";
    case "playing":
      return "bg-accent";
    default:
      return "text-gray-400";
  }
}

export function getPlayerStatusText(status: string): string {
  switch (status) {
    case "ready":
      return "Ready";
    case "playing":
      return "Playing";
    default:
      return "Waiting...";
  }
}

export function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

export function getAvatarColor(name: string): string {
  const colors = ["bg-primary", "bg-secondary", "bg-accent", "bg-success", "bg-warning"];
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}
