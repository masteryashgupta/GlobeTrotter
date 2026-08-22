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
          <label htmlFor={selectId} className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`w-full px-3.5 py-2.5 bg-slate-800 border rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 transition-colors ${
            error
              ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500'
              : 'border-slate-700 focus:ring-teal-500 focus:border-teal-500'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-800 text-slate-100">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-rose-400 font-medium mt-0.5">{error}</p>}
        {!error && helperText && <p className="text-xs text-slate-400 mt-0.5">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
