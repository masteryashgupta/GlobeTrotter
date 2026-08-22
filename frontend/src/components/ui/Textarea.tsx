import { TextareaHTMLAttributes, forwardRef } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', id, rows = 4, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={textareaId} className="text-xs font-semibold text-[#1A1523] tracking-wide uppercase">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={`w-full px-3.5 py-2.5 bg-[#F7F5FC] border rounded-xl text-sm text-[#1A1523] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 transition-colors resize-y ${
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

Textarea.displayName = 'Textarea';
