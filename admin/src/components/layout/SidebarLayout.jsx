import React from 'react';
import Sidebar from './Sidebar';

const SidebarLayout = ({ children }) => {
  return (
    <div className="flex bg-[var(--background-subtle)] min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default SidebarLayout;
