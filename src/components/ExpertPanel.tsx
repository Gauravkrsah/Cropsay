
import { X, MessageSquare, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

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

export const ExpertPanel = ({ isOpen, onClose, title }: ExpertPanelProps) => {
  return (
    <div 
      className={cn(
        "fixed right-0 top-0 h-full w-80 bg-cropsay-darkSecondary shadow-lg transition-transform duration-300 z-50",
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
      
      <div className="p-4">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          <Button variant="secondary" className="rounded-full bg-cropsay-green text-white hover:bg-cropsay-green/90">
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
      
      <ScrollArea className="h-[calc(100%-64px)]">
        <div className="p-4 space-y-4">
          {experts.map(expert => (
            <div key={expert.id} className="bg-cropsay-dark rounded-lg p-3">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-full bg-cropsay-grayDark flex items-center justify-center overflow-hidden flex-shrink-0">
                  {expert.image ? (
                    <img src={expert.image} alt={expert.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-medium">
                      {expert.name.split(' ').map(name => name[0]).join('')}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-medium text-base">{expert.name}</h4>
                    <div className="flex items-center text-amber-400">
                      <span className="mr-1">★</span>
                      <span className="text-sm text-white">{expert.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-cropsay-grayText">{expert.role}</p>
                  <p className="text-xs text-cropsay-grayText mt-1">{expert.experience}</p>
                  <p className="text-xs text-cropsay-grayText">
                    {expert.languages.join(', ')}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Button className="flex-1 h-8 bg-cropsay-green hover:bg-cropsay-green/90 text-white">
                      <MessageSquare size={16} className="mr-1" /> Chat Now
                    </Button>
                    <Button variant="outline" className="flex-1 h-8">
                      <Calendar size={16} className="mr-1" /> Schedule
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
