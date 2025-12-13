// ============================================================================
// FILE: app/page.tsx
// Landing page (home) - New Professional Design
// ============================================================================

'use client';

import { useState, useEffect } from 'react';
import React from 'react';
import { NavBar } from '@/components/navigation/NavBar';
import { Landing } from '@/components/sections/Landing';
import { Community } from '@/components/sections/Community';
import { Companion } from '@/components/sections/Companion';
import { Resources } from '@/components/sections/Resources';

export default function HomePage() {
  const [currentView, setCurrentView] = useState('landing');

  // Debug: log when view changes
  useEffect(() => {
    console.log('Current view changed to:', currentView);
  }, [currentView]);

  return (
    <div className="min-h-screen bg-background">
      <NavBar currentView={currentView} setCurrentView={setCurrentView} />
      
      <div key={currentView}>
      {currentView === 'landing' && <Landing setCurrentView={setCurrentView} />}
      {currentView === 'community' && <Community />}
      {currentView === 'companion' && <Companion />}
      {currentView === 'resources' && <Resources />}
      </div>
    </div>
  );
}
