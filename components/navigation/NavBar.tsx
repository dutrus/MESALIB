

// ============================================================================
// FILE: components/navigation/NavBar.tsx
// Main navigation component - New Professional Design
// ============================================================================

'use client';

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MesalibLogo } from '@/components/MesalibLogo';

interface NavBarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export const NavBar: React.FC<NavBarProps> = ({ currentView, setCurrentView }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'landing', label: 'Inicio' },
    { id: 'community', label: 'Comunidad' },
    { id: 'companion', label: 'Lib AI' },
    { id: 'resources', label: 'Recursos' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Button
            variant="secondary"
            onClick={() => setCurrentView('landing')}
            className="flex items-center gap-3 text-lg font-semibold hover:bg-transparent"
          >
            <MesalibLogo size="sm" showBackground={true} />
            <span className="bg-gradient-to-r from-[#FF6B9D] to-[#FFA07A] bg-clip-text text-transparent font-bold">
              MESALIB
            </span>
          </Button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={currentView === item.id ? 'secondary' : 'secondary'}
                onClick={() => {
                  console.log('Navigating to:', item.id);
                  setCurrentView(item.id);
                }}
                className="text-sm"
              >
                {item.label}
              </Button>
            ))}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-t md:hidden">
            <div className="space-y-1 p-2">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? 'secondary' : 'secondary'}
                  onClick={() => {
                    console.log('Mobile navigating to:', item.id);
                    setCurrentView(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start"
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
