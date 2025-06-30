
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, MessageSquare, ShoppingBag, DollarSign, BookOpen, Compass, Menu, X, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfileMenu } from './UserProfileMenu';
import { useIsMobile, useScreenSize } from '@/hooks/use-mobile';

const navItems = [
  { icon: Home, text: 'Home', path: '/' },
  { icon: MessageSquare, text: 'Chat', path: '/chat' },
  { icon: ShoppingBag, text: 'Shop', path: '/shop' },
  { icon: DollarSign, text: 'Sell', path: '/sell' },
  { icon: BookOpen, text: 'Learn', path: '/learn' },
  { icon: Compass, text: 'Explore', path: '/explore' },
];

interface AppSidebarProps {
  onNavigate?: (path: string) => void;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}

export const AppSidebar = ({
  onNavigate,
  mobileMenuOpen = false,
  setMobileMenuOpen
}: AppSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const isMobile = useIsMobile();

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile]);

  // Close mobile menu when route changes
  useEffect(() => {
    if (isMobile && setMobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [location.pathname, setMobileMenuOpen, isMobile]);

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
    // Close mobile menu after navigation
    if (isMobile && setMobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  const handleLoginClick = () => {
    navigate('/auth');
    if (isMobile && setMobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  // Render desktop sidebar if not mobile or if mobile props not provided
  if (!isMobile || !setMobileMenuOpen) {
    return (
      <div className={cn(
        "transition-all duration-300 bg-[#10141E] flex flex-col h-screen relative",
        collapsed ? "w-20" : "w-64"
      )}>
        {/* Desktop Header */}
        <div className="flex justify-between items-center p-4 border-b border-[#1E2735]">
          {!collapsed && (
            <h1 className="text-xl font-bold text-white">Cropsay</h1>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-md hover:bg-[#1E2735] transition-colors text-white"
            aria-label="Toggle sidebar"
          >
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="flex-1 p-3 overflow-y-auto">
          {!collapsed && (
            <p className="text-cropsay-grayText text-sm mb-2 px-3">Navigation</p>
          )}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <a
                key={item.text}
                onClick={() => handleNavigate(item.path)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-md cursor-pointer transition-all duration-200",
                  location.pathname === item.path
                    ? "bg-green-500 bg-opacity-20 text-green-400 border-r-2 border-green-400"
                    : "text-gray-300 hover:bg-[#1E2735] hover:text-white",
                  collapsed ? "justify-center" : ""
                )}
              >
                <item.icon size={20} />
                {!collapsed && <span>{item.text}</span>}
              </a>
            ))}
          </nav>
        </div>

        {/* Desktop User Section */}
        <div className="mt-auto p-4 border-t border-[#1E2735]">
          {user ? (
            <div className={cn(
              "flex",
              collapsed ? "justify-center" : "items-center"
            )}>
              {!collapsed && (
                <div className="mr-2 flex-1">
                  <p className="text-sm font-medium truncate text-white">
                    {profile?.full_name || 'User'}
                  </p>
                </div>
              )}
              <UserProfileMenu />
            </div>
          ) : (
            <Button
              className="w-full bg-green-500 hover:bg-green-600 flex items-center gap-2 transition-all"
              onClick={handleLoginClick}
            >
              <LogIn size={18} />
              {!collapsed && 'Login / Sign up'}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Mobile sidebar - only render when mobile menu is open
  if (isMobile) {

    return (
      <>
        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <div className={cn(
          "fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-gradient-to-b from-[#0A0E16] to-[#10141E] z-50 transition-all duration-300 ease-out shadow-2xl border-r border-[#1E2735]",
          mobileMenuOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
        )}>
          {/* Mobile Header */}
          <div className="flex justify-between items-center p-6 border-b border-[#1E2735]/50 bg-gradient-to-r from-green-500/10 to-blue-500/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <h1 className="text-xl font-bold text-white">Cropsay</h1>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-xl hover:bg-[#1E2735] transition-all duration-200 text-gray-400 hover:text-white"
              aria-label="Close menu"
            >
              <X size={22} />
            </button>
          </div>

          {/* Mobile Navigation */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="mb-6">
              <p className="text-gray-400 text-sm font-medium mb-4 px-2">Navigation</p>
              <nav className="space-y-2">
                {navItems.map((item, index) => (
                  <a
                    key={item.text}
                    onClick={() => handleNavigate(item.path)}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 group relative overflow-hidden transform hover:scale-[1.02] active:scale-[0.98]",
                      location.pathname === item.path
                        ? "bg-gradient-to-r from-green-500/20 to-green-600/10 text-green-400 border border-green-500/30 shadow-lg shadow-green-500/10 scale-[1.02]"
                        : "text-gray-300 hover:bg-gradient-to-r hover:from-[#1E2735] hover:to-[#2A3143] hover:text-white border border-transparent hover:border-[#2A3143] hover:shadow-md"
                    )}
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animation: mobileMenuOpen ? `slideInLeft 0.3s ease-out ${index * 50}ms both` : undefined
                    }}
                  >
                    {/* Icon container */}
                    <div className={cn(
                      "p-2 rounded-lg transition-all duration-200",
                      location.pathname === item.path
                        ? "bg-green-500/20 text-green-400"
                        : "bg-[#1E2735] text-gray-400 group-hover:bg-[#2A3143] group-hover:text-white"
                    )}>
                      <item.icon size={20} />
                    </div>

                    {/* Text */}
                    <span className="font-medium text-base">{item.text}</span>

                    {/* Active indicator */}
                    {location.pathname === item.path && (
                      <div className="absolute right-4 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    )}
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* Mobile User Section */}
          <div className="p-6 border-t border-[#1E2735]/50 bg-gradient-to-r from-[#0A0E16] to-[#10141E]">
            {user ? (
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#1E2735] to-[#2A3143] rounded-xl border border-[#2A3143]">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {(profile?.full_name || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">
                    {profile?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {user.email || 'user@example.com'}
                  </p>
                </div>
                <UserProfileMenu />
              </div>
            ) : (
              <Button
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 flex items-center justify-center gap-3 py-4 text-base font-medium rounded-xl shadow-lg shadow-green-500/20 transition-all duration-200 hover:shadow-green-500/30 hover:scale-[1.02]"
                onClick={handleLoginClick}
              >
                <LogIn size={20} />
                Login / Sign up
              </Button>
            )}
          </div>
        </div>
      </>
    );
  }
};
