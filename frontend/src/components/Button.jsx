import React from 'react';

export default function Button({ children, type = 'button', variant = 'primary', isLoading, className = '', ...props }) {
  const baseClasses = "px-4 py-2 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-brandgreen hover:bg-emerald-600 text-white focus:ring-brandgreen",
    secondary: "bg-darkblue hover:bg-blue-900 text-white focus:ring-darkblue",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-600",
    outline: "bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500"
  };

  return (
    <button 
      type={type} 
      className={`${baseClasses} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
      ) : children}
    </button>
  );
}
