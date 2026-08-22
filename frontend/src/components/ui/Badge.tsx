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
    /* Violet — main brand */
    primary:   'bg-[#7C3AED]/12 text-[#5B21B6] border-[#C4B5FD]/60',
    /* Soft purple — secondary */
    secondary: 'bg-[#C084FC]/15 text-[#7C3AED] border-[#C084FC]/50',
    /* Green — success */
    success:   'bg-[#22C55E]/12 text-[#15803D] border-[#22C55E]/40',
    /* Amber — warning */
    warning:   'bg-[#F59E0B]/12 text-[#B45309] border-[#F59E0B]/40',
    /* Red — danger */
    danger:    'bg-[#EF4444]/12 text-[#B91C1C] border-[#EF4444]/40',
    /* Neutral — muted lavender */
    neutral:   'bg-[#F7F5FC] text-[#6B7280] border-[#E9E4F5]',
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
