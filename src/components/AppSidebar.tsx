
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MessageSquare, ShoppingBag, DollarSign, BookOpen, Compass, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, text: 'Home', path: '/' },
  { icon: MessageSquare, text: 'Chat', path: '/chat' },
  { icon: ShoppingBag, text: 'Shop', path: '/shop' },
  { icon: DollarSign, text: 'Sell', path: '/sell' },
  { icon: BookOpen, text: 'Learn', path: '/learn' },
  { icon: Compass, text: 'Explore', path: '/explore' },
];

export const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className={cn(
      "transition-all duration-300 bg-sidebar flex flex-col h-screen relative",
      collapsed ? "w-20" : "w-64"
    )}>
      <div className="flex justify-between items-center p-4">
        {!collapsed && <h1 className="text-xl font-bold">Cropsay</h1>}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-md hover:bg-cropsay-grayDark transition-colors"
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>
      
      <div className="p-3">
        {!collapsed && <p className="text-cropsay-grayText text-sm mb-2 px-3">Navigation</p>}
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.text}
              to={item.path}
              className={cn(
                "nav-link",
                location.pathname === item.path ? "active" : "",
                collapsed ? "justify-center" : ""
              )}
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.text}</span>}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="mt-auto p-4">
        <button className="primary-button w-full">
          {collapsed ? 'Login' : 'Login / Sign up'}
        </button>
      </div>
    </div>
  );
};
