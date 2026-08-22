import React from 'react';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-10 text-center bg-[#F7F5FC] border border-dashed border-[#C4B5FD]/60 rounded-2xl ${className}`}
    >
      {/* Violet icon container */}
      <div className="w-14 h-14 rounded-2xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center mb-4 shadow-[0_4px_12px_rgba(124,58,237,0.12)]">
        {icon || (
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        )}
      </div>
      <h3 className="text-base font-bold text-[#1A1523] tracking-tight font-heading">{title}</h3>
      {description && <p className="text-sm text-[#6B7280] max-w-sm mt-1.5 mb-5 leading-relaxed">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};
