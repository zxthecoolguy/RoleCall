import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-darkBg py-3 text-center text-sm text-gray-500">
      <p>RoleCall &copy; {new Date().getFullYear()} - A text-based strategy game</p>
    </footer>
  );
}
