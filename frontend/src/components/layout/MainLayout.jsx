import React from 'react';
import { Outlet } from 'react-router-dom';

function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <h1>Zapiio - Loading...</h1>
        <Outlet />
      </div>
    </div>
  );
}

export default MainLayout;
