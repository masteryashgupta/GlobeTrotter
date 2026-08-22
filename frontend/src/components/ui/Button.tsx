import React, { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    /* ── Base ── */
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 select-none min-h-[44px] cursor-pointer';

    /* ── Variants ── */
    const variantStyles = {
      /* Solid violet — primary CTA */
      primary:
        'bg-[#7C3AED] hover:bg-[#5B21B6] text-white shadow-md shadow-[rgba(124,58,237,0.25)] hover:shadow-[rgba(124,58,237,0.40)] hover:shadow-lg hover:scale-[1.03] font-bold',

      /* White bg with violet border — secondary */
      secondary:
        'bg-white border border-[#7C3AED] text-[#7C3AED] hover:bg-[#F7F5FC] hover:border-[#5B21B6] hover:text-[#5B21B6] shadow-sm hover:shadow-md hover:scale-[1.03] font-semibold',

      /* Lavender bg, violet border/text */
      outline:
        'bg-[#F7F5FC] border border-[#E9E4F5] text-[#1A1523] hover:border-[#7C3AED] hover:text-[#7C3AED] hover:bg-white shadow-sm hover:scale-[1.02]',

      /* Red / danger — semantically unchanged */
      danger:
        'bg-gradient-to-r from-[#EF4444] to-[#DC2626] hover:from-[#DC2626] hover:to-[#B91C1C] text-white shadow-md shadow-[rgba(239,68,68,0.25)] hover:scale-[1.03] font-bold',

      /* Ghost — minimal, lavender hover */
      ghost:
        'text-[#6B7280] hover:bg-[#F7F5FC] hover:text-[#1A1523]',
    };

    /* ── Sizes ── */
    const sizeStyles = {
      sm: 'px-3.5 py-1.5 text-xs gap-1.5 rounded-lg',
      md: 'px-4.5 py-2 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2.5 rounded-2xl',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!isLoading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
