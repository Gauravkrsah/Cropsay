
import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { ExpertPanel } from './ExpertPanel';
import { BookOpen, ShoppingBag, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';

export const AppLayout = () => {
  const [expertPanelOpen, setExpertPanelOpen] = useState(false);
  const [panelType, setPanelType] = useState<'sources' | 'products' | 'experts'>('sources');
  const { openCart } = useCart();
  const navigate = useNavigate();

  const openSourcesPanel = () => {
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
        <Outlet context={{ openSourcesPanel, openProductsPanel, openExpertsPanel, handleNavigationClick }} />
        
        {/* Right side floating buttons */}
        <div className="fixed right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 z-40">
          <Button 
            variant="ghost"
            size="icon"
            onClick={openSourcesPanel}
            aria-label="Open expert sources"
            className="bg-[#10141E] hover:bg-[#1E2735] rounded-full shadow-lg w-10 h-10"
          >
            <BookOpen size={20} />
          </Button>
          <Button 
            variant="ghost"
            size="icon"
            onClick={openProductsPanel}
            aria-label="Open recommended products"
            className="bg-[#10141E] hover:bg-[#1E2735] rounded-full shadow-lg w-10 h-10"
          >
            <ShoppingBag size={20} />
          </Button>
          <Button 
            variant="ghost"
            size="icon"
            onClick={openExpertsPanel}
            aria-label="Chat with experts"
            className="bg-[#10141E] hover:bg-[#1E2735] rounded-full shadow-lg w-10 h-10"
          >
            <Users size={20} />
          </Button>
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
      </div>
    </div>
  );
};
