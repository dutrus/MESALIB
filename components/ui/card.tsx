// ============================================================================
// FILE: components/ui/Card.tsx
// ============================================================================

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-md border border-gray-200 p-6 overflow-hidden ${className}`}>
      {children}
    </div>
  );
};
