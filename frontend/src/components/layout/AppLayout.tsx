import React from 'react';
import { Navbar } from './Navbar';

export interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white text-[#1A1523] flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 animate-fade-up">
        {children}
      </main>
      <footer className="border-t border-[#E9E4F5] bg-[#F7F5FC] py-6 text-center text-xs text-[#6B7280]">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} GlobeTrotter. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
