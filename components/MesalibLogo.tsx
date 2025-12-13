// ============================================================================
// FILE: components/MesalibLogo.tsx
// Reusable logo component - Official Design
// ============================================================================

import React from 'react';
import Image from 'next/image';

interface MesalibLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBackground?: boolean;
}

export const MesalibLogo: React.FC<MesalibLogoProps> = ({ 
  size = 'md', 
  className = '',
  showBackground = true 
}) => {
  const sizes = {
    sm: { container: 'w-12 h-12', image: 48 },
    md: { container: 'w-16 h-16', image: 64 },
    lg: { container: 'w-24 h-24', image: 96 },
    xl: { container: 'w-32 h-32', image: 128 }
  };
  
  const currentSize = sizes[size];
  
  return (
    <div className={`${currentSize.container} relative ${className} flex items-center justify-center flex-shrink-0`}>
      {showBackground ? (
        <div className="w-full h-full rounded-lg bg-[#FF6B9D] flex items-center justify-center p-1.5 shadow-md">
          <Image
            src="/logo-mesalib.svg"
            alt="Mesalib Logo"
            width={currentSize.image}
            height={currentSize.image}
            className="w-full h-full object-contain"
            priority={size === 'lg' || size === 'xl'}
          />
        </div>
      ) : (
        <Image
          src="/logo-mesalib.svg"
          alt="Mesalib Logo"
          width={currentSize.image}
          height={currentSize.image}
          className="w-full h-full object-contain"
          priority={size === 'lg' || size === 'xl'}
        />
      )}
    </div>
  );
};
