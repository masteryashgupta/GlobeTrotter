import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> & {
  Header: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  Title: React.FC<React.HTMLAttributes<HTMLHeadingElement>>;
  Description: React.FC<React.HTMLAttributes<HTMLParagraphElement>>;
  Content: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  Footer: React.FC<React.HTMLAttributes<HTMLDivElement>>;
} = ({ children, className = '', hoverable = false, ...props }) => {
  return (
    <div
      className={`bg-[#131C2E]/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-xl ${
        hoverable ? 'transition-all duration-300 ease-out hover:border-teal-500/40 hover:shadow-2xl hover:shadow-teal-950/30 hover:-translate-y-1' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

Card.Header = ({ children, className = '', ...props }) => (
  <div className={`mb-4 ${className}`} {...props}>
    {children}
  </div>
);
Card.Header.displayName = 'Card.Header';

Card.Title = ({ children, className = '', ...props }) => (
  <h3 className={`text-lg font-bold text-white tracking-tight ${className}`} {...props}>
    {children}
  </h3>
);
Card.Title.displayName = 'Card.Title';

Card.Description = ({ children, className = '', ...props }) => (
  <p className={`text-sm text-slate-400 mt-1 ${className}`} {...props}>
    {children}
  </p>
);
Card.Description.displayName = 'Card.Description';

Card.Content = ({ children, className = '', ...props }) => (
  <div className={`py-2 ${className}`} {...props}>
    {children}
  </div>
);
Card.Content.displayName = 'Card.Content';

Card.Footer = ({ children, className = '', ...props }) => (
  <div className={`mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
);
Card.Footer.displayName = 'Card.Footer';
