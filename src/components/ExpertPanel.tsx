
import { X, MessageSquare, Calendar, User, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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

  const handleChatNow = (expert: Expert) => {
    setActiveChatExpert(expert);
  };

  const handleSchedule = (expert: Expert) => {
    setSelectedExpert(expert);
    setScheduleDialogOpen(true);
  };

  return (
    <>
      <div 
        className={cn(
          "fixed right-0 top-0 h-full w-96 bg-cropsay-dark shadow-lg transition-transform duration-300 z-50",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex justify-between items-center p-4 border-b border-cropsay-grayDark">
          <h3 className="font-medium text-lg">{title}</h3>
          <Button 
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-cropsay-grayDark transition-colors"
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
                <Button variant="outline" className="rounded-full">
                  Agronomists
                </Button>
                <Button variant="outline" className="rounded-full">
                  Soil Specialists
                </Button>
              </div>
            </div>
            
            <ScrollArea className="h-[calc(100%-132px)]">
              <div className="p-4 space-y-4">
                {experts.map(expert => (
                  <div key={expert.id} className="bg-cropsay-darkSecondary rounded-lg p-4">
                    <div className="flex gap-3">
                      <div className="w-14 h-14 rounded-full bg-cropsay-grayDark flex items-center justify-center overflow-hidden flex-shrink-0">
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
                        <p className="text-xs text-cropsay-grayText mt-1">{expert.experience}</p>
                        <p className="text-xs text-cropsay-grayText">
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
                            className="flex-1 h-9 rounded-md"
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
        ) : (
          <div className="p-4 h-[calc(100%-64px)] overflow-y-auto">
            {children}
          </div>
        )}
      </div>

      {/* Chat Popup (WhatsApp-like) */}
      {activeChatExpert && (
        <div className="fixed bottom-4 right-4 w-80 bg-cropsay-dark rounded-lg shadow-xl z-50 border border-cropsay-grayDark/30 overflow-hidden">
          <div className="bg-green-600 p-3 flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-white mr-2 flex items-center justify-center overflow-hidden">
                {activeChatExpert.image ? (
                  <img src={activeChatExpert.image} alt={activeChatExpert.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-medium">
                    {activeChatExpert.name.split(' ').map(name => name[0]).join('')}
                  </span>
                )}
              </div>
              <div>
                <h5 className="text-white font-medium text-sm">{activeChatExpert.name}</h5>
                <p className="text-white/80 text-xs">{activeChatExpert.role}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-green-700 h-8 w-8" 
              onClick={() => setActiveChatExpert(null)}
            >
              <X size={18} />
            </Button>
          </div>
          
          <div className="h-64 bg-[#0B141A] p-2 overflow-y-auto">
            <div className="text-center text-xs text-cropsay-grayText my-2">Today</div>
            
            <div className="bg-[#005C4B] text-white rounded-lg p-2 my-1 ml-auto mr-2 max-w-[80%] text-sm">
              Hello, I need help with my wheat crop.
            </div>
            
            <div className="bg-[#1F2C34] text-white rounded-lg p-2 my-1 ml-2 mr-auto max-w-[80%] text-sm">
              Hi there! I'd be happy to help. What specific issue are you facing with your wheat crop?
            </div>
          </div>
          
          <div className="p-2 bg-cropsay-dark border-t border-cropsay-grayDark/30">
            <div className="flex">
              <input 
                type="text" 
                placeholder="Type a message"
                className="flex-1 bg-cropsay-darkSecondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              <Button className="ml-2 bg-green-500 hover:bg-green-600 h-9 w-9 p-0">
                <MessageSquare size={16} />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule a meeting with {selectedExpert?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" className="text-sm">Today</Button>
              <Button variant="outline" className="text-sm">Tomorrow</Button>
              <Button variant="outline" className="text-sm">Pick a date</Button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="text-sm">9:00 AM</Button>
              <Button variant="outline" className="text-sm">10:00 AM</Button>
              <Button variant="outline" className="text-sm">2:00 PM</Button>
              <Button variant="outline" className="text-sm">4:00 PM</Button>
            </div>
            
            <div>
              <label className="block text-sm mb-1">Reason for consultation</label>
              <textarea 
                className="w-full bg-background border border-input rounded-md p-2 h-20 text-sm" 
                placeholder="Briefly describe your issue..."
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
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
