import React from 'react';

interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  onClick, 
  disabled = false, 
  children, 
  variant = 'primary',
  className = ''
}) => {
  const baseStyles = "font-bold text-lg py-3 px-8 rounded-full transform transition-all duration-200 active:scale-95 shadow-lg border-b-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";
  
  const variants = {
    primary: "bg-kid-orange border-orange-600 text-white hover:bg-orange-400",
    secondary: "bg-kid-blue border-blue-600 text-white hover:bg-sky-400",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};