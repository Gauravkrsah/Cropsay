
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, MessageSquare, ShoppingBag, DollarSign, BookOpen, Compass, Menu, X, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfileMenu } from './UserProfileMenu';
import { useIsMobile, useScreenSize, useIsSmallMobile } from '@/hooks/use-mobile';

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
  const [collapsed, setCollapsed] = useState(() => {
    // Initialize collapsed state based on current screen size
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return true; // Default to collapsed
  });
  const [isReady, setIsReady] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const isMobile = useIsMobile();
  const isSmallMobile = useIsSmallMobile();
  const screenSize = useScreenSize();

  // Prevent initial rendering issues
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Auto-collapse sidebar on mobile, but only after initial load
  useEffect(() => {
    if (isReady && isMobile) {
      setCollapsed(true);
    } else if (isReady && !isMobile) {
      // On desktop, default to collapsed
      setCollapsed(true);
    }
  }, [isMobile, isReady]);

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
      <div 
        className={cn(
          "bg-gradient-to-b from-[#0A0E16] to-[#10141E] flex flex-col h-screen relative border-r border-[#1E2735]/50 shadow-2xl transition-all duration-500 ease-in-out",
          collapsed ? "w-22" : "w-68",
          !isReady && "opacity-0",
          isReady && "opacity-100"
        )}
      >
        {/* Desktop Header */}
        <div className={cn(
          "flex justify-center items-center border-b border-[#1E2735]/50 bg-gradient-to-r from-green-500/5 to-blue-500/5 backdrop-blur-sm",
          collapsed ? "p-3" : "p-5"
        )}>
          <div className="flex items-center relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20 blur-xl rounded-full opacity-50"></div>
            <img 
              src={collapsed ? "/mobile_cropsay_logo.svg" : "/desktop_cropsay_logo.svg"}
              alt="Cropsay Logo" 
              className={cn(
                "transition-all duration-500 ease-out relative z-10 drop-shadow-lg",
                collapsed ? "w-9 h-9" : "w-16 h-16"
              )}
            />
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className={cn(
          "flex-1",
          collapsed ? "p-2" : "p-4"
        )}>
          {!collapsed && (
            <div className="mb-4">
              <p className="text-gray-400 text-xs font-semibold tracking-wider uppercase mb-3 px-2">Navigation</p>
            </div>
          )}
          <nav className="space-y-2">
            {navItems.map((item, index) => (
              <div
                key={item.text}
                className="relative group"
              >
                <a
                  onClick={() => handleNavigate(item.path)}
                  className={cn(
                    "flex items-center cursor-pointer transition-all duration-300 ease-out relative overflow-hidden",
                    collapsed ? "justify-center p-3 mx-2" : "gap-4 p-3 mx-2 ml-3",
                    location.pathname === item.path
                      ? "bg-gradient-to-r from-green-500/20 to-green-600/10 text-green-400 shadow-lg shadow-green-500/20"
                      : "text-gray-300 hover:bg-gradient-to-r hover:from-[#1E2735] hover:to-[#253040] hover:text-white hover:shadow-md",
                    "rounded-xl"
                  )}
                >
                  {/* Background glow effect */}
                  {location.pathname === item.path && (
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-green-600/5 blur-sm"></div>
                  )}
                  
                  {/* Icon container */}
                  <div className={cn(
                    "relative z-10 transition-all duration-300",
                    collapsed ? "p-2" : "p-2.5",
                    location.pathname === item.path
                      ? "text-green-400"
                      : "text-gray-400 group-hover:text-white"
                  )}>
                    <item.icon size={collapsed ? 18 : 20} />
                  </div>

                  {/* Text with smooth transition */}
                  <span className={cn(
                    "font-medium transition-all duration-300 relative z-10",
                    collapsed ? "opacity-0 w-0" : "opacity-100 w-auto text-sm"
                  )}>
                    {item.text}
                  </span>

                  {/* Active indicator */}
                  {location.pathname === item.path && !collapsed && (
                    <div className="absolute right-3 w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                  )}
                </a>

                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-xl border border-gray-700 whitespace-nowrap">
                    {item.text}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Desktop User Section */}
        <div className={cn(
          "border-t border-[#1E2735]/50 bg-gradient-to-r from-[#0A0E16] to-[#10141E]",
          collapsed ? "p-3" : "p-4"
        )}>
          {user ? (
            <div className={cn(
              "flex items-center transition-all duration-300",
              collapsed ? "justify-center" : "gap-3 bg-gradient-to-r from-[#1E2735] to-[#253040] rounded-xl p-3 border border-[#2A3143]/50 shadow-lg"
            )}>
              {!collapsed && (
                <>
                  <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 w-10 h-10 shadow-lg shadow-green-500/30">
                    <span className="text-white font-bold text-sm">
                      {(profile?.full_name || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate text-sm">
                      {profile?.full_name || 'User'}
                    </p>
                    <p className="text-gray-400 truncate text-xs">
                      {user.email}
                    </p>
                  </div>
                </>
              )}
              <div className={cn(
                "flex-shrink-0",
                collapsed && "relative group"
              )}>
                <UserProfileMenu />
                {/* Tooltip for collapsed user menu */}
                {collapsed && (
                  <div className="absolute left-full ml-2 bottom-0 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-xl border border-gray-700 whitespace-nowrap">
                    {profile?.full_name || 'User Profile'}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="relative group">
              <Button
                className={cn(
                  "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 flex items-center justify-center font-medium rounded-xl shadow-lg shadow-green-500/20 transition-all duration-300 hover:shadow-green-500/40 hover:scale-[1.02] border-0",
                  collapsed ? "w-12 h-12 p-0" : "w-full gap-3 py-3"
                )}
                onClick={handleLoginClick}
              >
                <LogIn size={18} className="flex-shrink-0" />
                {!collapsed && <span>Login / Sign up</span>}
              </Button>
              {/* Tooltip for collapsed login button */}
              {collapsed && (
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-xl border border-gray-700 whitespace-nowrap">
                  Login / Sign up
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Mobile sidebar - only render when mobile menu is open
  if (isMobile && isReady) {
    return (
      <>
        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm mobile-nav-stable"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <div className={cn(
          "fixed left-0 top-0 h-full bg-gradient-to-b from-[#0A0E16] to-[#10141E] z-[101] transition-all duration-300 ease-out shadow-2xl border-r border-[#1E2735] mobile-nav-stable",
          // Responsive width based on screen size
          isSmallMobile 
            ? "w-[280px] max-w-[90vw]" 
            : screenSize === 'mobile' 
              ? "w-[320px] max-w-[85vw]" 
              : "w-[350px] max-w-[80vw]",
          mobileMenuOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
        )}>
          {/* Mobile Header */}
          <div className={cn(
            "flex justify-between items-center border-b border-[#1E2735]/50 bg-gradient-to-r from-green-500/10 to-blue-500/10",
            isSmallMobile ? "p-3" : "p-4"
          )}>
            <div className="flex items-center">
              <img 
                src="/mobile_cropsay_logo.svg" 
                alt="Cropsay Logo" 
                className={cn(
                  "transition-all duration-300",
                  isSmallMobile ? "w-8 h-8" : "w-10 h-10"
                )}
              />
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-xl hover:bg-[#1E2735] transition-all duration-200 text-gray-400 hover:text-white"
              aria-label="Close menu"
            >
              <X size={isSmallMobile ? 18 : 20} />
            </button>
          </div>

          {/* Mobile Navigation */}
          <div className={cn(
            "flex-1 overflow-y-auto",
            isSmallMobile ? "p-3" : "p-4"
          )}>
            <div className="mb-4">
              <p className={cn(
                "text-gray-400 font-medium mb-3 px-2",
                isSmallMobile ? "text-xs" : "text-sm"
              )}>Navigation</p>
              <nav className="space-y-1">
                {navItems.map((item, index) => (
                  <a
                    key={item.text}
                    onClick={() => handleNavigate(item.path)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl cursor-pointer transition-all duration-200 group relative overflow-hidden transform hover:scale-[1.02] active:scale-[0.98]",
                      isSmallMobile ? "p-2.5" : "p-3",
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
                      "rounded-lg transition-all duration-200",
                      isSmallMobile ? "p-1.5" : "p-2",
                      location.pathname === item.path
                        ? "bg-green-500/20 text-green-400"
                        : "bg-[#1E2735] text-gray-400 group-hover:bg-[#2A3143] group-hover:text-white"
                    )}>
                      <item.icon size={isSmallMobile ? 16 : 18} />
                    </div>

                    {/* Text */}
                    <span className={cn(
                      "font-medium",
                      isSmallMobile ? "text-sm" : "text-base"
                    )}>{item.text}</span>

                    {/* Active indicator */}
                    {location.pathname === item.path && (
                      <div className={cn(
                        "absolute right-3 bg-green-400 rounded-full animate-pulse",
                        isSmallMobile ? "w-1 h-1" : "w-1.5 h-1.5"
                      )} />
                    )}
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* Mobile User Section */}
          <div className={cn(
            "border-t border-[#1E2735]/50 bg-gradient-to-r from-[#0A0E16] to-[#10141E]",
            isSmallMobile ? "p-3" : "p-4"
          )}>
            {user ? (
              <div className={cn(
                "flex items-center gap-3 bg-gradient-to-r from-[#1E2735] to-[#2A3143] rounded-xl border border-[#2A3143]",
                isSmallMobile ? "p-2.5" : "p-3"
              )}>
                <div className={cn(
                  "bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center flex-shrink-0",
                  isSmallMobile ? "w-7 h-7" : "w-8 h-8"
                )}>
                  <span className={cn(
                    "text-white font-bold",
                    isSmallMobile ? "text-xs" : "text-sm"
                  )}>
                    {(profile?.full_name || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-medium text-white truncate",
                    isSmallMobile ? "text-xs" : "text-sm"
                  )}>
                    {profile?.full_name || 'User'}
                  </p>
                  <p className={cn(
                    "text-gray-400 truncate",
                    isSmallMobile ? "text-[10px]" : "text-xs"
                  )}>
                    {user.email || 'user@example.com'}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <UserProfileMenu />
                </div>
              </div>
            ) : (
              <Button
                className={cn(
                  "w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 flex items-center justify-center gap-2 font-medium rounded-xl shadow-lg shadow-green-500/20 transition-all duration-200 hover:shadow-green-500/30 hover:scale-[1.02]",
                  isSmallMobile ? "py-2.5 text-sm" : "py-3 text-base"
                )}
                onClick={handleLoginClick}
              >
                <LogIn size={isSmallMobile ? 16 : 18} />
                Login / Sign up
              </Button>
            )}
          </div>
        </div>
      </>
    );
  }

  // Return null if mobile and not ready to prevent flickering
  return null;
};
