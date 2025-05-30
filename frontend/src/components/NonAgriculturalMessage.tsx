import React from 'react';
import { Info, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NonAgriculturalMessageProps {
  onCreateChat: () => void;
}

/**
 * Component displayed when a non-agricultural query is detected
 * Shows a message explaining that product recommendations are only available for agricultural topics
 */
const NonAgriculturalMessage: React.FC<NonAgriculturalMessageProps> = ({ onCreateChat }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="bg-[#1E2735] rounded-lg p-6 text-center max-w-xs">
        <Info size={48} className="mx-auto mb-4 text-blue-500" />
        <h3 className="text-lg font-medium mb-2">Non-Agricultural Topic</h3>
        <p className="text-sm text-gray-400 mb-4">
          Your recent questions weren't related to agriculture. Product recommendations are only available for agricultural topics.
        </p>
        <Button 
          className="bg-green-500 hover:bg-green-600 w-full"
          onClick={onCreateChat}
        >
          <PlusCircle size={16} className="mr-2" /> Ask About Agriculture
        </Button>
      </div>
    </div>
  );
};

export default NonAgriculturalMessage;
