import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { ExpertPanel } from './ExpertPanel';
import { BookOpen, ShoppingBag, Users, HeadphonesIcon, PhoneCall, MessageCircle, Home, MessageSquare, Menu, ListCollapse, Search, ShoppingCartIcon, Package, TrendingUp, Calendar, BarChart3, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingCart } from './ShoppingCart';
import { UserProfilePopup } from './UserProfilePopup';
import { OrdersPopup } from './OrdersPopup';
import { SupportPopup } from './SupportPopup';
import { useIsMobile, useIsSmallMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export const AppLayout = () => {
  const [expertPanelOpen, setExpertPanelOpen] = useState(false);
  const [panelType, setPanelType] = useState<'sources' | 'products' | 'experts' | 'support'>('sources');
  const [sourcesAvailable, setSourcesAvailable] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [activeBottomTab, setActiveBottomTab] = useState('');
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const [showOrdersPopup, setShowOrdersPopup] = useState(false);
  const [showSupportPopup, setShowSupportPopup] = useState(false);
  const { openCart, items } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const isSmallMobile = useIsSmallMobile();

  // Check if user is a vendor (has @cropsay.com domain)
  const isVendor = user?.email?.endsWith('@cropsay.com') || false;

  // Search suggestions for animated placeholder
  const searchSuggestions = [
    "Search products...",
    "Search: organic seeds",
    "Search: fertilizers", 
    "Search: garden tools",
    "Search: pesticides",
    "Search: irrigation",
    "Search: greenhouse"
  ];

  // Prevent layout shift during initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLayoutReady(true);
    }, 100); // Small delay to ensure hooks are initialized

    return () => clearTimeout(timer);
  }, []);

  // Animated placeholder effect for mobile search
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholderIndex((prev) => (prev + 1) % searchSuggestions.length);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [searchSuggestions.length]);

  // Check for user questions in chat to enable sources panel
  useEffect(() => {
    // Listen for messages in the chat that indicate a question has been answered
    const checkForAnsweredQuestions = () => {
      // For demo purposes, this will be triggered manually from the ChatPage component
      // In a real app, you would set up an event listener or use a shared state
      
      // Default state: no sources available until a question is answered
      setSourcesAvailable(false);
    };
    
    checkForAnsweredQuestions();
    
    // Setup event listener for message changes
    window.addEventListener('message-answered', () => {
      setSourcesAvailable(true);
    });
    
    return () => {
      window.removeEventListener('message-answered', () => {
        setSourcesAvailable(true);
      });
    };
  }, []);

  // Close all panels and menus
  const closeAllPanels = () => {
    setExpertPanelOpen(false);
    setMobileMenuOpen(false);
    // Note: We don't close the more menu here to prevent conflicts
  };

  const openSourcesPanel = () => {
    if (!sourcesAvailable) {
      // If sources are not available, show a message or tooltip
      return;
    }
    closeAllPanels();
    setPanelType('sources');
    setExpertPanelOpen(true);
    setMoreMenuOpen(false);
    setActiveBottomTab('sources');
  };

  const openProductsPanel = () => {
    closeAllPanels();
    setPanelType('products');
    setExpertPanelOpen(true);
    setMoreMenuOpen(false);
    setActiveBottomTab('products');
  };

  const openExpertsPanel = () => {
    closeAllPanels();
    setPanelType('experts');
    setExpertPanelOpen(true);
    setMoreMenuOpen(false);
    setActiveBottomTab('experts');
  };

  const openSupportPanel = () => {
    closeAllPanels();
    setPanelType('support');
    setExpertPanelOpen(true);
    setMoreMenuOpen(false);
    setActiveBottomTab('support');
  };

  // Handle More menu toggle
  const handleMoreMenuToggle = () => {
    if (moreMenuOpen) {
      setMoreMenuOpen(false);
      setActiveBottomTab('');
    } else {
      setExpertPanelOpen(false);
      setMobileMenuOpen(false);
      setMoreMenuOpen(true);
      setActiveBottomTab('more');
    }
  };

  // Handle Menu toggle
  const handleMenuToggle = () => {
    // Always toggle the menu state
    const newMenuState = !mobileMenuOpen;
    
    if (newMenuState) {
      // Opening the menu
      setExpertPanelOpen(false);
      setMoreMenuOpen(false);
      setActiveBottomTab('menu');
    } else {
      // Closing the menu
      setActiveBottomTab('');
    }
    
    // Set the menu state last to ensure it takes effect
    setMobileMenuOpen(newMenuState);
  };

  // Handle support actions
  const handleWhatsAppSupport = () => {
    window.open('https://wa.me/9779814789009', '_blank');
  };
  
  const handleMissedCall = () => {
    window.open('tel:+9779814789009', '_blank');
  };

  // Handle mobile search
  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileSearchQuery.trim()) {
      // Navigate to search page with search query
      navigate(`/search?q=${encodeURIComponent(mobileSearchQuery.trim())}`);
      setMobileSearchQuery('');
    }
  };

  // Close panel when navigating to chat page
  const handleNavigationClick = (path: string) => {
    closeAllPanels();
    navigate(path);
  };

  return (
    <>
      <style>{`
        @keyframes fadeInOut {
          0% { 
            opacity: 0; 
            transform: translateY(8px);
            filter: blur(2px);
          }
          15% { 
            opacity: 1; 
            transform: translateY(0);
            filter: blur(0px);
          }
          85% { 
            opacity: 1; 
            transform: translateY(0);
            filter: blur(0px);
          }
          100% { 
            opacity: 0; 
            transform: translateY(-8px);
            filter: blur(2px);
          }
        }
        
        .search-placeholder {
          animation: fadeInOut 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    <div className="flex h-screen overflow-hidden">
      {/* Loading state to prevent layout shifts */}
      {!isLayoutReady && (
        <div className="fixed inset-0 bg-[#1E2735] z-50 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center animate-pulse">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-white font-medium">Loading...</span>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      {isLayoutReady && (
        <div className="hidden lg:block">
          <AppSidebar onNavigate={handleNavigationClick} />
        </div>
      )}

      {/* Mobile Sidebar */}
      {isLayoutReady && (
        <div className="lg:hidden">
          <AppSidebar
            onNavigate={handleNavigationClick}
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
          />
        </div>
      )}

      <div
        className={cn(
          "relative flex-1 overflow-x-hidden bg-[#1E2735]",
          // Add padding on mobile for top and bottom navigation (except search page)
          isMobile && location.pathname !== '/search' && (isSmallMobile ? "pt-14 pb-16" : "pt-16 pb-20"),
          // Only bottom padding on search page
          isMobile && location.pathname === '/search' && (isSmallMobile ? "pb-16" : "pb-20")
        )}
        onClick={() => {
          // Close panels when clicking on main content (only on mobile)
          if (isMobile && (moreMenuOpen || mobileMenuOpen)) {
            closeAllPanels();
          }
        }}
      >
        <Outlet context={{
          openSourcesPanel,
          openProductsPanel,
          openExpertsPanel,
          openSupportPanel,
          sourcesAvailable,
          handleNavigationClick
        }} />
        
        {/* Desktop - Right side floating buttons - Only show on chat page */}
        {!isMobile && location.pathname === '/chat' && (
          <div className="fixed right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 z-40">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={openSourcesPanel}
                    aria-label="Open expert sources"
                    className={cn(
                      "bg-[#10141E] hover:bg-[#1E2735] rounded-full shadow-lg w-10 h-10 transition-all duration-200",
                      !sourcesAvailable && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={!sourcesAvailable}
                  >
                    <BookOpen size={20} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  {sourcesAvailable
                    ? 'View expert sources for this answer'
                    : 'No sources available yet. Ask a question first.'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={openProductsPanel}
                    aria-label="View recommended products"
                    className="bg-[#10141E] hover:bg-[#1E2735] rounded-full shadow-lg w-10 h-10 transition-all duration-200"
                  >
                    <ShoppingBag size={20} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  View recommended products
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={openExpertsPanel}
                    aria-label="Chat with experts"
                    className="bg-[#10141E] hover:bg-[#1E2735] rounded-full shadow-lg w-10 h-10 transition-all duration-200"
                  >
                    <Users size={20} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  Chat with agricultural experts
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Contact support"
                          className="bg-[#10141E] hover:bg-[#1E2735] rounded-full shadow-lg w-10 h-10 transition-all duration-200"
                        >
                          <HeadphonesIcon size={20} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="left" className="bg-[#10141E] border-[#2A3143] text-white">
                        <DropdownMenuItem className="hover:bg-[#1E2735] cursor-pointer py-3" onClick={handleWhatsAppSupport}>
                          <MessageCircle className="mr-2 h-4 w-4" /> Chat with us
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-[#1E2735] cursor-pointer py-3" onClick={handleMissedCall}>
                          <PhoneCall className="mr-2 h-4 w-4" /> Missed call (+977 9814789009)
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left">
                  Get support from our team
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        {/* Mobile - Top navigation bar - Hide on search page */}
        {isMobile && location.pathname !== '/search' && (
          <div className={cn(
            "fixed top-0 left-0 right-0 bg-[#10141E] border-b border-[#2A3143] z-40",
            isSmallMobile ? "px-3 py-2" : "px-4 py-3"
          )}>
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
                <img 
                  src="/mobile_cropsay_logo.svg" 
                  alt="Cropsay" 
                  className={cn(
                    "h-auto", 
                    isSmallMobile ? "w-[24px]" : "w-[32px]"
                  )} 
                />
              </Link>

              {/* Search Bar */}
              <form onSubmit={handleMobileSearch} className="flex-1 mx-3 sm:mx-4 relative">
                <Search size={isSmallMobile ? 14 : 16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                <input
                  type="text"
                  placeholder=""
                  value={mobileSearchQuery}
                  onChange={(e) => setMobileSearchQuery(e.target.value)}
                  onFocus={() => {
                    // Always navigate to search page when input is focused
                    navigate('/search');
                  }}
                  onClick={() => {
                    // Also navigate when clicked
                    navigate('/search');
                  }}
                  className={cn(
                    "w-full bg-gradient-to-r from-[#10141E] to-[#0F1318] border border-[#2A3143] rounded-xl text-white placeholder-transparent focus:border-green-500 focus:ring-2 focus:ring-green-500/25 outline-none transition-all duration-300 hover:border-gray-300 shadow-lg hover:shadow-xl",
                    isSmallMobile ? "py-1.5 pl-8 pr-2 text-sm" : "py-2 pl-9 pr-3 text-sm"
                  )}
                />
                {/* Animated placeholder overlay */}
                {!mobileSearchQuery && (
                  <div className="absolute left-10 sm:left-11 top-1/2 transform -translate-y-1/2 pointer-events-none overflow-hidden">
                    <span 
                      key={currentPlaceholderIndex}
                      className={cn(
                        "text-gray-400 block search-placeholder",
                        isSmallMobile ? "text-sm" : "text-sm"
                      )}
                      style={{
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {searchSuggestions[currentPlaceholderIndex]}
                    </span>
                  </div>
                )}
              </form>

              {/* Shopping Cart */}
              <button
                onClick={openCart}
                className="relative p-2 rounded-lg hover:bg-[#1E2735] transition-colors"
              >
                <ShoppingCartIcon size={isSmallMobile ? 18 : 20} className="text-white" />
                {items.length > 0 && (
                  <span className={cn(
                    "absolute -top-1 -right-1 bg-green-500 text-white rounded-full flex items-center justify-center",
                    isSmallMobile ? "w-4 h-4 text-[10px]" : "w-5 h-5 text-xs"
                  )}>
                    {items.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Mobile - Bottom navigation bar */}
        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 bg-[#0A0E16] border-t border-[#1E2735] z-50 backdrop-blur-lg bg-opacity-95">
            <div className={cn(
              "flex justify-around items-center px-2",
              isSmallMobile ? "py-1" : "py-1.5"
            )}>
              {/* Home */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  closeAllPanels();
                  navigate('/');
                }}
                className={cn(
                  "flex flex-col items-center gap-1 h-auto min-w-0 flex-1 rounded-lg transition-all duration-200",
                  isSmallMobile ? "p-1.5 text-[10px]" : "p-2 text-xs",
                  location.pathname === '/'
                    ? "text-green-400 bg-green-500/10"
                    : "text-gray-400 hover:text-white hover:bg-[#1E2735]"
                )}
              >
                <Home size={isSmallMobile ? 18 : 22} />
                <span className="font-medium">Home</span>
              </Button>

              {/* Chat */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  closeAllPanels();
                  navigate('/chat');
                }}
                className={cn(
                  "flex flex-col items-center gap-1 h-auto min-w-0 flex-1 rounded-lg transition-all duration-200",
                  isSmallMobile ? "p-1.5 text-[10px]" : "p-2 text-xs",
                  location.pathname === '/chat'
                    ? "text-green-400 bg-green-500/10"
                    : "text-gray-400 hover:text-white hover:bg-[#1E2735]"
                )}
              >
                <MessageSquare size={isSmallMobile ? 18 : 22} />
                <span className="font-medium">Chat</span>
              </Button>

              {/* Shop */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  closeAllPanels();
                  navigate('/shop');
                }}
                className={cn(
                  "flex flex-col items-center gap-1 h-auto min-w-0 flex-1 rounded-lg transition-all duration-200",
                  isSmallMobile ? "p-1.5 text-[10px]" : "p-2 text-xs",
                  location.pathname === '/shop'
                    ? "text-green-400 bg-green-500/10"
                    : "text-gray-400 hover:text-white hover:bg-[#1E2735]"
                )}
              >
                <ShoppingBag size={isSmallMobile ? 18 : 22} />
                <span className="font-medium">Shop</span>
              </Button>

              {/* More */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMoreMenuToggle}
                className={cn(
                  "flex flex-col items-center gap-1 h-auto min-w-0 flex-1 rounded-lg transition-all duration-200",
                  isSmallMobile ? "p-1.5 text-[10px]" : "p-2 text-xs",
                  activeBottomTab === 'more'
                    ? "text-green-400 bg-green-500/10"
                    : "text-gray-400 hover:text-white hover:bg-[#1E2735]"
                )}
              >
                <ListCollapse size={isSmallMobile ? 18 : 22} />
                <span className="font-medium">More</span>
              </Button>

              {/* Menu */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMenuToggle}
                className={cn(
                  "flex flex-col items-center gap-1 h-auto min-w-0 flex-1 rounded-lg transition-all duration-200",
                  isSmallMobile ? "p-1.5 text-[10px]" : "p-2 text-xs",
                  activeBottomTab === 'menu'
                    ? "text-green-400 bg-green-500/10"
                    : "text-gray-400 hover:text-white hover:bg-[#1E2735]"
                )}
              >
                <Menu size={isSmallMobile ? 18 : 22} />
                <span className="font-medium">Menu</span>
              </Button>
            </div>
          </div>
        )}

        {/* Mobile More Menu Panel */}
        {isMobile && moreMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
              onClick={() => setMoreMenuOpen(false)}
            />
            <div className="fixed bottom-20 left-0 right-0 bg-gradient-to-t from-[#0A0E16] to-[#10141E] border-t border-[#1E2735] z-50 rounded-t-2xl shadow-2xl backdrop-blur-lg max-h-[70vh] overflow-hidden">
              <div className="p-4">
                {/* Drag handle */}
                <div className="w-10 h-1.5 bg-gray-500 rounded-full mx-auto mb-4" />

                {/* Header */}
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-white mb-1">Quick Access</h3>
                  <p className="text-gray-400 text-xs">Access expert features and support</p>
                </div>

                {/* Scrollable Options Grid */}
                <div className="relative">
                  <div className="max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                    <div className="grid grid-cols-2 gap-3 mb-4 px-1">
                  {/* Orders - Available for all users */}
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowOrdersPopup(true);
                      setMoreMenuOpen(false);
                    }}
                    className="flex flex-col items-center gap-2 p-4 h-auto bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 hover:border-blue-400/40 hover:bg-blue-500/20 rounded-lg transition-all duration-200"
                  >
                    <div className="p-2 rounded-full bg-blue-500/20 mx-auto">
                      <Package size={20} className="text-blue-400" />
                    </div>
                    <div className="text-center w-full">
                      <span className="text-xs font-medium text-white">Orders</span>
                      <p className="text-[10px] text-gray-400">Order history</p>
                    </div>
                  </Button>

                  {/* Support - Available for all users */}
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowSupportPopup(true);
                      setMoreMenuOpen(false);
                    }}
                    className="flex flex-col items-center gap-2 p-4 h-auto bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 hover:border-orange-400/40 hover:bg-orange-500/20 rounded-lg transition-all duration-200"
                  >
                    <div className="p-2 rounded-full bg-orange-500/20 mx-auto">
                      <HeadphonesIcon size={20} className="text-orange-400" />
                    </div>
                    <div className="text-center w-full">
                      <span className="text-xs font-medium text-white">Support</span>
                      <p className="text-[10px] text-gray-400">Get help</p>
                    </div>
                  </Button>

                  {/* Trending - Available for all users */}
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigate('/explore');
                      setMoreMenuOpen(false);
                    }}
                    className="flex flex-col items-center gap-2 p-4 h-auto bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 hover:border-green-400/40 hover:bg-green-500/20 rounded-lg transition-all duration-200"
                  >
                    <div className="p-2 rounded-full bg-green-500/20 mx-auto">
                      <TrendingUp size={20} className="text-green-400" />
                    </div>
                    <div className="text-center w-full">
                      <span className="text-xs font-medium text-white">Trending</span>
                      <p className="text-[10px] text-gray-400">Popular items</p>
                    </div>
                  </Button>

                  {/* Events Community - Available for all users */}
                  <Button
                    variant="ghost"
                    onClick={() => {
                      // Navigate to events/community page (placeholder for now)
                      setMoreMenuOpen(false);
                    }}
                    className="flex flex-col items-center gap-2 p-4 h-auto bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 hover:border-purple-400/40 hover:bg-purple-500/20 rounded-lg transition-all duration-200"
                  >
                    <div className="p-2 rounded-full bg-purple-500/20 mx-auto">
                      <Calendar size={20} className="text-purple-400" />
                    </div>
                    <div className="text-center w-full">
                      <span className="text-xs font-medium text-white">Events</span>
                      <p className="text-[10px] text-gray-400">Community</p>
                    </div>
                  </Button>

                  {/* Vendor-specific options */}
                  {isVendor && (
                    <>
                      {/* Create Listing */}
                      <Button
                        variant="ghost"
                        onClick={() => {
                          navigate('/sell');
                          setMoreMenuOpen(false);
                        }}
                        className="flex flex-col items-center gap-2 p-4 h-auto bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 hover:border-cyan-400/40 hover:bg-cyan-500/20 rounded-lg transition-all duration-200"
                      >
                        <div className="p-2 rounded-full bg-cyan-500/20 mx-auto">
                          <Plus size={20} className="text-cyan-400" />
                        </div>
                        <div className="text-center w-full">
                          <span className="text-xs font-medium text-white">Create</span>
                          <p className="text-[10px] text-gray-400">New listing</p>
                        </div>
                      </Button>

                      {/* Manage Listings */}
                      <Button
                        variant="ghost"
                        onClick={() => {
                          navigate('/sell');
                          setMoreMenuOpen(false);
                        }}
                        className="flex flex-col items-center gap-2 p-4 h-auto bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 hover:border-yellow-400/40 hover:bg-yellow-500/20 rounded-lg transition-all duration-200"
                      >
                        <div className="p-2 rounded-full bg-yellow-500/20 mx-auto">
                          <Settings size={20} className="text-yellow-400" />
                        </div>
                        <div className="text-center w-full">
                          <span className="text-xs font-medium text-white">Manage</span>
                          <p className="text-[10px] text-gray-400">Listings</p>
                        </div>
                      </Button>

                      {/* Analytics */}
                      <Button
                        variant="ghost"
                        onClick={() => {
                          navigate('/sell');
                          setMoreMenuOpen(false);
                        }}
                        className="flex flex-col items-center gap-2 p-4 h-auto bg-gradient-to-br from-pink-500/10 to-pink-600/5 border border-pink-500/20 hover:border-pink-400/40 hover:bg-pink-500/20 rounded-lg transition-all duration-200"
                      >
                        <div className="p-2 rounded-full bg-pink-500/20 mx-auto">
                          <BarChart3 size={20} className="text-pink-400" />
                        </div>
                        <div className="text-center w-full">
                          <span className="text-xs font-medium text-white">Analytics</span>
                          <p className="text-[10px] text-gray-400">Sales data</p>
                        </div>
                      </Button>
                    </>
                  )}
                    </div>
                  </div>
                  {/* Fade indicator for scrollable content */}
                  <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-[#10141E] to-transparent pointer-events-none"></div>
                </div>

                {/* Close button */}
                <Button
                  variant="outline"
                  onClick={() => setMoreMenuOpen(false)}
                  className="w-full mt-3 bg-[#1E2735] border-[#2A3143] hover:bg-[#2A3143] text-gray-300"
                >
                  Close
                </Button>
              </div>
            </div>
          </>
        )}
        
        {/* Panels */}
        <ExpertPanel
          isOpen={expertPanelOpen && panelType === 'sources'}
          onClose={() => setExpertPanelOpen(false)}
          title="Relevant Sources"
        />

        <ExpertPanel
          isOpen={expertPanelOpen && panelType === 'products'}
          onClose={() => setExpertPanelOpen(false)}
          title="Recommended Products"
        />
        
        <ExpertPanel
          isOpen={expertPanelOpen && panelType === 'experts'}
          onClose={() => setExpertPanelOpen(false)}
          title="Available Experts"
        />
        
        <ExpertPanel
          isOpen={expertPanelOpen && panelType === 'support'}
          onClose={() => setExpertPanelOpen(false)}
          title="Customer Support"
        />
          {/* Shopping Cart Component */}
        <ShoppingCart />

        {/* Profile Popup for first-time users */}
        {user && <UserProfilePopup />}

        {/* Orders Popup */}
        <OrdersPopup
          isOpen={showOrdersPopup}
          onClose={() => setShowOrdersPopup(false)}
        />

        {/* Support Popup */}
        <SupportPopup
          isOpen={showSupportPopup}
          onClose={() => setShowSupportPopup(false)}
        />
      </div>
    </div>
    </>
  );
};
