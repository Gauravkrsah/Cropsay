import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { ExpertPanel } from './ExpertPanel';
import { BookOpen, ShoppingBag, Users, HeadphonesIcon, HelpCircle, PhoneCall, MessageCircle, Home, MessageSquare, Menu, MoreHorizontal, Search, ShoppingCartIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingCart } from './ShoppingCart';
import { UserProfilePopup } from './UserProfilePopup';
import { useIsMobile, useScreenSize } from '@/hooks/use-mobile';
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
  const { openCart, totalItems, items } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const screenSize = useScreenSize();

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
    setMoreMenuOpen(false);
    setMobileMenuOpen(false);
    setActiveBottomTab('');
  };

  const openSourcesPanel = () => {
    if (!sourcesAvailable) {
      // If sources are not available, show a message or tooltip
      return;
    }
    closeAllPanels();
    setPanelType('sources');
    setExpertPanelOpen(true);
    setActiveBottomTab('sources');
  };

  const openProductsPanel = () => {
    closeAllPanels();
    setPanelType('products');
    setExpertPanelOpen(true);
    setActiveBottomTab('products');
  };

  const openExpertsPanel = () => {
    closeAllPanels();
    setPanelType('experts');
    setExpertPanelOpen(true);
    setActiveBottomTab('experts');
  };

  const openSupportPanel = () => {
    closeAllPanels();
    setPanelType('support');
    setExpertPanelOpen(true);
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
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
      setActiveBottomTab('');
    } else {
      setExpertPanelOpen(false);
      setMoreMenuOpen(false);
      setMobileMenuOpen(true);
      setActiveBottomTab('menu');
    }
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
      // Navigate to shop page with search query
      navigate(`/shop?search=${encodeURIComponent(mobileSearchQuery.trim())}`);
      setMobileSearchQuery('');
    }
  };

  // Close panel when navigating to chat page
  const handleNavigationClick = (path: string) => {
    closeAllPanels();
    navigate(path);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AppSidebar onNavigate={handleNavigationClick} />
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <AppSidebar
          onNavigate={handleNavigationClick}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
      </div>

      <div
        className={cn(
          "relative flex-1 overflow-x-hidden bg-[#1E2735]",
          // Add padding on mobile for top and bottom navigation
          isMobile && "pt-16 pb-20"
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
                </TooltipTrigger>
                <TooltipContent side="left">
                  Get support from our team
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        {/* Mobile - Top navigation bar */}
        {isMobile && (
          <div className="fixed top-0 left-0 right-0 bg-[#10141E] border-b border-[#2A3143] z-40 px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center">
                <h1 className="text-lg font-bold text-white">Cropsay</h1>
              </div>

              {/* Search Bar */}
              <form onSubmit={handleMobileSearch} className="flex-1 mx-4 relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={mobileSearchQuery}
                  onChange={(e) => setMobileSearchQuery(e.target.value)}
                  className="w-full bg-[#1E2735] border border-[#2A3143] rounded-lg py-2 pl-9 pr-3 text-sm text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                />
              </form>

              {/* Shopping Cart */}
              <button
                onClick={openCart}
                className="relative p-2 rounded-lg hover:bg-[#1E2735] transition-colors"
              >
                <ShoppingCartIcon size={20} className="text-white" />
                {items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
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
            <div className="flex justify-around items-center py-1 px-2">
              {/* Home */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  closeAllPanels();
                  navigate('/');
                }}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 h-auto text-xs min-w-0 flex-1 rounded-lg transition-all duration-200",
                  location.pathname === '/'
                    ? "text-green-400 bg-green-500/10"
                    : "text-gray-400 hover:text-white hover:bg-[#1E2735]"
                )}
              >
                <Home size={22} />
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
                  "flex flex-col items-center gap-1 p-2 h-auto text-xs min-w-0 flex-1 rounded-lg transition-all duration-200",
                  location.pathname === '/chat'
                    ? "text-green-400 bg-green-500/10"
                    : "text-gray-400 hover:text-white hover:bg-[#1E2735]"
                )}
              >
                <MessageSquare size={22} />
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
                  "flex flex-col items-center gap-1 p-2 h-auto text-xs min-w-0 flex-1 rounded-lg transition-all duration-200",
                  location.pathname === '/shop'
                    ? "text-green-400 bg-green-500/10"
                    : "text-gray-400 hover:text-white hover:bg-[#1E2735]"
                )}
              >
                <ShoppingBag size={22} />
                <span className="font-medium">Shop</span>
              </Button>

              {/* More */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMoreMenuToggle}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 h-auto text-xs min-w-0 flex-1 rounded-lg transition-all duration-200",
                  activeBottomTab === 'more'
                    ? "text-green-400 bg-green-500/10"
                    : "text-gray-400 hover:text-white hover:bg-[#1E2735]"
                )}
              >
                <MoreHorizontal size={22} />
                <span className="font-medium">More</span>
              </Button>

              {/* Menu */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMenuToggle}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 h-auto text-xs min-w-0 flex-1 rounded-lg transition-all duration-200",
                  activeBottomTab === 'menu'
                    ? "text-green-400 bg-green-500/10"
                    : "text-gray-400 hover:text-white hover:bg-[#1E2735]"
                )}
              >
                <Menu size={22} />
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
            <div className="fixed bottom-20 left-0 right-0 bg-gradient-to-t from-[#0A0E16] to-[#10141E] border-t border-[#1E2735] z-50 rounded-t-2xl shadow-2xl backdrop-blur-lg">
              <div className="p-6">
                {/* Drag handle */}
                <div className="w-10 h-1.5 bg-gray-500 rounded-full mx-auto mb-6" />

                {/* Header */}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">Quick Access</h3>
                  <p className="text-gray-400 text-sm">
                    {location.pathname === '/chat'
                      ? 'Access expert features and support'
                      : 'More options coming soon'
                    }
                  </p>
                </div>

                {/* Show expert features only on chat page */}
                {location.pathname === '/chat' ? (
                  <>
                    {/* Options Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <Button
                        variant="ghost"
                        onClick={openSourcesPanel}
                        disabled={!sourcesAvailable}
                        className={cn(
                          "flex flex-col items-center gap-3 p-6 h-auto rounded-xl transition-all duration-200 border",
                          !sourcesAvailable
                            ? "bg-gray-800/50 border-gray-700 opacity-50 cursor-not-allowed"
                            : "bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 hover:border-blue-400/40 hover:bg-blue-500/20"
                        )}
                      >
                        <div className={cn(
                          "p-3 rounded-full",
                          !sourcesAvailable ? "bg-gray-700" : "bg-blue-500/20"
                        )}>
                          <BookOpen size={24} className={!sourcesAvailable ? "text-gray-500" : "text-blue-400"} />
                        </div>
                        <div className="text-center">
                          <span className="text-sm font-medium text-white">Sources</span>
                          <p className="text-xs text-gray-400 mt-1">Expert references</p>
                        </div>
                      </Button>

                      <Button
                        variant="ghost"
                        onClick={openProductsPanel}
                        className="flex flex-col items-center gap-3 p-6 h-auto bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 hover:border-green-400/40 hover:bg-green-500/20 rounded-xl transition-all duration-200"
                      >
                        <div className="p-3 rounded-full bg-green-500/20">
                          <ShoppingBag size={24} className="text-green-400" />
                        </div>
                        <div className="text-center">
                          <span className="text-sm font-medium text-white">Products</span>
                          <p className="text-xs text-gray-400 mt-1">Recommendations</p>
                        </div>
                      </Button>

                      <Button
                        variant="ghost"
                        onClick={openExpertsPanel}
                        className="flex flex-col items-center gap-3 p-6 h-auto bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 hover:border-purple-400/40 hover:bg-purple-500/20 rounded-xl transition-all duration-200"
                      >
                        <div className="p-3 rounded-full bg-purple-500/20">
                          <Users size={24} className="text-purple-400" />
                        </div>
                        <div className="text-center">
                          <span className="text-sm font-medium text-white">Experts</span>
                          <p className="text-xs text-gray-400 mt-1">Chat with pros</p>
                        </div>
                      </Button>

                      <Button
                        variant="ghost"
                        onClick={openSupportPanel}
                        className="flex flex-col items-center gap-3 p-6 h-auto bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 hover:border-orange-400/40 hover:bg-orange-500/20 rounded-xl transition-all duration-200"
                      >
                        <div className="p-3 rounded-full bg-orange-500/20">
                          <HeadphonesIcon size={24} className="text-orange-400" />
                        </div>
                        <div className="text-center">
                          <span className="text-sm font-medium text-white">Support</span>
                          <p className="text-xs text-gray-400 mt-1">Get help</p>
                        </div>
                      </Button>
                    </div>
                  </>
                ) : (
                  /* Show placeholder content for other pages */
                  <div className="text-center py-8">
                    <div className="p-4 rounded-full bg-gray-700/50 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <MessageCircle size={24} className="text-gray-400" />
                    </div>
                    <p className="text-gray-400 text-sm mb-2">Expert features available in Chat</p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setMoreMenuOpen(false);
                        navigate('/chat');
                      }}
                      className="bg-[#1E2735] border-[#2A3143] hover:bg-[#2A3143] text-gray-300"
                    >
                      Go to Chat
                    </Button>
                  </div>
                )}

                {/* Close button */}
                <Button
                  variant="outline"
                  onClick={() => setMoreMenuOpen(false)}
                  className="w-full mt-4 bg-[#1E2735] border-[#2A3143] hover:bg-[#2A3143] text-gray-300"
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
      </div>
    </div>
  );
};
