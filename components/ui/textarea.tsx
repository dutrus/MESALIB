// ============================================================================
// FILE: components/ui/Textarea.tsx
// ============================================================================

import React, { useId } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ 
  label, 
  helperText, 
  error,
  className = '',
  id,
  ...props 
}) => {
  const generatedId = useId();
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : generatedId);
  
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-semibold text-gray-700">
          {label}
          {props.required && <span className="text-[#FF6B9D] ml-1">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B9D] focus:border-transparent transition-all resize-none ${
          error ? 'border-red-400' : 'border-gray-200'
        } ${className}`}
        {...props}
      />
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};
