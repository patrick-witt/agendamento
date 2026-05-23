import React, { forwardRef } from 'react';

const Input = forwardRef(({ label, error, icon: Icon, className = '', ...props }, ref) => {
  return (
    <div className={`w-full mb-4 ${className}`}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Icon size={18} />
          </div>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brandgreen transition-colors ${
            Icon ? 'pl-10' : ''
          } ${
            error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
          }`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
