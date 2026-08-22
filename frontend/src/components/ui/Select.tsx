import { SelectHTMLAttributes, forwardRef } from 'react';

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={selectId} className="text-xs font-semibold text-[#1A1523] tracking-wide uppercase">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`w-full px-3.5 py-2.5 min-h-[44px] bg-[#F7F5FC] border rounded-xl text-sm text-[#1A1523] focus:outline-none focus:ring-2 transition-colors ${
            error
              ? 'border-[#EF4444] focus:ring-[#EF4444]/25 focus:border-[#EF4444]'
              : 'border-[#E9E4F5] focus:ring-[#7C3AED]/25 focus:border-[#7C3AED] hover:border-[#C4B5FD]'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white text-[#1A1523]">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-[#EF4444] font-medium mt-0.5">{error}</p>}
        {!error && helperText && <p className="text-xs text-[#6B7280] mt-0.5">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
