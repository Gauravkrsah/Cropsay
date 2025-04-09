
import React, { useState } from 'react';
import { Camera, Upload, CheckCircle } from 'lucide-react';

const SellPage = () => {
  const [activeTab, setActiveTab] = useState('listing');
  
  return (
    <div className="h-screen overflow-y-auto">
      <div className="border-b border-cropsay-grayDark p-4">
        <h1 className="text-2xl font-bold mb-4">Sell Products & Services</h1>
        
        <div className="flex border-b border-cropsay-grayDark">
          <button 
            className={`pb-2 px-4 font-medium ${activeTab === 'listing' ? 'text-cropsay-green border-b-2 border-cropsay-green' : 'text-cropsay-grayText'}`}
            onClick={() => setActiveTab('listing')}
          >
            Create Listing
          </button>
          <button 
            className={`pb-2 px-4 font-medium ${activeTab === 'manage' ? 'text-cropsay-green border-b-2 border-cropsay-green' : 'text-cropsay-grayText'}`}
            onClick={() => setActiveTab('manage')}
          >
            Manage Listings
          </button>
          <button 
            className={`pb-2 px-4 font-medium ${activeTab === 'orders' ? 'text-cropsay-green border-b-2 border-cropsay-green' : 'text-cropsay-grayText'}`}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
        </div>
      </div>
      
      {activeTab === 'listing' && (
        <div className="p-4 max-w-2xl mx-auto">
          <div className="bg-cropsay-darkSecondary rounded-lg p-6">
            <h2 className="text-xl font-medium mb-6">Create a Product Listing</h2>
            
            <form>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Product Images</label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="aspect-square bg-cropsay-grayDark rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-cropsay-grayMedium transition-colors">
                    <Camera size={24} className="text-cropsay-grayText mb-2" />
                    <span className="text-xs text-cropsay-grayText">Add Photo</span>
                  </div>
                  <div className="aspect-square bg-cropsay-grayDark rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-cropsay-grayMedium transition-colors">
                    <Upload size={24} className="text-cropsay-grayText mb-2" />
                    <span className="text-xs text-cropsay-grayText">Upload</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Product Name *</label>
                <input 
                  type="text" 
                  className="w-full bg-cropsay-dark border border-cropsay-grayDark rounded-lg py-2 px-3 focus:border-cropsay-green focus:ring-1 focus:ring-cropsay-green outline-none transition-all"
                  placeholder="Enter product name" 
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Category *</label>
                <select className="w-full bg-cropsay-dark border border-cropsay-grayDark rounded-lg py-2 px-3 focus:border-cropsay-green focus:ring-1 focus:ring-cropsay-green outline-none transition-all">
                  <option>Select a category</option>
                  <option>Seeds</option>
                  <option>Fertilizers</option>
                  <option>Pesticides</option>
                  <option>Tools & Equipment</option>
                  <option>Irrigation</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Description *</label>
                <textarea 
                  className="w-full bg-cropsay-dark border border-cropsay-grayDark rounded-lg py-2 px-3 focus:border-cropsay-green focus:ring-1 focus:ring-cropsay-green outline-none transition-all"
                  rows={4}
                  placeholder="Describe your product"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price (रु ) *</label>
                  <input 
                    type="number" 
                    className="w-full bg-cropsay-dark border border-cropsay-grayDark rounded-lg py-2 px-3 focus:border-cropsay-green focus:ring-1 focus:ring-cropsay-green outline-none transition-all"
                    placeholder="0.00" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity Available *</label>
                  <input 
                    type="number" 
                    className="w-full bg-cropsay-dark border border-cropsay-grayDark rounded-lg py-2 px-3 focus:border-cropsay-green focus:ring-1 focus:ring-cropsay-green outline-none transition-all"
                    placeholder="0" 
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <button type="submit" className="primary-button w-full py-3">
                  Create Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {activeTab === 'manage' && (
        <div className="p-4">
          <div className="text-center py-16">
            <div className="flex justify-center">
              <div className="bg-cropsay-darkSecondary p-6 rounded-full">
                <Upload size={48} className="text-cropsay-grayText" />
              </div>
            </div>
            <h3 className="mt-6 text-xl">No Active Listings</h3>
            <p className="text-cropsay-grayText mt-2">You don't have any product listings yet.</p>
            <button className="primary-button mt-6 mx-auto">
              Create Your First Listing
            </button>
          </div>
        </div>
      )}
      
      {activeTab === 'orders' && (
        <div className="p-4">
          <div className="text-center py-16">
            <div className="flex justify-center">
              <div className="bg-cropsay-darkSecondary p-6 rounded-full">
                <CheckCircle size={48} className="text-cropsay-grayText" />
              </div>
            </div>
            <h3 className="mt-6 text-xl">No Orders Yet</h3>
            <p className="text-cropsay-grayText mt-2">You haven't received any orders yet.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellPage;
