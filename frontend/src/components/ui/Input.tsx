import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-[#1A1523] tracking-wide uppercase">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`w-full px-4 py-2.5 min-h-[44px] bg-[#F7F5FC] border rounded-xl text-sm text-[#1A1523] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 transition-all duration-200 ${
            error
              ? 'border-[#EF4444] focus:ring-[#EF4444]/25 focus:border-[#EF4444]'
              : 'border-[#E9E4F5] focus:ring-[#7C3AED]/25 focus:border-[#7C3AED] hover:border-[#C4B5FD]'
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-[#EF4444] font-medium mt-0.5">{error}</p>}
        {!error && helperText && <p className="text-xs text-[#6B7280] mt-0.5">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
