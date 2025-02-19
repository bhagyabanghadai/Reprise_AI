'use client'

import React from 'react';
import { useEffect, useState } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', children, ...props }, ref) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      setIsMounted(true);
    }, []);

    const baseStyles = "inline-flex items-center justify-center";
    const variantStyles = {
      default: "bg-primary text-white",
      outline: "border border-current bg-transparent",
      ghost: "bg-transparent hover:bg-gray-700"
    };
    const sizeStyles = {
      default: "px-4 py-2",
      icon: "p-2"
    };

    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

    if (!isMounted) {
      return null;
    }

    return (
      <button 
        ref={ref} 
        className={combinedClassName} 
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
