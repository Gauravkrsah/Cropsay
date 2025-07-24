
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Home, MessageSquare, ShoppingBag, DollarSign, BookOpen, Compass, X, LogIn, User, HelpCircle, LogOut, Camera, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfileMenu } from './UserProfileMenu';
import { useIsMobile, useScreenSize, useIsSmallMobile } from '@/hooks/use-mobile';
import { Dialog as UIDialog, DialogContent as UIDialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getOrdersByUser, cancelOrder, deleteOrder } from '@/services/orderService';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const [showProfile, setShowProfile] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    phone: '',
    address: '',
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut, updateProfile } = useAuth();
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

  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        phone: profile.phone || '',
        address: profile.address || '',
      });
    }
  }, [profile]);

  // Load orders when orders dialog is opened
  useEffect(() => {
    if (showOrders && user) {
      getOrdersByUser(user.id).then(setOrders);
    }
  }, [showOrders, user]);

  // Handler functions
  const handleCancelOrder = async (orderId: string) => {
    try {
      await cancelOrder(orderId);
      if (user) {
        const updatedOrders = await getOrdersByUser(user.id);
        setOrders(updatedOrders);
      }
    } catch (err) {
      console.error('Failed to cancel order', err);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteOrder(orderId);
      if (user) {
        const updatedOrders = await getOrdersByUser(user.id);
        setOrders(updatedOrders);
      }
      toast({
        title: 'Order Deleted',
        description: 'Order has been deleted from your history.',
      });
    } catch (err) {
      console.error('Failed to delete order', err);
    }
  };

  const handleProfileSubmit = async () => {
    if (!user) return;

    const success = await updateProfile(formData);
    if (success) {
      setEditMode(false);
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
    }
  };

  // Upload avatar image to Supabase storage
  // Note: Make sure 'avatars' storage bucket exists in Supabase
  const uploadAvatarImage = async (file: File, fileName: string): Promise<string | null> => {
    const filePath = `avatars/${fileName}`;

    const { data, error } = await supabase
      .storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true // Allow overwriting existing files
      });

    if (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }

    // Get the public URL for the avatar
    const { data: publicURLData } = supabase
      .storage
      .from('avatars')
      .getPublicUrl(data.path);

    return publicURLData.publicUrl;
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Please select an image smaller than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setUploadingAvatar(true);

    try {
      // Upload to Supabase storage
      const avatarUrl = await uploadAvatarImage(file, `${user.id}_${Date.now()}_${file.name}`);

      if (avatarUrl) {
        // Update the profile with new avatar URL
        await updateProfile({ avatar_url: avatarUrl });
        toast({
          title: 'Profile Picture Updated',
          description: 'Your profile picture has been updated successfully.',
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload profile picture. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

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
          <Link to="/" className="flex items-center relative hover:opacity-80 transition-opacity">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20 blur-xl rounded-full opacity-50"></div>
            <img 
              src={collapsed ? "/mobile_cropsay_logo.svg" : "/desktop_cropsay_logo.svg"}
              alt="Cropsay Logo" 
              className={cn(
                "transition-all duration-500 ease-out relative z-10 drop-shadow-lg",
                collapsed ? "w-9 h-9" : "w-16 h-16"
              )}
            />
          </Link>
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
          "fixed left-0 top-0 bg-gradient-to-b from-[#0A0E16] to-[#10141E] z-[101] transition-all duration-300 ease-out shadow-2xl border-r border-[#1E2735] mobile-nav-stable flex flex-col",
          // Height accounting for bottom navigation
          isSmallMobile ? "h-[calc(100vh-64px)]" : "h-[calc(100vh-80px)]",
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
            <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
              <img 
                src="/mobile_cropsay_logo.svg" 
                alt="Cropsay Logo" 
                className={cn(
                  "transition-all duration-300",
                  isSmallMobile ? "w-8 h-8" : "w-10 h-10"
                )}
              />
            </Link>
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
            "flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent",
            isSmallMobile ? "p-3 pb-6" : "p-4 pb-8"
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
            "border-t border-[#1E2735]/50 bg-gradient-to-r from-[#0A0E16] to-[#10141E] flex-shrink-0",
            isSmallMobile ? "p-3 pb-6" : "p-4 pb-8"
          )}>
            {user ? (
              <div className="space-y-3">
                {/* User Info with Profile Click and Logout */}
                <div
                onClick={() => {
                  setShowProfile(true);
                  setMobileMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 bg-gradient-to-r from-[#1E2735] to-[#2A3143] rounded-xl border border-[#2A3143] hover:from-[#2A3143] hover:to-[#3A4153] transition-all duration-200 cursor-pointer",
                  isSmallMobile ? "p-2.5" : "p-3"
                )}
              >
                <div className={cn(
                  "rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden",
                  isSmallMobile ? "w-7 h-7" : "w-8 h-8"
                )}>
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile?.full_name || 'User'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                      <span className={cn(
                        "text-white font-bold",
                        isSmallMobile ? "text-xs" : "text-sm"
                      )}>
                        {(profile?.full_name || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className={cn(
                    "font-medium text-white truncate text-left",
                    isSmallMobile ? "text-xs" : "text-sm"
                  )}>
                    {profile?.full_name || 'User'}
                  </p>
                  <p className={cn(
                    "text-gray-400 truncate text-left",
                    isSmallMobile ? "text-[10px]" : "text-xs"
                  )}>
                    {user.email || 'user@example.com'}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent profile click when clicking logout
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-center rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 transition-all duration-200 flex-shrink-0",
                    isSmallMobile ? "w-6 h-6" : "w-7 h-7"
                  )}
                >
                  <LogOut size={isSmallMobile ? 12 : 14} />
                </button>
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

        {/* Profile Dialog */}
        <UIDialog open={showProfile} onOpenChange={(open) => {
          if (!open) {
            setEditMode(false);
          }
          setShowProfile(open);
        }}>
          <UIDialogContent className="max-w-md w-full bg-[#10141E] text-gray-100 border border-[#2A3143]">
            <DialogHeader>
              <DialogTitle>User Profile</DialogTitle>
              <DialogDescription>{editMode ? 'Edit your profile details' : 'Account details'}</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="relative group">
                <Avatar className="w-20 h-20 border border-[#2A3143]">
                  <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'User'} />
                  <AvatarFallback className="bg-green-600 text-white text-2xl">
                    {(profile?.full_name || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {editMode && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      <Upload className="w-6 h-6 text-white" />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        disabled={uploadingAvatar}
                      />
                    </label>
                  </div>
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              {editMode ? (
                <div className="w-full space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                      className="bg-[#1E2735] border-[#2A3143] text-gray-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="bg-[#1E2735] border-[#2A3143] text-gray-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="bg-[#1E2735] border-[#2A3143] text-gray-100"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      className="bg-[#1E2735] border-[#2A3143] text-gray-100"
                      rows={3}
                    />
                  </div>
                </div>
              ) : (
                <div className="w-full space-y-3">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-white">{profile?.full_name || 'User'}</h3>
                    <p className="text-gray-400">{user?.email}</p>
                  </div>
                  {profile?.phone && (
                    <div className="bg-[#1E2735] p-3 rounded-lg">
                      <p className="text-sm text-gray-400">Phone</p>
                      <p className="text-white">{profile.phone}</p>
                    </div>
                  )}
                  {profile?.address && (
                    <div className="bg-[#1E2735] p-3 rounded-lg">
                      <p className="text-sm text-gray-400">Address</p>
                      <p className="text-white">{profile.address}</p>
                    </div>
                  )}
                  {profile?.bio && (
                    <div className="bg-[#1E2735] p-3 rounded-lg">
                      <p className="text-sm text-gray-400">Bio</p>
                      <p className="text-white">{profile.bio}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              {editMode ? (
                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    onClick={() => setEditMode(false)}
                    className="flex-1 border-[#2A3143] text-gray-300 hover:bg-[#1E2735]"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleProfileSubmit}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Save Changes
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setEditMode(true)}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Edit Profile
                </Button>
              )}
            </DialogFooter>
          </UIDialogContent>
        </UIDialog>

        {/* Orders Dialog */}
        <UIDialog open={showOrders} onOpenChange={setShowOrders}>
          <UIDialogContent className="max-w-2xl w-full bg-[#10141E] text-gray-100 border border-[#2A3143] max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>My Orders</DialogTitle>
              <DialogDescription>View and manage your order history</DialogDescription>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto">
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-400">No orders found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-[#1E2735] p-4 rounded-lg border border-[#2A3143]">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-white">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-gray-400">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-400">Rs. {order.total_amount}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      {order.items && order.items.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-400 mb-1">Items:</p>
                          <div className="space-y-1">
                            {order.items.map((item: any, index: number) => (
                              <p key={index} className="text-sm text-gray-300">
                                {item.quantity}x {item.product_name} - Rs. {item.price}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2 mt-3">
                        {order.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelOrder(order.id)}
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                          >
                            Cancel Order
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteOrder(order.id)}
                          className="border-[#2A3143] text-gray-400 hover:bg-[#1E2735]"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </UIDialogContent>
        </UIDialog>
      </>
    );
  }

  // Return null if mobile and not ready to prevent flickering
  return null;
};
