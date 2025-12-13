// ============================================================================
// FILE: components/ui/Checkbox.tsx
// ============================================================================

import React from 'react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ 
  label, 
  className = '',
  id,
  ...props 
}) => {
  const checkboxId = id || label.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <div className="flex items-center space-x-3">
      <input
        type="checkbox"
        id={checkboxId}
        className={`w-5 h-5 rounded border-2 border-gray-300 text-[#FF6B9D] focus:ring-2 focus:ring-[#FF6B9D] focus:ring-offset-0 transition-all ${className}`}
        {...props}
      />
      <label htmlFor={checkboxId} className="text-sm text-gray-700 cursor-pointer select-none">
        {label}
      </label>
    </div>
  );
};
