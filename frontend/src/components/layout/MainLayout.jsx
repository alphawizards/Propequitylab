import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = ({ title = 'Dashboard', subtitle, rightPanel }) => {
  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans text-foreground">
      {/* 1. Sidebar (Fixed Left) */}
      <div className="w-[260px] flex-shrink-0 border-r border-border bg-card z-20 hidden md:block">
        <Sidebar />
      </div>

      {/* 2. Main Content Area (Fluid Center) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F6F7F9]">
        {/* Header (Sticky Top) */}
        <Header title={title} subtitle={subtitle} />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-hide">
             <div className="max-w-5xl mx-auto w-full">
                <Outlet />
             </div>
        </main>
      </div>

      {/* 3. Right Panel (Fixed Right - Optional) */}
      {rightPanel && (
        <div className="w-80 flex-shrink-0 border-l border-border bg-card z-10 hidden xl:flex flex-col overflow-y-auto">
            {rightPanel}
        </div>
      )}
    </div>
  );
};

export default MainLayout;
