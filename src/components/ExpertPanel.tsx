import React, { useState, useEffect, useRef } from 'react';
import { X, MessageSquare, Calendar, User, Star, BookOpen, ShoppingBag, Info, Truck, Upload, Phone, Video, Mic } from 'lucide-react';
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
    image: '/lovable-uploads/0f958db4-ccac-4f66-a163-d97a14bd4953.png',
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

  return (
    <>
      <div 
        ref={panelRef}
        className={cn(
          "fixed right-0 top-0 h-full w-96 bg-[#10141E] shadow-lg transition-transform duration-300 z-50",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex justify-between items-center p-4 border-b border-[#2E3A4B]">
          <h3 className="font-medium text-lg">{title}</h3>
          <Button 
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-[#2E3A4B] transition-colors"
          >
            <X size={18} />
          </Button>
        </div>
        
        {title === "Available Experts" ? (
          <>
            <div className="p-4">
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                <Button variant="default" className="rounded-full bg-green-500 text-white hover:bg-green-600">
                  All
                </Button>
                <Button variant="outline" className="rounded-full bg-[#2E3A4B] border-[#3E4A5B] hover:bg-[#3E4A5B]">
                  Agronomists
                </Button>
                <Button variant="outline" className="rounded-full bg-[#2E3A4B] border-[#3E4A5B] hover:bg-[#3E4A5B]">
                  Soil Specialists
                </Button>
              </div>
            </div>
            
            <ScrollArea className="h-[calc(100%-132px)] custom-scrollbar">
              <div className="p-4 space-y-4">
                {experts.map(expert => (
                  <div key={expert.id} className="bg-[#2E3A4B] rounded-lg p-4">
                    <div className="flex gap-3">
                      <div className="w-14 h-14 rounded-full bg-[#3E4A5B] flex items-center justify-center overflow-hidden flex-shrink-0">
                        {expert.image ? (
                          <img src={expert.image} alt={expert.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-medium">
                            {expert.name.split(' ').map(name => name[0]).join('')}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-base">{expert.name}</h4>
                          <div className="flex items-center text-amber-400">
                            <Star size={16} className="fill-amber-400" />
                            <span className="text-sm text-white ml-1">{expert.rating}</span>
                          </div>
                        </div>
                        <p className="text-sm">{expert.role}</p>
                        <p className="text-xs text-gray-400 mt-1">{expert.experience}</p>
                        <p className="text-xs text-gray-400">
                          {expert.languages.join(', ')}
                        </p>
                        <div className="flex gap-2 mt-3">
                          <Button 
                            className="flex-1 h-9 bg-green-500 hover:bg-green-600 text-white rounded-md"
                            onClick={() => handleChatNow(expert)}
                          >
                            <MessageSquare size={16} className="mr-1" /> Chat Now
                          </Button>
                          <Button 
                            variant="outline" 
                            className="flex-1 h-9 rounded-md bg-[#2E3A4B] border-[#3E4A5B] hover:bg-[#3E4A5B]"
                            onClick={() => handleSchedule(expert)}
                          >
                            <Calendar size={16} className="mr-1" /> Schedule
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
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
          <ScrollArea className="h-[calc(100%-64px)] custom-scrollbar">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex flex-wrap gap-2">
                  <Button variant="default" size="sm" className="bg-green-500 hover:bg-green-600 rounded-full">All</Button>
                  <Button variant="outline" size="sm" className="rounded-full bg-[#2E3A4B] border-[#3E4A5B] hover:bg-[#3E4A5B]">Seeds</Button>
                  <Button variant="outline" size="sm" className="rounded-full bg-[#2E3A4B] border-[#3E4A5B] hover:bg-[#3E4A5B]">Pesticides</Button>
                </div>
                
                {items.length > 0 && (
                  <Button
                    onClick={openCart}
                    variant="outline"
                    size="icon"
                    className="relative p-2 bg-[#2E3A4B] hover:bg-[#3E4A5B] border-[#3E4A5B] rounded-full transition-colors"
                  >
                    <ShoppingBag size={18} />
                    <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {items.reduce((total, item) => total + item.quantity, 0)}
                    </span>
                  </Button>
                )}
              </div>
              
              <div className="space-y-4">
                {recommendedProducts.map(product => {
                  const cartItem = cartItemForProduct(product.id);
                  
                  return (
                    <div key={product.id} className="bg-[#2E3A4B] rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="w-12 h-12 bg-[#3E4A5B] rounded-md mr-3 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="font-medium">{product.name}</h4>
                            <div className="flex items-center">
                              <span className="text-yellow-400 mr-1">★</span>
                              <span className="text-sm">{product.rating}</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 mb-2">{product.description}</p>
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-medium">₹{product.price}</span>
                              <span className="text-xs ml-2 text-green-500">In Stock</span>
                            </div>
                            
                            {cartItem ? (
                              <CartItemQuantity 
                                id={product.id} 
                                quantity={cartItem.quantity}
                                className="h-8" 
                              />
                            ) : (
                              <Button 
                                size="sm" 
                                variant="default" 
                                className="bg-green-500 hover:bg-green-600"
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
          </ScrollArea>
        ) : (
          <div className="p-4 h-[calc(100%-64px)] overflow-y-auto custom-scrollbar">
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
              <Button variant="outline" className="text-sm bg-[#1E2A3B] border-[#2E3A4B] hover:bg-[#2E3A4B]">Today</Button>
              <Button variant="outline" className="text-sm bg-[#1E2A3B] border-[#2E3A4B] hover:bg-[#2E3A4B]">Tomorrow</Button>
              <Button variant="outline" className="text-sm bg-[#1E2A3B] border-[#2E3A4B] hover:bg-[#2E3A4B]">Pick a date</Button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="text-sm bg-[#1E2A3B] border-[#2E3A4B] hover:bg-[#2E3A4B]">9:00 AM</Button>
              <Button variant="outline" className="text-sm bg-[#1E2A3B] border-[#2E3A4B] hover:bg-[#2E3A4B]">10:00 AM</Button>
              <Button variant="outline" className="text-sm bg-[#1E2A3B] border-[#2E3A4B] hover:bg-[#2E3A4B]">2:00 PM</Button>
              <Button variant="outline" className="text-sm bg-[#1E2A3B] border-[#2E3A4B] hover:bg-[#2E3A4B]">4:00 PM</Button>
            </div>
            
            <div>
              <label className="block text-sm mb-1">Reason for consultation</label>
              <textarea 
                className="w-full bg-[#1E2A3B] border-[#2E3A4B] rounded-md p-2 h-20 text-sm focus:outline-none focus:ring-1 focus:ring-green-500" 
                placeholder="Briefly describe your issue..."
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="outline" onClick={() => setScheduleDialogOpen(false)} className="bg-[#1E2A3B] border-[#2E3A4B] hover:bg-[#2E3A4B]">Cancel</Button>
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
