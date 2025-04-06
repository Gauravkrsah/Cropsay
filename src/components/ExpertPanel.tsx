
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ExpertPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const ExpertPanel = ({ isOpen, onClose, title, children }: ExpertPanelProps) => {
  return (
    <div 
      className={cn(
        "fixed right-0 top-0 h-full w-80 bg-cropsay-darkSecondary shadow-lg transition-transform duration-300 z-50",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="flex justify-between items-center p-4">
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
      
      <ScrollArea className="h-[calc(100%-64px)]">
        <div className="p-4">
          {children}
        </div>
      </ScrollArea>
    </div>
  );
};
