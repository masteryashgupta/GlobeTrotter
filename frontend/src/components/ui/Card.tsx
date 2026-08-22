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
      className={`bg-[#F7F5FC] border border-[#E9E4F5] rounded-2xl p-6 shadow-[0_4px_16px_rgba(124,58,237,0.08)] ${
        hoverable
          ? 'transition-all duration-220 ease-out hover:border-[#C084FC]/60 hover:shadow-[0_8px_32px_rgba(124,58,237,0.18)] hover:-translate-y-1 cursor-pointer'
          : ''
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
  /* Using h3 for semantic hierarchy; text is near-black with purple undertone */
  <h3 className={`text-lg font-bold text-[#1A1523] tracking-tight font-heading ${className}`} {...props}>
    {children}
  </h3>
);
Card.Title.displayName = 'Card.Title';

Card.Description = ({ children, className = '', ...props }) => (
  <p className={`text-sm text-[#6B7280] mt-1 ${className}`} {...props}>
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
  <div className={`mt-6 pt-4 border-t border-[#E9E4F5] flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
);
Card.Footer.displayName = 'Card.Footer';
