// ============================================================================
// FILE: components/ui/Card.tsx
// ============================================================================

import React from 'react';

// Permitimos cualquier atributo de <div> (onClick, aria-*, etc.)
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-white rounded-2xl shadow-md border border-gray-200 p-6 overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
