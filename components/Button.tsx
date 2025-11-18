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
  const baseStyles = "font-display font-bold text-xl py-4 px-8 rounded-[2rem] transform transition-all duration-200 active:scale-95 active:translate-y-1 shadow-[0_6px_0_0] active:shadow-none border-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none";
  
  const variants = {
    primary: "bg-kid-pink border-pink-600 text-white hover:bg-pink-400 shadow-pink-700",
    secondary: "bg-white border-kid-blue text-kid-blue hover:bg-blue-50 shadow-blue-200",
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