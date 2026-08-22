import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
  style,
  ...props
}) => {
  const variantStyles = {
    text:        'h-4 w-full rounded',
    circular:    'rounded-full',
    rectangular: 'rounded-xl',
  };

  return (
    <div
      /* Lavender shimmer instead of dark pulse */
      className={`skeleton-shimmer ${variantStyles[variant]} ${className}`}
      style={{
        width:  width  !== undefined ? width  : undefined,
        height: height !== undefined ? height : undefined,
        ...style,
      }}
      {...props}
    />
  );
};
