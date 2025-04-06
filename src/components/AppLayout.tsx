
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { ExpertPanel } from './ExpertPanel';
import { BookOpen, ShoppingBag } from 'lucide-react';

export const AppLayout = () => {
  const [expertPanelOpen, setExpertPanelOpen] = useState(false);
  const [expertPanelType, setExpertPanelType] = useState<'sources' | 'products'>('sources');

  const openSourcesPanel = () => {
    setExpertPanelType('sources');
    setExpertPanelOpen(true);
  };

  const openProductsPanel = () => {
    setExpertPanelType('products');
    setExpertPanelOpen(true);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <div className="relative flex-1 overflow-x-hidden">
        <Outlet context={{ openSourcesPanel, openProductsPanel }} />
        
        {/* Right side floating buttons */}
        <div className="fixed right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 z-40">
          <button 
            className="bg-cropsay-darkSecondary hover:bg-cropsay-grayDark p-3 rounded-full shadow-lg"
            onClick={openSourcesPanel}
            aria-label="Open expert sources"
          >
            <BookOpen size={20} />
          </button>
          <button 
            className="bg-cropsay-darkSecondary hover:bg-cropsay-grayDark p-3 rounded-full shadow-lg"
            onClick={openProductsPanel}
            aria-label="Open recommended products"
          >
            <ShoppingBag size={20} />
          </button>
        </div>
        
        {/* Expert panels */}
        <ExpertPanel
          isOpen={expertPanelOpen && expertPanelType === 'sources'}
          onClose={() => setExpertPanelOpen(false)}
          title="Relevant Sources"
        >
          <div className="space-y-4">
            <ExpertSourceCard 
              title="Agricultural Best Practices" 
              organization="Indian Council of Agricultural Research" 
              docType="Research Paper"
              year="2024"
            />
            <ExpertSourceCard 
              title="Modern Wheat Cultivation Methods" 
              organization="Punjab Agricultural University" 
              docType="Research Study"
              year="2023"
            />
            <ExpertSourceCard 
              title="Climate-Smart Agriculture in South Asia" 
              organization="National Agricultural Research Centre" 
              docType="Journal Article"
              year="2024"
            />
          </div>
        </ExpertPanel>

        <ExpertPanel
          isOpen={expertPanelOpen && expertPanelType === 'products'}
          onClose={() => setExpertPanelOpen(false)}
          title="Recommended Products"
        >
          <div className="space-y-1 mb-4">
            <button className="bg-cropsay-green text-white rounded-full px-4 py-1 text-sm mr-2">All</button>
            <button className="bg-cropsay-darkSecondary hover:bg-cropsay-grayDark rounded-full px-4 py-1 text-sm mr-2">Seeds</button>
            <button className="bg-cropsay-darkSecondary hover:bg-cropsay-grayDark rounded-full px-4 py-1 text-sm mr-2">Pesticides</button>
            <button className="bg-cropsay-darkSecondary hover:bg-cropsay-grayDark rounded-full px-4 py-1 text-sm">Equipment</button>
          </div>
          
          <div className="space-y-4">
            <ProductCard 
              title="Premium Seeds" 
              description="High-Yield Wheat Seeds" 
              price={2550}
              rating={4.9}
              inStock={false}
            />
            <ProductCard 
              title="Roundup" 
              description="Roundup Herbicide" 
              price={450}
              rating={4.8}
              inStock={true}
            />
            <ProductCard 
              title="NPK Fertilizer" 
              description="Balanced Wheat Formula" 
              price={1200}
              rating={4.7}
              inStock={true}
            />
          </div>
        </ExpertPanel>
      </div>
    </div>
  );
};

interface ExpertSourceCardProps {
  title: string;
  organization: string;
  docType: string;
  year: string;
}

const ExpertSourceCard = ({ title, organization, docType, year }: ExpertSourceCardProps) => {
  return (
    <div className="bg-cropsay-dark rounded-lg p-4 hover:bg-cropsay-grayDark transition-colors">
      <h4 className="font-medium mb-1">{title}</h4>
      <p className="text-sm text-cropsay-grayText mb-2">{organization}</p>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <BookOpen size={14} className="mr-1" />
          <span className="text-xs text-cropsay-grayText">{docType}</span>
        </div>
        <span className="text-xs text-cropsay-grayText">{year}</span>
      </div>
      <button className="w-full mt-3 text-sm text-center text-cropsay-green hover:underline">
        View Source
      </button>
    </div>
  );
};

interface ProductCardProps {
  title: string;
  description: string;
  price: number;
  rating: number;
  inStock: boolean;
}

const ProductCard = ({ title, description, price, rating, inStock }: ProductCardProps) => {
  return (
    <div className="bg-cropsay-dark rounded-lg p-4 hover:bg-cropsay-grayDark transition-colors">
      <div className="flex items-start">
        <div className="w-12 h-12 bg-cropsay-grayDark rounded-md mr-3 flex-shrink-0"></div>
        <div className="flex-1">
          <div className="flex justify-between">
            <h4 className="font-medium">{title}</h4>
            <div className="flex items-center">
              <span className="text-yellow-400 mr-1">★</span>
              <span className="text-sm">{rating}</span>
            </div>
          </div>
          <p className="text-xs text-cropsay-grayText mb-2">{description}</p>
          <div className="flex justify-between items-center">
            <div>
              <span className="font-medium">₹{price}</span>
              <span className={`text-xs ml-2 ${inStock ? 'text-green-500' : 'text-red-500'}`}>
                {inStock ? 'In Stock' : 'Low Stock'}
              </span>
            </div>
            <button className="primary-button text-xs px-3 py-1">Add</button>
          </div>
        </div>
      </div>
    </div>
  );
};
