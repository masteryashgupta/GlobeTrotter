import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, Badge } from '../ui';

export const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'My Trips', path: '/trips' },
    { name: 'Search Cities', path: '/cities/search' },
    { name: 'Search Activities', path: '/activities/search' },
    { name: 'Community', path: '/community' },
    { name: 'Settings', path: '/settings' },
    ...(profile?.is_admin ? [{ name: 'Admin Panel', path: '/admin' }] : []),
  ];

  const isActive = (path: string) => {
    if (path === '/trips' && location.pathname.startsWith('/trips')) {
      return true;
    }
    return location.pathname === path;
  };

  return (
    <nav className="bg-white/90 backdrop-blur-xl border-b border-[#E9E4F5] sticky top-0 z-50 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo & Brand ── */}
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              {/* Violet gradient "G" badge — signature mark */}
              <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#C084FC] flex items-center justify-center text-white font-black text-xl shadow-md shadow-[rgba(124,58,237,0.25)] group-hover:scale-105 transition-transform duration-200 font-heading">
                G
              </span>
              <span className="text-xl font-black tracking-tight text-[#1A1523] group-hover:text-[#7C3AED] transition-colors font-heading">
                GlobeTrotter
              </span>
            </Link>

            {/* ── Desktop Navigation Links ── */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(link.path)
                      ? 'bg-[#7C3AED]/10 text-[#7C3AED] font-semibold border border-[#7C3AED]/20'
                      : 'text-[#6B7280] hover:text-[#1A1523] hover:bg-[#F7F5FC]'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* ── User Controls / Desktop Avatar ── */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-[#F7F5FC] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
                >
                  {/* Avatar circle */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#C084FC] text-white flex items-center justify-center font-bold text-sm overflow-hidden border-2 border-[#E9E4F5]">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="User Avatar" className="w-full h-full object-cover" />
                    ) : (
                      (profile?.full_name || user.email || 'U').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-semibold text-[#1A1523] leading-tight">
                      {profile?.full_name || 'Traveler'}
                    </p>
                    <p className="text-[10px] text-[#6B7280] leading-tight">{user.email}</p>
                  </div>
                  {/* Chevron */}
                  <svg className="w-3.5 h-3.5 text-[#6B7280] hidden lg:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* ── Dropdown Menu ── */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-[#E9E4F5] rounded-2xl shadow-[0_8px_32px_rgba(124,58,237,0.12)] py-1.5 z-50 animate-fade-up">
                    <div className="px-4 py-2.5 border-b border-[#E9E4F5]">
                      <p className="text-xs font-semibold text-[#1A1523] truncate">{profile?.full_name || 'User'}</p>
                      <p className="text-[11px] text-[#6B7280] truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/settings"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-[#1A1523] hover:bg-[#F7F5FC] hover:text-[#7C3AED] transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Account Settings
                    </Link>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        signOut();
                      }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-[#EF4444] hover:bg-[#FFF5F5] font-semibold transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* ── Mobile Hamburger Button ── */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#6B7280] hover:text-[#1A1523] hover:bg-[#F7F5FC] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Drawer Menu ── */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#E9E4F5] bg-white px-4 pt-2 pb-4 space-y-1 animate-fade-up">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive(link.path)
                  ? 'bg-[#7C3AED]/10 text-[#7C3AED] font-semibold'
                  : 'text-[#6B7280] hover:text-[#1A1523] hover:bg-[#F7F5FC]'
              }`}
            >
              {link.name}
            </Link>
          ))}
          {user ? (
            <div className="pt-4 border-t border-[#E9E4F5] flex flex-col gap-2">
              <div className="flex items-center gap-3 px-3">
                <Badge variant="primary">{profile?.full_name || user.email}</Badge>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  signOut();
                }}
                className="w-full mt-2"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="pt-4 border-t border-[#E9E4F5] flex flex-col gap-2">
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
