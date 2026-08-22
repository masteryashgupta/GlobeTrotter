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
          <label htmlFor={textareaId} className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={`w-full px-3.5 py-2.5 bg-slate-800 border rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-colors resize-y ${
            error
              ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500'
              : 'border-slate-700 focus:ring-teal-500 focus:border-teal-500'
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-rose-400 font-medium mt-0.5">{error}</p>}
        {!error && helperText && <p className="text-xs text-slate-400 mt-0.5">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
