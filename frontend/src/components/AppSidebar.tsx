
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, MessageSquare, ShoppingBag, DollarSign, BookOpen, Compass, Menu, X, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfileMenu } from './UserProfileMenu';

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
}

export const AppSidebar = ({ onNavigate }: AppSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  const handleLoginClick = () => {
    navigate('/auth');
  };

  return (
    <div className={cn(
      "transition-all duration-300 bg-[#10141E] flex flex-col h-screen relative",
      collapsed ? "w-20" : "w-64"
    )}>
      <div className="flex justify-between items-center p-4">
        {!collapsed && <h1 className="text-xl font-bold">Cropsay</h1>}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-md hover:bg-[#1E2735] transition-colors"
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>
      
      <div className="p-3">
        {!collapsed && <p className="text-cropsay-grayText text-sm mb-2 px-3">Navigation</p>}
        <nav className="space-y-1">
          {navItems.map((item) => (
            <a
              key={item.text}
              onClick={() => handleNavigate(item.path)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-md cursor-pointer",
                location.pathname === item.path 
                  ? "bg-green-500 bg-opacity-20 text-green-400" 
                  : "text-gray-300 hover:bg-[#1E2735]",
                collapsed ? "justify-center" : ""
              )}
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.text}</span>}
            </a>
          ))}
        </nav>
      </div>
      
      <div className="mt-auto p-4">
        {user ? (
          <div className={cn("flex", collapsed ? "justify-center" : "items-center")}>
            {!collapsed && (
              <div className="mr-2 flex-1">
                <p className="text-sm font-medium truncate">{user.email}</p>
              </div>
            )}
            <UserProfileMenu />
          </div>
        ) : (
          <Button 
            className="w-full bg-green-500 hover:bg-green-600 flex items-center gap-2"
            onClick={handleLoginClick}
          >
            <LogIn size={18} />
            {collapsed ? '' : 'Login / Sign up'}
          </Button>
        )}
      </div>
    </div>
  );
};
