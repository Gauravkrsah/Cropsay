import React from 'react';
import PurchaseContextDebugger from '@/components/PurchaseContextDebugger';

const SimpleOrderHistoryPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Order History (Simplified)</h1>
      <p>This is a simplified version of the Order History page for testing.</p>
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-medium mb-2">PurchaseContext Debug Info:</h2>
        <PurchaseContextDebugger />
      </div>
    </div>
  );
};

export default SimpleOrderHistoryPage;
