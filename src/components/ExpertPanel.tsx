
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        "fixed right-0 top-0 h-full w-80 bg-cropsay-darkSecondary border-l border-cropsay-grayDark transition-transform duration-300 z-50",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="flex justify-between items-center p-4 border-b border-cropsay-grayDark">
        <h3 className="font-medium text-lg">{title}</h3>
        <button 
          onClick={onClose}
          className="p-1 rounded-md hover:bg-cropsay-grayDark transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      <div className="p-4 overflow-y-auto h-[calc(100%-64px)]">
        {children}
      </div>
    </div>
  );
};
