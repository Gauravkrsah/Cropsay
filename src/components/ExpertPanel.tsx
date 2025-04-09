import React, { useState, useEffect, useRef } from 'react';
import { X, MessageSquare, Calendar, User, Star, BookOpen, ShoppingBag, Info, Truck, Upload, Phone, Video, Mic, ShoppingCartIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCart, CartItem } from '@/contexts/CartContext';
import { CartItemQuantity } from '@/components/ShoppingCart';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ExpertPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children?: React.ReactNode;
}

interface Expert {
  id: string;
  name: string;
  role: string;
  experience: string;
  languages: string[];
  rating: number;
  image?: string;
}

// Sample recommended products data
const recommendedProducts = [
  {
    id: 101,
    name: 'Premium Seeds',
    description: 'High-Yield Wheat Seeds',
    price: 2550,
    rating: 4.9,
    category: 'Seeds',
    inStock: true,
  },
  {
    id: 102,
    name: 'Roundup',
    description: 'Roundup Herbicide',
    price: 450,
    rating: 4.8,
    category: 'Pesticides',
    inStock: true,
  },
  {
    id: 103,
    name: 'NPK Fertilizer',
    description: 'Balanced Wheat Formula',
    price: 1200,
    rating: 4.7,
    category: 'Fertilizers',
    inStock: true,
  },
];

// Sample experts data - in a real app this would come from an API
const experts: Expert[] = [
  {
    id: '1',
    name: 'Dr. Sarah Chen',
    role: 'Senior Agronomist',
    experience: '15+ years exp.',
    languages: ['English', 'Nepali'],
    rating: 4.9,
    image: '/assets/experts/sarah-chen.png',
  },
  {
    id: '2',
    name: 'Dr. Michael Rodriguez',
    role: 'Soil Specialist',
    experience: '12+ years exp.',
    languages: ['English', 'Spanish'],
    rating: 4.7,
  },
  {
    id: '3',
    name: 'Dr. Aisha Patel',
    role: 'Crop Disease Expert',
    experience: '10+ years exp.',
    languages: ['English', 'Hindi', 'Gujarati'],
    rating: 4.8,
  },
  {
    id: '4',
    name: 'Dr. James Wilson',
    role: 'Agricultural Economist',
    experience: '18+ years exp.',
    languages: ['English'],
    rating: 4.6,
  }
];

