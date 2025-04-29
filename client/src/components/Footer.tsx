import React from 'react';
import { Eye, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative mt-auto">
      {/* Top border with glowing effect */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-darkBorder to-transparent"></div>
      
      {/* Content */}
      <div className="bg-darkBgAlt/50 py-4 px-6 text-center">
        <div className="flex items-center justify-center gap-1 mb-1">
          <Shield className="h-3 w-3 text-primary/70" />
          <Eye className="h-3 w-3 text-secondary/70" />
        </div>
        <p className="text-textMuted text-xs tracking-wide font-light">
          <span className="font-heading">RoleCall</span> &copy; {new Date().getFullYear()} &middot; Secrets lie in shadows
        </p>
      </div>
    </footer>
  );
}
