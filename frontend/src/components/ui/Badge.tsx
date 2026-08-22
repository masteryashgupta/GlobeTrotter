import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const variantStyles = {
    primary: 'bg-teal-500/15 text-teal-300 border-teal-500/30 backdrop-blur-md shadow-sm shadow-teal-950',
    secondary: 'bg-amber-500/15 text-amber-300 border-amber-500/30 backdrop-blur-md shadow-sm shadow-amber-950',
    success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 backdrop-blur-md shadow-sm shadow-emerald-950',
    warning: 'bg-amber-500/15 text-amber-300 border-amber-500/30 backdrop-blur-md shadow-sm shadow-amber-950',
    danger: 'bg-rose-500/15 text-rose-300 border-rose-500/30 backdrop-blur-md shadow-sm shadow-rose-950',
    neutral: 'bg-slate-800/80 text-slate-300 border-slate-700/60 backdrop-blur-md',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium tracking-wide ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
