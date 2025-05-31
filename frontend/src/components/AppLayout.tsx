import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { ExpertPanel } from './ExpertPanel';
import { BookOpen, ShoppingBag, Users, HeadphonesIcon, HelpCircle, PhoneCall, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingCart } from './ShoppingCart';
import { UserProfilePopup } from './UserProfilePopup';
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

export const AppLayout = () => {  const [expertPanelOpen, setExpertPanelOpen] = useState(false);
  const [panelType, setPanelType] = useState<'sources' | 'products' | 'experts' | 'support'>('sources');
  const [sourcesAvailable, setSourcesAvailable] = useState(false);
  const { openCart, totalItems } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

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

  const openSourcesPanel = () => {
    if (!sourcesAvailable) {
      // If sources are not available, show a message or tooltip
      return;
    }
    setPanelType('sources');
    setExpertPanelOpen(true);
  };

  const openProductsPanel = () => {
    setPanelType('products');
    setExpertPanelOpen(true);
  };
  
  const openExpertsPanel = () => {
    setPanelType('experts');
    setExpertPanelOpen(true);
  };
  
  const openSupportPanel = () => {
    setPanelType('support');
    setExpertPanelOpen(true);
  };

  // Handle support actions
  const handleWhatsAppSupport = () => {
    window.open('https://wa.me/9779814789009', '_blank');
  };
  
  const handleMissedCall = () => {
    window.open('tel:+9779814789009', '_blank');
  };

  // Close panel when navigating to chat page
  const handleNavigationClick = (path: string) => {
    if (path === '/chat') {
      setExpertPanelOpen(false);
    }
    navigate(path);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar onNavigate={handleNavigationClick} />
      <div className="relative flex-1 overflow-x-hidden bg-[#1E2735]">
        <Outlet context={{ 
          openSourcesPanel, 
          openProductsPanel, 
          openExpertsPanel, 
          openSupportPanel, 
          sourcesAvailable,
          handleNavigationClick 
        }} />
        
        {/* Right side floating buttons */}
        <div className="fixed right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 z-40">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost"
                  size="icon"
                  onClick={openSourcesPanel}
                  aria-label="Open expert sources"
                  className={`bg-[#10141E] hover:bg-[#1E2735] rounded-full shadow-lg w-10 h-10 transition-opacity duration-200 ${!sourcesAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                  className="bg-[#10141E] hover:bg-[#1E2735] rounded-full shadow-lg w-10 h-10"
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
                  className="bg-[#10141E] hover:bg-[#1E2735] rounded-full shadow-lg w-10 h-10"
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
                      className="bg-[#10141E] hover:bg-[#1E2735] rounded-full shadow-lg w-10 h-10"
                    >
                      <HeadphonesIcon size={20} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="left" className="bg-[#10141E] border-[#2A3143] text-white">
                    <DropdownMenuItem className="hover:bg-[#1E2735] cursor-pointer" onClick={handleWhatsAppSupport}>
                      <MessageCircle className="mr-2 h-4 w-4" /> Chat with us
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-[#1E2735] cursor-pointer" onClick={handleMissedCall}>
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
