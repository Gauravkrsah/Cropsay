// Helper file to debug the PurchaseContext
import React, { useEffect } from 'react';
import { usePurchase } from '@/contexts/PurchaseContext';

const PurchaseContextDebugger: React.FC = () => {
  const purchaseContext = usePurchase();
  
  useEffect(() => {
    console.log('PurchaseContext values:', purchaseContext);
  }, [purchaseContext]);
  
  return (
    <div>
      <h1>PurchaseContext Debugger</h1>
      <pre>{JSON.stringify(purchaseContext, null, 2)}</pre>
    </div>
  );
};

export default PurchaseContextDebugger;
