// ============================================================================
// FILE: components/ui/Select.tsx
// ============================================================================

import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
  helperText?: string;
  error?: string;
}

export const Select: React.FC<SelectProps> = ({ 
  label, 
  options,
  helperText, 
  error,
  className = '',
  id,
  ...props 
}) => {
  const selectId = id || label.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <div className="space-y-2">
      <label htmlFor={selectId} className="block text-sm font-semibold text-gray-700">
        {label}
        {props.required && <span className="text-[#FF6B9D] ml-1">*</span>}
      </label>
      <select
        id={selectId}
        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B9D] focus:border-transparent transition-all bg-white ${
          error ? 'border-red-400' : 'border-gray-200'
        } ${className}`}
        {...props}
      >
        <option value="">Selecciona una opción</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};