export const ExpertPanel = ({ isOpen, onClose, title, children }: ExpertPanelProps) => {
  const [activeChatExpert, setActiveChatExpert] = useState<Expert | null>(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const { items, addItem, openCart } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeProductCategory, setActiveProductCategory] = useState<string>("all");

  // Add click outside handler to close the panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && 
          panelRef.current && 
          !panelRef.current.contains(event.target as Node) && 
          !(event.target as Element).closest('[data-sidebar-toggle]')) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleChatNow = (expert: Expert) => {
    setActiveChatExpert(expert);
  };

  const handleSchedule = (expert: Expert) => {
    setSelectedExpert(expert);
    setScheduleDialogOpen(true);
  };

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      // Here you would normally send the message to the API
      // For now we just clear the input
      setChatInput('');
      setShowAttachmentMenu(false);
    }
  };
  
  const cartItemForProduct = (productId: number) => {
    return items.find(item => item.id === productId);
  };
  
  const handleAddToCart = (product: any) => {
    addItem(product);
  };
  
  const toggleAttachmentMenu = () => {
    setShowAttachmentMenu(!showAttachmentMenu);
  };

  // Filter experts based on selected category
  const filteredExperts = experts.filter(expert => {
    if (activeCategory === "all") return true;
    if (activeCategory === "agronomists") return expert.role.toLowerCase().includes("agronomist");
    if (activeCategory === "soil specialists") return expert.role.toLowerCase().includes("soil");
    return true;
  });

  // Filter products based on selected category
  const filteredProducts = recommendedProducts.filter(product => {
    if (activeProductCategory === "all") return true;
    return product.category.toLowerCase() === activeProductCategory.toLowerCase();
  });

  return (
    <>
      <div 
        ref={panelRef}
        className={cn(
          "fixed top-0 right-0 h-full w-80 bg-[#10141E] border-l border-[#1E2A3B] z-50 transform transition-transform duration-300 ease-in-out shadow-xl",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex justify-between items-center bg-[#10141E] border-b border-[#1E2A3B] p-4">
          <h2 className="text-lg font-medium text-white">{title}</h2>
          {title === "Recommended Products" && (
            <button 
              onClick={openCart}
              className="relative p-1.5 bg-[#1E2735] hover:bg-[#2A3143] rounded-lg transition-colors"
              aria-label={`View cart with ${items.length} items`}
            >
              <ShoppingCartIcon size={18} />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {items.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </button>
          )}
          <button 
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-[#2A3143] transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        {title === "Available Experts" ? (
          <>
            <div className="p-3 bg-[#10141E]">
              <div className="flex gap-2 mb-3 overflow-x-auto pb-1 no-scrollbar">
                <Button 
                  variant={activeCategory === "all" ? "default" : "outline"} 
                  className={cn(
                    "rounded-full h-7 px-3 text-xs",
                    activeCategory === "all" 
                      ? "bg-green-500 text-white hover:bg-green-600" 
                      : "bg-[#1E2735] border-[#2A3143] hover:bg-[#2A3143] text-white"
                  )}
                  onClick={() => setActiveCategory("all")}
                >
                  All
                </Button>
                <Button 
                  variant={activeCategory === "agronomists" ? "default" : "outline"} 
                  className={cn(
                    "rounded-full h-7 px-3 text-xs",
                    activeCategory === "agronomists" 
                      ? "bg-green-500 text-white hover:bg-green-600" 
                      : "bg-[#1E2735] border-[#2A3143] hover:bg-[#2A3143] text-white"
                  )}
                  onClick={() => setActiveCategory("agronomists")}
                >
                  Agronomists
                </Button>
                <Button 
                  variant={activeCategory === "soil specialists" ? "default" : "outline"} 
                  className={cn(
                    "rounded-full h-7 px-3 text-xs",
                    activeCategory === "soil specialists" 
                      ? "bg-green-500 text-white hover:bg-green-600" 
                      : "bg-[#1E2735] border-[#2A3143] hover:bg-[#2A3143] text-white"
                  )}
                  onClick={() => setActiveCategory("soil specialists")}
                >
                  Soil Specialists
                </Button>
              </div>
            </div>
            
            <div className="h-[calc(100%-118px)] overflow-y-auto px-3 custom-scrollbar hide-scrollbar">
              <div className="space-y-2 pb-3">
                {filteredExperts.map(expert => (
                  <div key={expert.id} className="bg-[#1E2735] rounded-lg p-3 hover:bg-[#252F3F] transition-colors relative">
                    <div className="absolute top-2 right-2 text-amber-400">
                      <Star size={14} className="fill-amber-400" />
                    </div>
                    
                    <div className="flex gap-2">
                      <div className="w-10 h-10 rounded-full bg-[#2A3143] flex items-center justify-center overflow-hidden flex-shrink-0">
                        {expert.image ? (
                          <img src={expert.image} alt={expert.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-medium">
                            {expert.name.split(' ').map(name => name[0]).join('')}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 pr-3">
                        <h4 className="font-medium text-sm text-white pr-4 truncate">{expert.name}</h4>
                        <p className="text-xs text-gray-200 leading-tight truncate">{expert.role}</p>
                        <p className="text-xs text-gray-400 leading-tight truncate">{expert.experience}</p>
                        <p className="text-xs text-gray-400 leading-tight mb-2 truncate">
                          {expert.languages.join(', ')}
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1 h-7 bg-green-500 hover:bg-green-600 text-white rounded-md text-xs font-medium py-0 px-2"
                            onClick={() => handleChatNow(expert)}
                          >
                            <MessageSquare size={12} className="mr-1" /> Chat
                          </Button>
                          <Button 
                            variant="outline" 
                            className="flex-1 h-7 rounded-md bg-[#1E2735] border-[#2A3143] hover:bg-[#2A3143] text-xs font-medium whitespace-nowrap py-0 px-2"
                            onClick={() => handleSchedule(expert)}
                          >
                            <Calendar size={12} className="mr-1" /> Schedule
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : title === "Relevant Sources" ? (
          <ScrollArea className="h-[calc(100%-64px)] custom-scrollbar">
            <div className="p-4 space-y-4">
              <div className="bg-[#2E3A4B] rounded-lg p-4">
                <h4 className="font-medium text-white">Agricultural Best Practices</h4>
                <p className="text-sm text-gray-300 mb-2">Indian Council of Agricultural Research</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <BookOpen size={14} className="mr-1" />
                    <span className="text-xs text-gray-400">Research Paper</span>
                  </div>
                  <span className="text-xs text-gray-400">2024</span>
                </div>
                <div className="mt-3 text-center">
                  <Button variant="link" className="text-green-500 hover:text-green-400">
                    View Source
                  </Button>
                </div>
              </div>
              
              <div className="bg-[#2E3A4B] rounded-lg p-4">
                <h4 className="font-medium text-white">Modern Wheat Cultivation Methods</h4>
                <p className="text-sm text-gray-300 mb-2">Punjab Agricultural University</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <BookOpen size={14} className="mr-1" />
                    <span className="text-xs text-gray-400">Research Study</span>
                  </div>
                  <span className="text-xs text-gray-400">2023</span>
                </div>
                <div className="mt-3 text-center">
                  <Button variant="link" className="text-green-500 hover:text-green-400">
                    View Source
                  </Button>
                </div>
              </div>
              
              <div className="bg-[#2E3A4B] rounded-lg p-4">
                <h4 className="font-medium text-white">Climate-Smart Agriculture in South Asia</h4>
                <p className="text-sm text-gray-300 mb-2">National Agricultural Research Centre</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <BookOpen size={14} className="mr-1" />
                    <span className="text-xs text-gray-400">Journal Article</span>
                  </div>
                  <span className="text-xs text-gray-400">2024</span>
                </div>
                <div className="mt-3 text-center">
                  <Button variant="link" className="text-green-500 hover:text-green-400">
                    View Source
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        ) : title === "Recommended Products" ? (
          <div className="h-[calc(100%-64px)] overflow-hidden flex flex-col">
            <div className="p-3">
              <div className="flex flex-wrap gap-2 mb-3">
                <Button 
                  variant={activeProductCategory === "all" ? "default" : "outline"} 
                  size="sm" 
                  className={cn(
                    "rounded-full h-7 px-3 text-xs",
                    activeProductCategory === "all" 
                      ? "bg-green-500 text-white hover:bg-green-600" 
                      : "bg-[#1E2735] border-[#2A3143] hover:bg-[#2A3143] text-white"
                  )}
                  onClick={() => setActiveProductCategory("all")}
                >
                  All
                </Button>
                <Button 
                  variant={activeProductCategory === "seeds" ? "default" : "outline"} 
                  size="sm" 
                  className={cn(
                    "rounded-full h-7 px-3 text-xs",
                    activeProductCategory === "seeds" 
                      ? "bg-green-500 text-white hover:bg-green-600" 
                      : "bg-[#1E2735] border-[#2A3143] hover:bg-[#2A3143] text-white"
                  )}
                  onClick={() => setActiveProductCategory("seeds")}
                >
                  Seeds
                </Button>
                <Button 
                  variant={activeProductCategory === "pesticides" ? "default" : "outline"} 
                  size="sm" 
                  className={cn(
                    "rounded-full h-7 px-3 text-xs",
                    activeProductCategory === "pesticides" 
                      ? "bg-green-500 text-white hover:bg-green-600" 
                      : "bg-[#1E2735] border-[#2A3143] hover:bg-[#2A3143] text-white"
                  )}
                  onClick={() => setActiveProductCategory("pesticides")}
                >
                  Pesticides
                </Button>
                <Button 
                  variant={activeProductCategory === "fertilizers" ? "default" : "outline"} 
                  size="sm" 
                  className={cn(
                    "rounded-full h-7 px-3 text-xs",
                    activeProductCategory === "fertilizers" 
                      ? "bg-green-500 text-white hover:bg-green-600" 
                      : "bg-[#1E2735] border-[#2A3143] hover:bg-[#2A3143] text-white"
                  )}
                  onClick={() => setActiveProductCategory("fertilizers")}
                >
                  Fertilizers
                </Button>
              </div>
              
              {items.length > 0 && (
                <div 
                  className="flex items-center justify-between bg-[#1E2735] p-2 rounded-md mb-3 cursor-pointer hover:bg-[#2A3143] transition-colors" 
                  onClick={openCart}
                >
                  <div className="flex items-center">
                    <ShoppingBag size={16} className="text-green-500 mr-2" />
                    <span className="text-xs text-white">
                      {items.reduce((total, item) => total + item.quantity, 0)} items in cart
                    </span>
                  </div>
                  <span className="text-xs font-medium text-green-500">
                    रु {items.reduce((total, item) => total + (item.price * item.quantity), 0).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto px-3 custom-scrollbar hide-scrollbar">
              <div className="space-y-2 pb-3">
                {filteredProducts.map(product => {
                  const cartItem = cartItemForProduct(product.id);
                  
                  return (
                    <div key={product.id} className="bg-[#1E2735] rounded-lg p-3">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-[#2A3143] rounded-md mr-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="font-medium text-sm">{product.name}</h4>
                            <div className="flex items-center">
                              <span className="text-yellow-400 mr-1">★</span>
                              <span className="text-xs">{product.rating}</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 mb-1 truncate">{product.description}</p>
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-medium text-sm">रु {product.price}</span>
                              <span className="text-xs ml-2 text-green-500">In Stock</span>
                            </div>
                            
                            {cartItem ? (
                              <CartItemQuantity 
                                id={product.id} 
                                quantity={cartItem.quantity}
                                className="h-7" 
                              />
                            ) : (
                              <Button 
                                size="sm" 
                                variant="default" 
                                className="bg-green-500 hover:bg-green-600 h-7 text-xs px-3"
                                onClick={() => handleAddToCart(product)}
                              >
                                Add
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 h-[calc(100%-64px)] overflow-y-auto custom-scrollbar hide-scrollbar">
            {children}
          </div>
        )}
      </div>

      {/* Expert Chat Dialog (WhatsApp-like) - centered and bigger */}
      <Dialog open={!!activeChatExpert} onOpenChange={(open) => !open && setActiveChatExpert(null)}>
        <DialogContent className="sm:max-w-[500px] p-0 bg-[#10141E] border-[#1E2A3B] overflow-hidden">
          <div className="bg-green-600 p-3 flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-white mr-3 flex items-center justify-center overflow-hidden">
                {activeChatExpert?.image ? (
                  <img src={activeChatExpert.image} alt={activeChatExpert.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-medium">
                    {activeChatExpert?.name.split(' ').map(name => name[0]).join('')}
                  </span>
                )}
              </div>
              <div>
                <h5 className="text-white font-medium">{activeChatExpert?.name}</h5>
                <p className="text-white/80 text-xs">{activeChatExpert?.role}</p>
              </div>
            </div>
            {/* Only showing one close button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-green-700 h-8 w-8" 
              onClick={() => setActiveChatExpert(null)}
            >
              <X size={18} />
            </Button>
          </div>
          
          <ScrollArea className="h-[350px] bg-[#0B141A] p-3 custom-scrollbar">
            <div className="text-center text-xs text-gray-500 my-2">Today</div>
            
            <div className="bg-[#005C4B] text-white rounded-lg p-2 my-2 ml-auto mr-2 max-w-[80%] text-sm">
              Hello, I need help with my wheat crop.
            </div>
            
            <div className="bg-[#1F2C34] text-white rounded-lg p-2 my-2 ml-2 mr-auto max-w-[80%] text-sm">
              Hi there! I'd be happy to help. What specific issue are you facing with your wheat crop?
            </div>
            
            <div className="text-center text-xs text-gray-500 my-2">2:35 PM</div>
            
            <div className="bg-[#005C4B] text-white rounded-lg p-2 my-2 ml-auto mr-2 max-w-[80%] text-sm">
              I'm noticing some yellow spots on the leaves. Is this a disease or nutrient deficiency?
            </div>
            
            <div className="bg-[#1F2C34] text-white rounded-lg p-2 my-2 ml-2 mr-auto max-w-[80%] text-sm">
              Based on your description, it could be either yellow rust (a fungal disease) or nitrogen deficiency. Can you send a photo of the affected leaves?
            </div>
            
            <div className="bg-[#1F2C34] text-white rounded-lg p-2 my-2 ml-2 mr-auto max-w-[80%] text-sm">
              Yellow rust typically shows as yellow/orange streaks or spots in lines along the leaf, while nitrogen deficiency tends to start at the leaf tips and progress inward with a more uniform yellowing.
            </div>
          </ScrollArea>
          
          <div className="p-3 bg-[#1E2A3B] border-t border-[#2E3A4B]">
            {/* Call buttons */}
            <div className="flex justify-between mb-3">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-green-500 hover:bg-[#2E3A4B] p-2"
              >
                <Phone size={18} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-green-500 hover:bg-[#2E3A4B] p-2"
              >
                <Video size={18} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-green-500 hover:bg-[#2E3A4B] p-2"
              >
                <Mic size={18} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-green-500 hover:bg-[#2E3A4B] p-2"
                onClick={toggleAttachmentMenu}
              >
                <Upload size={18} />
              </Button>
            </div>
            
            {/* Attachment menu */}
            {showAttachmentMenu && (
              <div className="bg-[#2E3A4B] mb-3 p-3 rounded-md">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="flex flex-col items-center">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="bg-[#3E4A5B] mb-1 hover:bg-[#4E5A6B]"
                    >
                      <Upload size={18} />
                    </Button>
                    <span className="text-xs text-gray-300">Photo</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="bg-[#3E4A5B] mb-1 hover:bg-[#4E5A6B]"
                    >
                      <BookOpen size={18} />
                    </Button>
                    <span className="text-xs text-gray-300">Document</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="bg-[#3E4A5B] mb-1 hover:bg-[#4E5A6B]"
                    >
                      <Mic size={18} />
                    </Button>
                    <span className="text-xs text-gray-300">Audio</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex">
              <input 
                type="text" 
                placeholder="Type a message"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-[#0F1621] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 border border-[#2E3A4B]"
              />
              <Button 
                className="ml-2 bg-green-500 hover:bg-green-600 h-9 w-9 p-0"
                onClick={handleSendMessage}
              >
                <MessageSquare size={16} />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="bg-[#0F1621] border-[#1E2A3B]">
          <DialogHeader>
            <DialogTitle>Schedule a meeting with {selectedExpert?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" className="text-sm bg-[#1E2735] border-[#2A3143] hover:bg-[#2A3143]">Today</Button>
              <Button variant="outline" className="text-sm bg-[#1E2735] border-[#2A3143] hover:bg-[#2A3143]">Tomorrow</Button>
              <Button variant="outline" className="text-sm bg-[#1E2735] border-[#2A3143] hover:bg-[#2A3143]">Pick a date</Button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="text-sm bg-[#1E2735] border-[#2A3143] hover:bg-[#2A3143]">9:00 AM</Button>
              <Button variant="outline" className="text-sm bg-[#1E2735] border-[#2A3143] hover:bg-[#2A3143]">10:00 AM</Button>
              <Button variant="outline" className="text-sm bg-[#1E2735] border-[#2A3143] hover:bg-[#2A3143]">2:00 PM</Button>
              <Button variant="outline" className="text-sm bg-[#1E2735] border-[#2A3143] hover:bg-[#2A3143]">4:00 PM</Button>
            </div>
            
            <div>
              <label className="block text-sm mb-1">Reason for consultation</label>
              <textarea 
                className="w-full bg-[#1E2735] border-[#2A3143] rounded-md p-2 h-20 text-sm focus:outline-none focus:ring-1 focus:ring-green-500" 
                placeholder="Briefly describe your issue..."
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="outline" onClick={() => setScheduleDialogOpen(false)} className="bg-[#1E2735] border-[#2A3143] hover:bg-[#2A3143]">Cancel</Button>
              <Button className="bg-green-500 hover:bg-green-600">
                Schedule Meeting
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
