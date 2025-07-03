import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, CheckCircle, Trash2, Edit, AlertCircle, Package, MoreVertical, Loader, Info, Image as ImageIcon, X, Truck, Home, ChevronRight, Search, ChevronDown, RefreshCw, User, Download, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  createProduct, 
  fetchSellerProducts, 
  updateProduct, 
  deleteProduct, 
  uploadProductImage,
  ProductFormData 
} from '@/services/productService';
import { getSellerOrders, verifyOrderStatus, fetchAllOrdersDirectly } from '@/services/orderService';
import { updateOrderStatus, batchUpdateOrderStatus, markCODOrdersAsShippedAndPaid } from '@/services/orderService';
import { Product } from '@/data/productData';
import { getCategories, getSubcategories } from '@/data/productData';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

// Type for vendor application form
type VendorApplicationData = {
  fullName: string;
  email: string;
  businessName: string;
  businessAddress: string;
  phoneNumber: string;
  businessType: string;
  description: string;
  website?: string;
  taxId?: string;
  agreedToTerms: boolean;
};

// Status Option component for order status dropdown
type StatusOptionProps = {
  emoji: string;
  status: string;
  description?: string;
  value: string;
  currentStatus: string;
  orderId: string;
  onClick: (orderId: string, status: string) => void;
};

// This component is no longer needed as we're using a popup instead of dropdown
// Keeping the type definition for reference
;

// Type for seller orders
type OrderWithItems = {
  id: string;
  date: string;
  status: string;
  payment_method: string;
  total: number;
  items: any[]; // This would include the product IDs that belong to the seller
  customer_name: string;
  customer_email: string;
  customer_address: string;
  phone: string;
  address: string;
};

const SellPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Check if user is authenticated and has a cropsay.com email domain
  const isVendor = user?.email?.endsWith('@cropsay.com') || false;
  
  // Redirect to login if not authenticated, but only after auth has finished loading
  useEffect(() => {
    // Only redirect if auth loading is complete and user is not available
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, navigate, authLoading]);
  
  // Default to listing tab for creating products
  const [activeTab, setActiveTab] = useState('listing');
  const [loading, setLoading] = useState(false);
  
  // Search, filter and sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date_desc");
  const [openOrderStatusDropdown, setOpenOrderStatusDropdown] = useState<string | null>(null);
  
  // Status update popup state
  const [showStatusUpdatePopup, setShowStatusUpdatePopup] = useState(false);
  const [orderToUpdate, setOrderToUpdate] = useState<OrderWithItems | null>(null);
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenOrderStatusDropdown(null);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Product Form State
  const [productForm, setProductForm] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    category: '',
    subcategory: '',
    brand: '',
    quantity: 0,
    images: []
  });
  
  // File Upload State
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Product Management State
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Orders State
  const [sellerOrders, setSellerOrders] = useState<OrderWithItems[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  
  // Delete confirmation dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  // Order details dialog state
  const [showOrderDetailsDialog, setShowOrderDetailsDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [isUpdatingOrderStatus, setIsUpdatingOrderStatus] = useState(false);
  
  // Analytics modal state
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  
  // Get categories for dropdown
  const categories = getCategories();
  const [subcategories, setSubcategories] = useState<string[]>([]);

  // Handle category change to populate subcategories
  useEffect(() => {
    if (productForm.category) {
      setSubcategories(getSubcategories(productForm.category));
    } else {
      setSubcategories([]);
    }
  }, [productForm.category]);
  
  // Load seller products when tab changes to 'manage'
  useEffect(() => {
    if (isVendor) {
      if (activeTab === 'manage') {
        // Always refresh products when switching to manage tab
        loadSellerProducts();
      } else if (activeTab === 'orders') {
        loadSellerOrders();
      } else if (activeTab === 'listing') {
        // Don't reset the form when switching to listing tab
        // This allows users to navigate to the create listing tab without resetting their form
      }
    }
  }, [activeTab, isVendor]);
  
  // Set up auto-refresh interval for orders
  useEffect(() => {
    if (isVendor && activeTab === 'orders') {
      const interval = setInterval(() => {
        loadSellerOrders();
      }, 60000); // 60 seconds interval
      
      return () => clearInterval(interval);
    }
  }, [activeTab, isVendor]);
  
  // Load products created by the seller
  const loadSellerProducts = async () => {
    if (!user) return;
    
    setIsLoadingProducts(true);
    try {
      const products = await fetchSellerProducts();
      console.log('Loaded seller products:', products); // Debug logging
      setSellerProducts(products);
    } catch (error) {
      console.error('Error loading seller products:', error);
      setErrorMessage('Failed to load your product listings');
    } finally {
      setIsLoadingProducts(false);
    }
  };
  
  // Load orders for the seller's products
  const loadSellerOrders = async () => {
    if (!user) return;
    
    setIsLoadingOrders(true);
    try {
      // Get orders through the main function
      const orders = await getSellerOrders();
      console.log('Loaded seller orders:', orders); // Debug logging
      
      // If we have any updated orders, verify their status directly
      if (orders && orders.length > 0) {
        console.log('Verifying first order status directly from DB...');
        try {
          const verifiedOrder = await verifyOrderStatus(orders[0].id);
          console.log(`Direct DB check for order ${orders[0].id}: status=${verifiedOrder.status}, from API: ${orders[0].status}`);
          
          // If there's a discrepancy, refresh from DB directly
          if (verifiedOrder.status !== orders[0].status) {
            console.warn(`Status mismatch for order ${orders[0].id}! API: ${orders[0].status}, DB: ${verifiedOrder.status}`);
          }
        } catch (verifyErr) {
          console.error('Error verifying order:', verifyErr);
        }
      }
      
      setSellerOrders(orders as OrderWithItems[]);
    } catch (error) {
      console.error('Error loading seller orders:', error);
      setErrorMessage('Failed to load your orders');
    } finally {
      setIsLoadingOrders(false);
    }
  };
  
  // Handle image file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      // Limit to max 5 images total
      const totalImages = selectedFiles.length + filesArray.length;
      if (totalImages > 5) {
        setErrorMessage('Maximum 5 images allowed');
        return;
      }
      
      setSelectedFiles([...selectedFiles, ...filesArray]);
    }
  };
  
  // Remove a selected file
  const removeSelectedFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'price' || name === 'quantity') {
      setProductForm({
        ...productForm,
        [name]: parseFloat(value) || 0
      });
    } else {
      setProductForm({
        ...productForm,
        [name]: value
      });
    }
  };
  
  // Upload images to Supabase storage
  const uploadImages = async (): Promise<string[]> => {
    if (selectedFiles.length === 0) return [];
    
    setIsUploading(true);
    const imageUrls: string[] = [];
    
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const url = await uploadProductImage(file, file.name);
        if (url) {
          imageUrls.push(url);
        }
        // Update progress
        setUploadProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
      }
      return imageUrls;
    } catch (error) {
      console.error('Error uploading images:', error);
      setErrorMessage('Failed to upload images');
      return [];
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  // Submit the product form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!productForm.name || !productForm.description || !productForm.category || productForm.price <= 0 || productForm.quantity <= 0) {
      setErrorMessage('Please fill in all required fields');
      return;
    }
    
    // Clear previous messages
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);
    
    try {
      // Upload images first
      const imageUrls = editingProduct?.images || [];
      const newImageUrls = await uploadImages();
      
      // Combine existing and new images
      const combinedImageUrls = [...imageUrls, ...newImageUrls];
      
      const productData: ProductFormData = {
        ...productForm,
        images: combinedImageUrls
      };
      
      let result;
      if (editingProduct) {
        // Update existing product
        result = await updateProduct(editingProduct.id, productData);
        if (result) {
          setSuccessMessage('Product updated successfully!');
          // Refresh products list
          loadSellerProducts();
          // Reset form and switch to manage tab
          resetForm(true);
        }
      } else {
        // Create new product
        result = await createProduct(productData);
        if (result) {
          // Load products first to ensure they're available in the manage tab
          await loadSellerProducts();
          setSuccessMessage('Product created successfully!');
          
          // Reset form but stay on the current tab
          // This allows users to create another product if they want
          resetForm(false);
        }
      }
      
      if (!result) {
        setErrorMessage('Error saving product. Please try again.');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      setErrorMessage('Failed to save product');
    } finally {
      setLoading(false);
    }
  };
  
  // Reset form and state
  const resetForm = (switchTab = true) => {
    setProductForm({
      name: '',
      description: '',
      price: 0,
      category: '',
      subcategory: '',
      brand: '',
      quantity: 0,
      images: []
    });
    setSelectedFiles([]);
    setEditingProduct(null);
    
    // Only switch tabs if parameter is true (default)
    if (switchTab) {
      setActiveTab('manage'); // Switch to manage tab after successful creation
    }
  };
  
  // Handle edit product button
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      subcategory: product.subcategory,
      brand: product.brand,
      quantity: product.quantity || 0,
      images: product.images || []
    });
    setActiveTab('listing');
  };
  
  // Handle delete product button
  const handleDeleteProduct = async (product: Product) => {
    setProductToDelete(product);
    setShowDeleteDialog(true);
  };

  // Handle order details view
  const handleViewOrderDetails = (order: OrderWithItems) => {
    console.log('Order details:', order);
    console.log('Customer name:', order.customer_name);
    console.log('Customer email:', order.customer_email);
    console.log('Customer address:', order.customer_address);
    console.log('Phone:', order.phone);
    console.log('Address:', order.address);
    setSelectedOrder(order);
    setShowOrderDetailsDialog(true);
  };

  // Confirm delete product
  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    
    setIsLoadingProducts(true);
    setShowDeleteDialog(false);
    
    try {
      const success = await deleteProduct(productToDelete.id);
      if (success) {
        // Refresh products list
        loadSellerProducts();
        setSuccessMessage('Product deleted successfully');
      } else {
        setErrorMessage('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setErrorMessage('Failed to delete product');
    } finally {
      setIsLoadingProducts(false);
      setProductToDelete(null);
    }
  };

  // Cancel delete product
  const cancelDeleteProduct = () => {
    setShowDeleteDialog(false);
    setProductToDelete(null);
  };
  
  // Display notification messages
  const renderNotification = () => {
    if (errorMessage) {
      return (
        <div className="bg-red-900 text-white p-3 rounded-md mb-4 flex items-center">
          <AlertCircle size={18} className="mr-2" />
          {errorMessage}
          <button 
            className="ml-auto text-white" 
            onClick={() => setErrorMessage('')}
          >
            <X size={16} />
          </button>
        </div>
      );
    }
    
    if (successMessage) {
      return (
        <div className="bg-green-900 text-white p-3 rounded-md mb-4 flex items-center">
          <CheckCircle size={18} className="mr-2" />
          {successMessage}
          <button 
            className="ml-auto text-white" 
            onClick={() => setSuccessMessage('')}
          >
            <X size={16} />
          </button>
        </div>
      );
    }
    
    return null;
  };

  // Delete confirmation dialog
  const renderDeleteDialog = () => {
    if (!showDeleteDialog || !productToDelete) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={cn(
          "bg-cropsay-darkSecondary rounded-lg border border-cropsay-grayDark shadow-xl",
          isMobile ? "w-full max-w-sm" : "w-full max-w-md"
        )}>
          <div className={cn("p-6", isMobile ? "p-4" : "p-6")}>
            
            
            
            
            
          </div>
        </div>
      </div>
    );
  };

  // Vendor Application Form Component
  const VendorApplicationForm = () => {
    const [vendorForm, setVendorForm] = useState<VendorApplicationData>({
      fullName: user?.user_metadata?.full_name || '',
      email: user?.email || '',
      businessName: '',
      businessAddress: '',
      phoneNumber: user?.user_metadata?.phone || '',
      businessType: '',
      description: '',
      website: '',
      taxId: '',
      agreedToTerms: false
    });
    
    const [submitting, setSubmitting] = useState(false);
    const [applicationSubmitted, setApplicationSubmitted] = useState(false);
    
    const handleVendorInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      
      if (type === 'checkbox') {
        const checkbox = e.target as HTMLInputElement;
        setVendorForm(prev => ({
          ...prev,
          [name]: checkbox.checked
        }));
      } else {
        setVendorForm(prev => ({
          ...prev,
          [name]: value
        }));
      }
    };
    
    const handleVendorSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      // Validation
      if (!vendorForm.fullName || !vendorForm.email || !vendorForm.businessName || 
          !vendorForm.businessAddress || !vendorForm.phoneNumber || 
          !vendorForm.businessType || !vendorForm.description || !vendorForm.agreedToTerms) {
        setErrorMessage('Please fill in all required fields');
        return;
      }
      
      setErrorMessage('');
      setSubmitting(true);
      
      try {
        // Here you would implement the API call to submit the vendor application
        // For now we'll just simulate a successful submission
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setSuccessMessage('Your vendor application has been submitted successfully! We will review it and get back to you soon.');
        setApplicationSubmitted(true);
      } catch (error) {
        console.error('Error submitting vendor application:', error);
        setErrorMessage('Failed to submit application. Please try again later.');
      } finally {
        setSubmitting(false);
      }
    };
    
    if (applicationSubmitted) {
      return (
        <div className="max-w-2xl mx-auto text-center py-8">
          <div className="bg-cropsay-darkSecondary rounded-lg p-6">
            <div className="w-16 h-16 bg-green-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Application Submitted!</h2>
            <p className="text-cropsay-grayText mb-6">
              Thank you for applying to become a vendor on CropsayAI. Our team will review your application and contact you soon.
            </p>
            <div className="bg-cropsay-dark/50 rounded-lg p-4 mb-4">
              <h3 className="font-medium mb-2">What happens next?</h3>
              <ol className="list-decimal list-inside text-left text-sm space-y-2">
                <li>Our team will review your application (usually within 2-3 business days)</li>
                <li>We may contact you for additional information if needed</li>
                <li>Once approved, you'll receive vendor credentials to access the seller platform</li>
                <li>You can then start listing your products and managing your store</li>
              </ol>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="max-w-2xl mx-auto">
        {renderNotification()}
        
        <div className="bg-cropsay-darkSecondary rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Become a Vendor</h2>
          <p className="text-cropsay-grayText mb-6">
            Join our marketplace to reach more customers and grow your agricultural business.
            Complete this form to apply for a vendor account.
          </p>
          
          <form onSubmit={handleVendorSubmit}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={vendorForm.fullName}
                    onChange={handleVendorInputChange}
                    className="bg-cropsay-dark border border-cropsay-grayDark rounded-md w-full py-2 px-3 text-sm"
                    required
                  />
                  {user?.user_metadata?.full_name && <p className="text-xs text-cropsay-grayText mt-1">Auto-filled from your profile</p>}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={vendorForm.email}
                    onChange={handleVendorInputChange}
                    className="bg-cropsay-dark border border-cropsay-grayDark rounded-md w-full py-2 px-3 text-sm"
                    required
                    readOnly
                  />
                  <p className="text-xs text-cropsay-grayText mt-1">Email address from your account will be used</p>
                </div>
              </div>
              
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium mb-1">Business Name *</label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  value={vendorForm.businessName}
                  onChange={handleVendorInputChange}
                  className="bg-cropsay-dark border border-cropsay-grayDark rounded-md w-full py-2 px-3 text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="businessAddress" className="block text-sm font-medium mb-1">Business Address *</label>
                <input
                  type="text"
                  id="businessAddress"
                  name="businessAddress"
                  value={vendorForm.businessAddress}
                  onChange={handleVendorInputChange}
                  className="bg-cropsay-dark border border-cropsay-grayDark rounded-md w-full py-2 px-3 text-sm"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={vendorForm.phoneNumber}
                    onChange={handleVendorInputChange}
                    className="bg-cropsay-dark border border-cropsay-grayDark rounded-md w-full py-2 px-3 text-sm"
                    required
                  />
                  {user?.user_metadata?.phone && <p className="text-xs text-cropsay-grayText mt-1">Auto-filled from your profile</p>}
                </div>
                
                <div>
                  <label htmlFor="businessType" className="block text-sm font-medium mb-1">Business Type *</label>
                  <select
                    id="businessType"
                    name="businessType"
                    value={vendorForm.businessType}
                    onChange={handleVendorInputChange}
                    className="bg-cropsay-dark border border-cropsay-grayDark rounded-md w-full py-2 px-3 text-sm"
                    required
                  >
                    <option value="">Select business type</option>
                    <option value="farm">Farm</option>
                    <option value="agricultural_supplier">Agricultural Supplier</option>
                    <option value="seeds_nursery">Seeds & Nursery</option>
                    <option value="equipment_dealer">Equipment Dealer</option>
                    <option value="organic_producer">Organic Producer</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">Business Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={vendorForm.description}
                  onChange={handleVendorInputChange}
                  rows={4}
                  className="bg-cropsay-dark border border-cropsay-grayDark rounded-md w-full py-2 px-3 text-sm"
                  required
                  placeholder="Tell us about your business, products, and experience..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="website" className="block text-sm font-medium mb-1">Website (Optional)</label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={vendorForm.website}
                    onChange={handleVendorInputChange}
                    className="bg-cropsay-dark border border-cropsay-grayDark rounded-md w-full py-2 px-3 text-sm"
                    placeholder="https://yourbusiness.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="taxId" className="block text-sm font-medium mb-1">Tax ID/Business Registration (Optional)</label>
                  <input
                    type="text"
                    id="taxId"
                    name="taxId"
                    value={vendorForm.taxId}
                    onChange={handleVendorInputChange}
                    className="bg-cropsay-dark border border-cropsay-grayDark rounded-md w-full py-2 px-3 text-sm"
                  />
                </div>
              </div>
              
              <div className="flex items-start mt-4">
                <div className="flex items-center h-5">
                  <input
                    id="agreedToTerms"
                    name="agreedToTerms"
                    type="checkbox"
                    checked={vendorForm.agreedToTerms}
                    onChange={handleVendorInputChange}
                    className="w-4 h-4 border border-cropsay-grayDark rounded bg-cropsay-dark focus:ring-cropsay-green"
                    required
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="agreedToTerms" className="text-cropsay-grayText">
                    I agree to the <a href="#" className="text-cropsay-green hover:underline">Terms and Conditions</a> and <a href="#" className="text-cropsay-green hover:underline">Vendor Policies</a> *
                  </label>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                type="submit"
                disabled={submitting}
                className={cn(
                  "w-full py-3 px-4 bg-gradient-to-r from-cropsay-green to-green-500 text-white rounded-md font-medium transition-all",
                  submitting ? "opacity-70 cursor-not-allowed" : "hover:shadow-lg"
                )}
              >
                {submitting ? (
                  <div className="flex items-center justify-center">
                    <Loader size={18} className="animate-spin mr-2" />
                    Submitting Application...
                  </div>
                ) : "Submit Application"}
              </button>
            </div>
          </form>
        </div>
        
        <div className="bg-cropsay-dark rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Benefits of Becoming a Vendor</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-cropsay-green/20 rounded-full flex items-center justify-center mr-3">
                <CheckCircle size={16} className="text-cropsay-green" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Expanded Reach</h4>
                <p className="text-sm text-cropsay-grayText">Connect with farmers and agricultural professionals across the region</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-cropsay-green/20 rounded-full flex items-center justify-center mr-3">
                <CheckCircle size={16} className="text-cropsay-green" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Easy Management</h4>
                <p className="text-sm text-cropsay-grayText">Powerful tools to manage your listings, inventory and orders</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-cropsay-green/20 rounded-full flex items-center justify-center mr-3">
                <CheckCircle size={16} className="text-cropsay-green" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Secure Payments</h4>
                <p className="text-sm text-cropsay-grayText">Reliable payment processing with protection for vendors</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-cropsay-green/20 rounded-full flex items-center justify-center mr-3">
                <CheckCircle size={16} className="text-cropsay-green" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Analytics & Insights</h4>
                <p className="text-sm text-cropsay-grayText">Gain valuable data on your sales and customer behavior</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Product listing form
  const renderCreateListingForm = () => {
    return (
      <div className={cn("max-w-2xl mx-auto", isMobile ? "p-2" : "p-4")}>
        {renderNotification()}
        
        {/* Success message with navigation option */}
        {successMessage && (
          <div className="flex flex-wrap items-center justify-between bg-green-900/50 border border-green-700 p-3 rounded-md mb-4">
            <div className="flex items-center">
              <CheckCircle size={20} className="mr-2 text-green-500" />
              <span>Product successfully {editingProduct ? 'updated' : 'created'}!</span>
            </div>
            <div className="mt-2 sm:mt-0">
              <button 
                className="text-sm bg-cropsay-green px-3 py-1.5 rounded-md hover:bg-green-600 transition-colors flex items-center"
                onClick={() => {
                  setActiveTab('manage');
                  // Force reload products when switching to manage tab
                  setTimeout(() => loadSellerProducts(), 100);
                }}
              >
                <Package size={16} className="mr-1.5" />
                View All Products
              </button>
            </div>
          </div>
        )}
        
        <div className={cn("bg-cropsay-darkSecondary rounded-lg", isMobile ? "p-4" : "p-6")}>
          <h2 className={cn("font-medium mb-6", isMobile ? "text-lg" : "text-xl")}>
            {editingProduct ? 'Update Product Listing' : 'Create a Product Listing'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Product Images</label>
              
              {/* Preview selected images */}
              {(selectedFiles.length > 0 || (editingProduct?.images && editingProduct.images.length > 0)) && (
                <div className={cn("grid gap-3 mb-3", isMobile ? "grid-cols-2" : "grid-cols-3")}>
                  {/* Show existing images from editing product */}
                  {editingProduct?.images?.map((imageUrl, index) => (
                    <div key={`existing-${index}`} className="relative aspect-square bg-cropsay-grayDark rounded-md overflow-hidden">
                      <img 
                        src={imageUrl} 
                        alt={`Product image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  
                  {/* Show newly selected files */}
                  {selectedFiles.map((file, index) => (
                    <div key={`new-${index}`} className="relative aspect-square bg-cropsay-grayDark rounded-md overflow-hidden">
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt={`Upload preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeSelectedFile(index)}
                        className="absolute top-1 right-1 bg-cropsay-dark bg-opacity-70 p-1 rounded-full"
                      >
                        <Trash2 size={16} className="text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Upload progress indicator */}
              {isUploading && (
                <div className="mb-3">
                  <div className="w-full bg-cropsay-grayDark rounded-full h-2 mb-1">
                    <div 
                      className="bg-cropsay-green h-2 rounded-full" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-cropsay-grayText">Uploading images... {uploadProgress}%</p>
                </div>
              )}
              
              <div className={cn("grid gap-3", isMobile ? "grid-cols-2" : "grid-cols-3")}>
                {/* Camera placeholder - could be used for camera integration */}
                <div 
                  className={cn(
                    "aspect-square bg-cropsay-grayDark rounded-md flex flex-col items-center justify-center cursor-pointer transition-all duration-200 border-2 border-transparent hover:border-cropsay-green/30 hover:bg-cropsay-grayMedium active:scale-95",
                    isMobile ? "min-h-[80px]" : ""
                  )}
                  onClick={triggerFileInput}
                >
                  <Camera size={isMobile ? 20 : 24} className="text-cropsay-grayText mb-2" />
                  <span className={cn("text-cropsay-grayText", isMobile ? "text-xs" : "text-xs")}>Add Photo</span>
                </div>
                
                {/* File upload button */}
                <div 
                  className={cn(
                    "aspect-square bg-cropsay-grayDark rounded-md flex flex-col items-center justify-center cursor-pointer transition-all duration-200 border-2 border-transparent hover:border-cropsay-green/30 hover:bg-cropsay-grayMedium active:scale-95",
                    isMobile ? "min-h-[80px]" : ""
                  )}
                  onClick={triggerFileInput}
                >
                  <Upload size={isMobile ? 20 : 24} className="text-cropsay-grayText mb-2" />
                  <span className={cn("text-cropsay-grayText", isMobile ? "text-xs" : "text-xs")}>Upload</span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                  />
                </div>
              </div>
              <p className="text-xs text-cropsay-grayText mt-2">
                Upload up to 5 images. First image will be used as the main product image.
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Product Name *</label>
              <input 
                type="text" 
                name="name"
                value={productForm.name}
                onChange={handleInputChange}
                className={cn(
                  "w-full bg-cropsay-dark border border-cropsay-grayDark rounded-lg focus:border-cropsay-green focus:ring-1 focus:ring-cropsay-green outline-none transition-all",
                  isMobile ? "py-3 px-4 text-base" : "py-2 px-3"
                )}
                placeholder="Enter product name" 
                required
              />
            </div>
            
            <div className={cn("grid gap-4 mb-4", isMobile ? "grid-cols-1" : "grid-cols-2")}>
              <div>
                <label className="block text-sm font-medium mb-1">Category *</label>
                <select 
                  name="category"
                  value={productForm.category}
                  onChange={handleInputChange}
                  className={cn(
                    "w-full bg-cropsay-dark border border-cropsay-grayDark rounded-lg focus:border-cropsay-green focus:ring-1 focus:ring-cropsay-green outline-none transition-all",
                    isMobile ? "py-3 px-4 text-base" : "py-2 px-3"
                  )}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Subcategory</label>
                <select 
                  name="subcategory"
                  value={productForm.subcategory}
                  onChange={handleInputChange}
                  className={cn(
                    "w-full bg-cropsay-dark border border-cropsay-grayDark rounded-lg focus:border-cropsay-green focus:ring-1 focus:ring-cropsay-green outline-none transition-all",
                    isMobile ? "py-3 px-4 text-base" : "py-2 px-3"
                  )}
                >
                  <option value="">Select a subcategory</option>
                  {subcategories.map((subcategory) => (
                    <option key={subcategory} value={subcategory}>{subcategory}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Brand *</label>
              <input 
                type="text" 
                name="brand"
                value={productForm.brand}
                onChange={handleInputChange}
                className={cn(
                  "w-full bg-cropsay-dark border border-cropsay-grayDark rounded-lg focus:border-cropsay-green focus:ring-1 focus:ring-cropsay-green outline-none transition-all",
                  isMobile ? "py-3 px-4 text-base" : "py-2 px-3"
                )}
                placeholder="Enter brand name" 
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Description *</label>
              <textarea 
                name="description"
                value={productForm.description}
                onChange={handleInputChange}
                className={cn(
                  "w-full bg-cropsay-dark border border-cropsay-grayDark rounded-lg focus:border-cropsay-green focus:ring-1 focus:ring-cropsay-green outline-none transition-all resize-none",
                  isMobile ? "py-3 px-4 text-base" : "py-2 px-3"
                )}
                rows={isMobile ? 3 : 4}
                placeholder="Describe your product"
                required
              />
            </div>
            
            <div className={cn("grid gap-4 mb-4", isMobile ? "grid-cols-1" : "grid-cols-2")}>
              <div>
                <label className="block text-sm font-medium mb-1">Price (रू ) *</label>
                <input 
                  type="number" 
                  name="price"
                  value={productForm.price || ''}
                  onChange={handleInputChange}
                  className={cn(
                    "w-full bg-cropsay-dark border border-cropsay-grayDark rounded-lg focus:border-cropsay-green focus:ring-1 focus:ring-cropsay-green outline-none transition-all",
                    isMobile ? "py-3 px-4 text-base" : "py-2 px-3"
                  )}
                  placeholder="0.00" 
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quantity Available *</label>
                <input 
                  type="number" 
                  name="quantity"
                  value={productForm.quantity || ''}
                  onChange={handleInputChange}
                  className={cn(
                    "w-full bg-cropsay-dark border border-cropsay-grayDark rounded-lg focus:border-cropsay-green focus:ring-1 focus:ring-cropsay-green outline-none transition-all",
                    isMobile ? "py-3 px-4 text-base" : "py-2 px-3"
                  )}
                  placeholder="0" 
                  min="1"
                  required
                />
              </div>
            </div>
            
            <div className="mt-6">
              <button 
                type="submit" 
                className={cn(
                  "primary-button flex justify-center items-center transition-all duration-200",
                  isMobile ? "w-full py-3 text-base" : "w-full py-3"
                )}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader size={20} className="animate-spin mr-2" />
                    {editingProduct ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editingProduct ? 'Update Listing' : 'Create Listing'
                )}
              </button>
              
              {editingProduct && (              <button 
                type="button"
                onClick={() => resetForm(true)}
                className={cn(
                  "w-full mt-3 text-cropsay-grayText hover:text-white transition-colors rounded-lg border border-cropsay-grayDark hover:border-cropsay-grayMedium",
                  isMobile ? "py-2.5 text-sm" : "py-2"
                )}
              >
                Cancel Editing
              </button>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  // Product management responsive layout
  const renderManageListings = () => {
    return (
      <div className={cn(isMobile ? "p-2" : "p-4")}>
        {renderNotification()}
        
        {isLoadingProducts ? (
          <div className="flex justify-center py-16">
            <Loader size={36} className="animate-spin text-cropsay-green" />
          </div>
        ) : sellerProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="flex justify-center">
              
            </div>
            <h3 className={cn("mt-6", isMobile ? "text-lg" : "text-xl")}>No Active Listings</h3>
            <p className="text-cropsay-grayText mt-2">You don't have any product listings yet.</p>
            <button 
              className="primary-button mt-6 mx-auto"
              onClick={() => {
                // Reset the form first before changing tabs to ensure clean state
                setProductForm({
                  name: '',
                  description: '',
                  price: 0,
                  category: '',
                  subcategory: '',
                  brand: '',
                  quantity: 0,
                  images: []
                });
                setSelectedFiles([]);
                setEditingProduct(null);
                // Then switch to listing tab
                setActiveTab('listing');
              }}
            >
              Create Your First Listing
            </button>
          </div>
        ) : (
          <div>
            <div className={cn("mb-4 items-center", isMobile ? "flex flex-col space-y-3" : "flex justify-between")}>
              <div>
                <h3 className={cn("text-lg font-medium", isMobile ? "text-center mb-2" : "")}>Your Products</h3>
              </div>
              <div>
                <button
                  className="flex items-center bg-cropsay-green hover:bg-green-600 text-white px-3 py-2 rounded-md transition-colors"
                  onClick={() => {
                    setProductForm({
                      name: '',
                      description: '',
                      price: 0,
                      category: '',
                      subcategory: '',
                      brand: '',
                      quantity: 0,
                      images: []
                    });
                    setSelectedFiles([]);
                    setEditingProduct(null);
                    setActiveTab('listing');
                  }}
                >
                  <Upload size={18} className="mr-2" />
                  Add New Product
                </button>
              </div>
            </div>
            
            {/* Mobile Card Layout */}
            {isMobile ? (
              <div className="space-y-3">
                {sellerProducts.map((product) => (
                  <div key={product.id} className="bg-cropsay-darkSecondary p-4 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-white">{product.name}</h3>
                      <div className="flex space-x-2">
                        <button onClick={() => handleEditProduct(product)} className="p-1.5 bg-cropsay-dark rounded-full hover:bg-cropsay-grayDark">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDeleteProduct(product)} className="p-1.5 bg-cropsay-dark rounded-full hover:bg-red-900/50">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-16 h-16 bg-cropsay-dark rounded flex-shrink-0 overflow-hidden">
                        {product.images && product.images[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={24} className="text-cropsay-grayText" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div className="text-cropsay-green font-medium">₹{product.price.toFixed(2)}</div>
                          <div className="text-cropsay-grayText text-sm">Stock: {product.quantity}</div>
                        </div>
                        <div className="mt-1 text-xs text-cropsay-grayText truncate">{product.category} &gt; {product.subcategory}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Desktop Table Layout */
              <div className="bg-cropsay-darkSecondary rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-cropsay-grayText border-b border-cropsay-grayDark bg-cropsay-dark">
                      <th className="py-3 px-4 text-left">Product</th>
                      <th className="py-3 px-4 text-left">Category</th>
                      <th className="py-3 px-4 text-left">Price</th>
                      <th className="py-3 px-4 text-left">Stock</th>
                      <th className="py-3 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sellerProducts.map((product) => (
                      <tr key={product.id} className="border-b border-cropsay-grayDark">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-cropsay-dark rounded mr-3 overflow-hidden">
                              {product.images && product.images[0] ? (
                                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package size={18} className="text-cropsay-grayText" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-white">{product.name}</div>
                              <div className="text-xs text-cropsay-grayText">{product.brand || 'No brand'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div className="text-cropsay-grayText">{product.category}</div>
                          <div className="text-xs">{product.subcategory}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-cropsay-green font-medium">₹{product.price.toFixed(2)}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">{product.quantity} units</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-3">
                            <button onClick={() => handleEditProduct(product)} className="p-1.5 bg-cropsay-dark rounded-full hover:bg-cropsay-grayDark">
                              <Edit size={14} />
                            </button>
                            <button onClick={() => handleDeleteProduct(product)} className="p-1.5 bg-cropsay-dark rounded-full hover:bg-red-900/50">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  
  // Orders management with responsive design
  const renderOrders = () => {
    // Filter orders based on search term and status filter
    const filteredOrders = sellerOrders.filter(order => {
      // Filter by search term (id, customer name, or customer email)
      const matchesSearch = searchQuery === '' || 
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.customer_name && order.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (order.customer_email && order.customer_email.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Filter by status
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      
      // Filter by date
      let matchesDate = true;
      if (dateFilter === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const orderDate = new Date(order.date);
        matchesDate = orderDate >= today;
      } else if (dateFilter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const orderDate = new Date(order.date);
        matchesDate = orderDate >= weekAgo;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        const orderDate = new Date(order.date);
        matchesDate = orderDate >= monthAgo;
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    });
    
    // Apply sorting
    const sortedOrders = [...filteredOrders].sort((a, b) => {
      if (sortBy === 'date_desc') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortBy === 'date_asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'total_desc') {
        return b.total - a.total;
      } else if (sortBy === 'total_asc') {
        return a.total - b.total;
      }
      return 0;
    });
    
    return (
      <div className={cn(isMobile ? "p-2" : "p-4")}>
        {renderNotification()}
        
        <div className="bg-cropsay-darkSecondary rounded-lg overflow-hidden">
          <div className="p-4 border-b border-cropsay-grayDark">
            <div className={cn("mb-4", isMobile ? "space-y-3" : "flex items-center justify-between gap-4")}>
              {/* Search */}
              <div className={cn("relative", isMobile ? "w-full" : "w-64")}>
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cropsay-grayText" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 bg-cropsay-dark border border-cropsay-grayDark rounded-md w-full text-sm focus:border-cropsay-green focus:ring-1 focus:ring-cropsay-green outline-none transition-colors"
                />
              </div>
              
              <div className={cn(isMobile ? "grid grid-cols-2 gap-2" : "flex items-center gap-2")}>
                {/* Date Filter */}
                <div className="relative">
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="pl-3 pr-8 py-2 bg-cropsay-dark border border-cropsay-grayDark rounded-md w-full text-sm appearance-none focus:border-cropsay-green focus:ring-1 focus:ring-cropsay-green outline-none transition-colors"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cropsay-grayText pointer-events-none" />
                </div>
                
                {/* Status Filter */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-3 pr-8 py-2 bg-cropsay-dark border border-cropsay-grayDark rounded-md w-full text-sm appearance-none focus:border-cropsay-green focus:ring-1 focus:ring-cropsay-green outline-none transition-colors"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cropsay-grayText pointer-events-none" />
                </div>
                
                {/* Sort By */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="pl-3 pr-8 py-2 bg-cropsay-dark border border-cropsay-grayDark rounded-md w-full text-sm appearance-none focus:border-cropsay-green focus:ring-1 focus:ring-cropsay-green outline-none transition-colors"
                  >
                    <option value="date_desc">Newest First</option>
                    <option value="date_asc">Oldest First</option>
                    <option value="total_desc">Highest Amount</option>
                    <option value="total_asc">Lowest Amount</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cropsay-grayText pointer-events-none" />
                </div>
                
                {/* Download Orders Button */}
                <button
                  onClick={handleDownloadOrders}
                  className={cn(
                    "text-white bg-cropsay-dark border border-cropsay-grayDark hover:bg-cropsay-grayDark rounded-md transition-colors flex items-center justify-center",
                    isMobile ? "py-2 w-full col-span-2" : "px-3 py-2"
                  )}
                  title="Download orders data as CSV"
                >
                  <Download size={14} className={cn("text-cropsay-grayText", isMobile ? "mr-2" : "")} />
                  <span className={isMobile ? "" : "sr-only"}>Download Orders</span>
                </button>
                
                {/* Action Buttons */}
                <div className={cn("flex gap-2", isMobile ? "col-span-2" : "")}>
                  {/* Refresh Button */}
                  <button
                    onClick={() => loadSellerOrders()}
                    className={cn(
                      "text-white bg-cropsay-dark border border-cropsay-grayDark hover:bg-cropsay-grayDark rounded-md transition-colors flex items-center justify-center",
                      isMobile ? "flex-1 py-2" : "px-3 py-2"
                    )}
                    title="Refresh order data"
                  >
                    <RefreshCw size={14} className={cn("text-cropsay-grayText", isMobile ? "mr-2" : "")} />
                    <span className={isMobile ? "" : "sr-only"}>Refresh</span>
                  </button>
                  
                  {/* Analytics Button */}
                  <button
                    onClick={handleShowAnalytics}
                    className={cn(
                      "text-white bg-cropsay-darkSecondary border border-cropsay-green hover:bg-cropsay-grayDark rounded-md transition-colors flex items-center justify-center",
                      isMobile ? "flex-1 py-2" : "px-3 py-2"
                    )}
                    title="View order analytics"
                  >
                    <BarChart3 size={14} className={cn("text-cropsay-green", isMobile ? "mr-2" : "")} />
                    <span className={isMobile ? "" : "sr-only"}>Analytics</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="text-xs text-cropsay-grayText">
              Showing {sortedOrders.length} {sortedOrders.length === 1 ? 'order' : 'orders'}
            </div>
          </div>
          
          {isLoadingOrders ? (
            <div className="flex justify-center py-16">
              <Loader size={36} className="animate-spin text-cropsay-green" />
            </div>
          ) : sortedOrders.length === 0 ? (
            <div className="text-center py-16">
              <h3 className={cn("mt-6", isMobile ? "text-lg" : "text-xl")}>No Orders Found</h3>
              <p className="text-cropsay-grayText mt-2">No orders match your current filters</p>
            </div>
          ) : (
            <div>
              {/* Mobile Card Layout */}
              {isMobile ? (
                <div className="p-2 space-y-3">
                  {sortedOrders.map((order) => (
                    <div 
                      key={order.id}
                      className="bg-cropsay-dark p-3 rounded-lg border border-cropsay-grayDark"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-xs text-cropsay-grayText">Order ID</p>
                          <p className="text-sm font-medium">#{order.id.substring(0, 8)}</p>
                        </div>
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          order.status === 'pending' ? "bg-yellow-900/30 text-yellow-400" :
                          order.status === 'processing' ? "bg-blue-900/30 text-blue-400" :
                          order.status === 'shipped' ? "bg-indigo-900/30 text-indigo-400" :
                          order.status === 'delivered' ? "bg-green-900/30 text-green-400" :
                          order.status === 'cancelled' ? "bg-red-900/30 text-red-400" :
                          "bg-gray-900/30 text-gray-400"
                        )}>
                          {order.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                        <div>
                          <p className="text-cropsay-grayText">Date</p>
                          <p>{new Date(order.date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-cropsay-grayText">Customer</p>
                          <p className="truncate">{order.customer_name || 'Anonymous'}</p>
                        </div>
                        <div>
                          <p className="text-cropsay-grayText">Items</p>
                          <p>{order.items?.length || 0}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-cropsay-grayText">Total</p>
                          <p className="text-cropsay-green font-medium">रू{order.total?.toFixed(2)}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <button 
                          onClick={() => {
                            setOrderToUpdate(order);
                            setShowStatusUpdatePopup(true);
                          }}
                          className="text-xs bg-cropsay-darkSecondary px-3 py-1.5 rounded border border-cropsay-grayDark"
                        >
                          Update Status
                        </button>
                        <button
                          onClick={() => handleViewOrderDetails(order)}
                          className="text-xs bg-cropsay-green/20 text-cropsay-green px-3 py-1.5 rounded border border-cropsay-green/30"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-cropsay-dark">
                        <th className="py-3 px-4 text-left text-xs font-medium text-cropsay-grayText">Order ID</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-cropsay-grayText">Date</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-cropsay-grayText">Customer</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-cropsay-grayText">Items</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-cropsay-grayText">Total</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-cropsay-grayText">Status</th>
                        <th className="py-3 px-4 text-xs font-medium text-cropsay-grayText">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cropsay-grayDark">
                      {sortedOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-cropsay-grayDark/20">
                          <td className="py-3 px-4 text-sm">#{order.id.substring(0, 8)}</td>
                          <td className="py-3 px-4 text-sm">{new Date(order.date).toLocaleDateString()}</td>
                          <td className="py-3 px-4 text-sm">{order.customer_name}</td>
                          <td className="py-3 px-4 text-sm">{order.items?.length || 0} items</td>
                          <td className="py-3 px-4 text-sm">रू {order.total?.toFixed(2)}</td>
                          <td className="py-3 px-4 text-sm">
                            <div className="flex items-center">
                              <span className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium mr-2",
                                order.status === 'pending' ? "bg-yellow-900/30 text-yellow-400" :
                                order.status === 'processing' ? "bg-blue-900/30 text-blue-400" :
                                order.status === 'shipped' ? "bg-indigo-900/30 text-indigo-400" :
                                order.status === 'delivered' ? "bg-green-900/30 text-green-400" :
                                order.status === 'cancelled' ? "bg-red-900/30 text-red-400" :
                                "bg-gray-900/30 text-gray-400"
                              )}>
                                {order.status}
                              </span>
                              <button 
                                className="text-xs text-cropsay-grayText hover:text-white bg-cropsay-dark px-2 py-1 rounded-md"
                                onClick={() => {
                                  setOrderToUpdate(order);
                                  setShowStatusUpdatePopup(true);
                                }}
                              >
                                Update
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <button 
                              className="text-cropsay-green hover:text-green-400 transition-colors"
                              onClick={() => handleViewOrderDetails(order)}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
        
        {renderOrderDetailsDialog()}
        
        {/* Analytics Modal */}
        {renderAnalyticsModal()}
        
        {/* Status Update Popup */}
        {showStatusUpdatePopup && orderToUpdate && (
          <StatusUpdatePopup 
            isOpen={showStatusUpdatePopup}
            onClose={() => setShowStatusUpdatePopup(false)}
            orderId={orderToUpdate.id}
            currentStatus={orderToUpdate.status}
            onStatusUpdate={(orderId, newStatus) => handleUpdateOrderStatus(orderId, newStatus)}
          />
        )}
      </div>
    );
  };
  
  // Order details dialog
  const renderOrderDetailsDialog = () => {
    if (!showOrderDetailsDialog || !selectedOrder) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div 
          className={cn(
            "bg-cropsay-dark rounded-lg shadow-xl overflow-hidden flex flex-col",
            isMobile 
              ? "w-full max-w-[95%] max-h-[80vh]" 
              : "w-full max-w-3xl max-h-[85vh]"
          )}
        >
          {/* Header */}
          <div className="bg-cropsay-darkSecondary p-3 sticky top-0 z-10 flex justify-between items-center border-b border-cropsay-grayDark">
            <div className="flex items-center overflow-hidden max-w-[70%]">
              <h3 className={cn("font-semibold text-cropsay-green truncate", isMobile ? "text-sm" : "text-lg")}>
                Order #{selectedOrder.id}
              </h3>
              <StatusBadge status={selectedOrder.status} className="ml-2 shrink-0" />
            </div>
            <div className="flex space-x-2">
              <button 
                className="p-1 rounded-full hover:bg-cropsay-grayDark"
                onClick={() => loadSellerOrders()}
                title="Refresh order data"
              >
                <RefreshCw size={18} />
              </button>
              <button 
                className="p-1 rounded-full hover:bg-cropsay-grayDark"
                onClick={() => setShowOrderDetailsDialog(false)}
                title="Close dialog"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          
          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            {isMobile ? (
              // Mobile-optimized layout
              <div className="p-3">
                {/* Summary Section - Always visible */}
                <div className="bg-cropsay-darkSecondary rounded-lg p-3 mb-3">
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="flex flex-col">
                      <p className="text-xs text-cropsay-grayLight">Date</p>
                      <p className="text-sm">{new Date(selectedOrder.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="text-xs text-cropsay-grayLight">Customer</p>
                      <p className="text-sm truncate">{selectedOrder.customer_name || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm font-medium mr-1">Total:</span>
                      <span className="text-sm font-bold">Rs. {selectedOrder.total?.toFixed(2) || '0.00'}</span>
                    </div>
                    <button 
                      className="text-xs bg-cropsay-green text-cropsay-dark px-2 py-1 rounded-full hover:bg-opacity-80 flex-shrink-0"
                      onClick={() => {
                        setOrderToUpdate(selectedOrder);
                        setShowStatusUpdatePopup(true);
                      }}
                    >
                      Update Status
                    </button>
                  </div>
                </div>

                {/* Accordion Sections */}
                <Accordion type="single" collapsible defaultValue="items" className="space-y-2">
                  {/* Order Items */}
                  <AccordionItem value="items" className="border-0">
                    <AccordionTrigger className="bg-cropsay-darkSecondary rounded-lg px-3 py-2 text-sm hover:no-underline">
                      Order Items
                    </AccordionTrigger>
                    <AccordionContent className="bg-cropsay-darkSecondary/50 rounded-lg mt-1 p-2">
                      <div className="divide-y divide-cropsay-grayDark">
                        {selectedOrder.items?.map((item, index) => (
                          <div key={index} className="py-2 first:pt-0 last:pb-0">
                            <div className="flex justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium break-words">{item.name}</p>
                                <p className="text-xs text-cropsay-grayLight">
                                  {item.quantity} × Rs. {item.price.toFixed(2)}
                                </p>
                              </div>
                              <p className="text-sm font-medium whitespace-nowrap ml-2">
                                Rs. {(item.quantity * item.price).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Customer Info */}
                  <AccordionItem value="customer" className="border-0">
                    <AccordionTrigger className="bg-cropsay-darkSecondary rounded-lg px-3 py-2 text-sm hover:no-underline">
                      Customer Information
                    </AccordionTrigger>
                    <AccordionContent className="bg-cropsay-darkSecondary/50 rounded-lg mt-1 p-2">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-cropsay-grayLight">Name</p>
                          <p className="break-words">{selectedOrder.customer_name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-cropsay-grayLight">Phone</p>
                          <p>{selectedOrder.phone || 'N/A'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-cropsay-grayLight">Email</p>
                          <p className="break-words text-xs">{selectedOrder.customer_email || 'N/A'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-cropsay-grayLight">Address</p>
                          <p className="break-words text-xs">{selectedOrder.address || selectedOrder.customer_address || 'N/A'}</p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Payment Info */}
                  <AccordionItem value="payment" className="border-0">
                    <AccordionTrigger className="bg-cropsay-darkSecondary rounded-lg px-3 py-2 text-sm hover:no-underline">
                      Payment Information
                    </AccordionTrigger>
                    <AccordionContent className="bg-cropsay-darkSecondary/50 rounded-lg mt-1 p-2">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-cropsay-grayLight">Method</p>
                          <p>{selectedOrder.payment_method || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-cropsay-grayLight">Status</p>
                          <p>{selectedOrder.status === 'delivered' ? 'Paid' : 'Pending'}</p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            ) : (
              // Desktop layout - unchanged
              <div className="p-4">
                <div className="space-y-4">
                  {/* Order Info */}
                  <div className="bg-cropsay-darkSecondary rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-cropsay-grayLight">Status</p>
                        <div className="flex items-center mt-1">
                          <StatusBadge status={selectedOrder.status} />
                          <button 
                            className="ml-2 text-xs bg-cropsay-green text-cropsay-dark px-2 py-1 rounded hover:bg-opacity-80"
                            onClick={() => {
                              setOrderToUpdate(selectedOrder);
                              setShowStatusUpdatePopup(true);
                            }}
                          >
                            Update
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-cropsay-grayLight">Date</p>
                        <p>{new Date(selectedOrder.date).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-cropsay-darkSecondary rounded-lg p-4">
                    <h4 className="text-md font-medium mb-3 flex items-center">
                      <User size={16} className="mr-2" />
                      Customer Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-cropsay-grayLight">Name</p>
                        <p className="break-words">{selectedOrder.customer_name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-cropsay-grayLight">Email</p>
                        <p className="break-words">{selectedOrder.customer_email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-cropsay-grayLight">Phone</p>
                        <p>{selectedOrder.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-cropsay-grayLight">Address</p>
                        <p className="break-words">{selectedOrder.address || selectedOrder.customer_address || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="bg-cropsay-darkSecondary rounded-lg p-4">
                    <h4 className="text-md font-medium mb-3">Order Items</h4>
                    <div className="divide-y divide-cropsay-grayDark">
                      {selectedOrder.items?.map((item, index) => (
                        <div key={index} className="py-3 first:pt-0 last:pb-0">
                          <div className="flex justify-between">
                            <div className="flex-1">
                              <p className="font-medium break-words">{item.name}</p>
                              <p className="text-sm text-cropsay-grayLight">
                                Qty: {item.quantity} × Rs. {item.price.toFixed(2)}
                              </p>
                            </div>
                            <p className="font-medium whitespace-nowrap ml-4">
                              Rs. {(item.quantity * item.price).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Totals */}
                  <div className="bg-cropsay-darkSecondary rounded-lg p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <p>Subtotal</p>
                        <p>Rs. {selectedOrder.total?.toFixed(2) || '0.00'}</p>
                      </div>
                      <div className="flex justify-between">
                        <p>Shipping</p>
                        <p>Rs. {0.00}</p>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <p>Total</p>
                        <p>Rs. {selectedOrder.total?.toFixed(2) || '0.00'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="bg-cropsay-darkSecondary rounded-lg p-4">
                    <h4 className="text-md font-medium mb-3">Payment Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-cropsay-grayLight">Payment Method</p>
                        <p>{selectedOrder.payment_method || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-cropsay-grayLight">Payment Status</p>
                        <p>{selectedOrder.status === 'delivered' ? 'Paid' : 'Pending'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer - Actions */}
          {isMobile ? (
            <div className="bg-cropsay-darkSecondary p-3 border-t border-cropsay-grayDark">
              <button 
                className="w-full py-2 bg-cropsay-dark hover:bg-opacity-80 text-white rounded-md text-sm"
                onClick={() => setShowOrderDetailsDialog(false)}
              >
                Close
              </button>
            </div>
          ) : (
            <div className="bg-cropsay-darkSecondary p-4 border-t border-cropsay-grayDark">
              <div className="flex justify-end space-x-2">
                <button 
                  className="px-4 py-2 bg-cropsay-dark hover:bg-opacity-80 text-white rounded-md"
                  onClick={() => setShowOrderDetailsDialog(false)}
                >
                  Close
                </button>
                <button 
                  className="px-4 py-2 bg-cropsay-green text-cropsay-dark rounded-md hover:bg-opacity-80"
                  onClick={() => {
                    setOrderToUpdate(selectedOrder);
                    setShowStatusUpdatePopup(true);
                  }}
                >
                  Update Status
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Status Update Popup component
  type StatusUpdatePopupProps = {
    isOpen: boolean;
    onClose: () => void;
    orderId: string;
    currentStatus: string;
    onStatusUpdate: (orderId: string, newStatus: string) => Promise<void>;
  };

  const StatusUpdatePopup = ({ isOpen, onClose, orderId, currentStatus, onStatusUpdate }: StatusUpdatePopupProps) => {
    if (!isOpen) return null;
    
    // Show loading state when updating status
    const [localUpdating, setLocalUpdating] = useState(false);
    
    const statusOptions = [
      { emoji: "⏳", status: "Pending", description: "Order received, awaiting processing", value: "pending" },
      { emoji: "⚙️", status: "Processing", description: "Order is being prepared", value: "processing" },
      { emoji: "🚚", status: "Shipped", description: "Order is on the way", value: "shipped" },
      { emoji: "✅", status: "Delivered", description: "Order has been delivered", value: "delivered" },
      { emoji: "❌", status: "Cancelled", description: "Order has been cancelled", value: "cancelled" }
    ];
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-cropsay-darkSecondary rounded-lg w-full max-w-md overflow-hidden shadow-xl">
          <div className="flex items-center justify-between p-4 border-b border-cropsay-grayDark">
            <h3 className="font-medium text-white">Update Order Status</h3>
            <button 
              className="p-1 rounded-full hover:bg-cropsay-dark"
              onClick={onClose}
            >
              <X size={18} />
            </button>
          </div>
          
          <div className="p-4">
            <p className="text-sm text-cropsay-grayText mb-4">
              Current status: <span className="font-medium text-white">{currentStatus}</span>
            </p>
            
            <div className="space-y-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  className={cn(
                    "w-full p-3 flex items-start border rounded-md transition-colors",
                    currentStatus === option.value
                      ? "bg-cropsay-grayDark border-cropsay-green"
                      : "bg-cropsay-dark border-cropsay-grayDark hover:border-cropsay-grayMedium"
                  )}
                  onClick={async () => {
                    if (isUpdatingOrderStatus || localUpdating) return;
                    setLocalUpdating(true);
                    try {
                      await onStatusUpdate(orderId, option.value);
                    } finally {
                      setLocalUpdating(false);
                    }
                  }}
                  disabled={isUpdatingOrderStatus || localUpdating}
                >
                  <span className="mr-3 text-xl">{option.emoji}</span>
                  <div className="text-left">
                    <div className="font-medium">{option.status}</div>
                    <div className="text-xs text-cropsay-grayText mt-1">{option.description}</div>
                  </div>
                  {currentStatus === option.value && (
                    <div className="ml-auto">
                      <span className="bg-cropsay-green/20 text-cropsay-green text-xs px-2 py-1 rounded">Current</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          <div className="bg-cropsay-dark p-4 flex justify-end">
            <button 
              className="px-4 py-2 bg-cropsay-dark border border-cropsay-grayDark hover:bg-cropsay-grayDark rounded-md text-sm transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Status Badge component
  const StatusBadge = ({ status, className = '' }: { status: string, className?: string }) => {
    // Get color based on status
    const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
        case 'pending':
          return 'bg-yellow-500 text-yellow-900';
        case 'processing':
          return 'bg-blue-500 text-blue-900';
        case 'shipped':
          return 'bg-purple-500 text-purple-900';
        case 'delivered':
          return 'bg-green-500 text-green-900';
        case 'cancelled':
          return 'bg-red-500 text-red-900';
        case 'refunded':
          return 'bg-orange-500 text-orange-900';
        default:
          return 'bg-gray-500 text-gray-900';
      }
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status)} ${className}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Handle updating order status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setIsUpdatingOrderStatus(true);
      
      console.log(`Updating order ${orderId} status to ${newStatus}...`);
      await updateOrderStatus(orderId, newStatus);
      
      // Verify the update was successful
      try {
        const verifiedOrder = await verifyOrderStatus(orderId);
        console.log(`Status update verification for ${orderId}: DB shows ${verifiedOrder.status}, requested ${newStatus}`);
        
        // If verification fails, we'll still show the optimistic update
        // but log the discrepancy
        if (verifiedOrder.status !== newStatus) {
          console.warn(`Status mismatch after update! Requested: ${newStatus}, DB has: ${verifiedOrder.status}`);
        }
      } catch (verifyErr) {
        console.error('Error verifying order status update:', verifyErr);
      }
      
      // Update the order in the current state
      const updatedOrders = sellerOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      setSellerOrders(updatedOrders);
      
      // Update selected order if it's the one being edited
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      
      setSuccessMessage(`Order status updated to ${newStatus}`);
      setShowStatusUpdatePopup(false);
      
      // Refresh orders after a delay to ensure DB is in sync
      setTimeout(() => {
        loadSellerOrders();
      }, 2000);
    } catch (error) {
      console.error('Error updating order status:', error);
      setErrorMessage('Failed to update order status');
    } finally {
      setIsUpdatingOrderStatus(false);
    }
  };

  // Function to download orders as Excel file
  const handleDownloadOrders = () => {
    try {
      // Convert filtered orders to CSV format
      const headers = ['Order ID', 'Date', 'Customer', 'Status', 'Items', 'Total'];
      
      let csvContent = headers.join(',') + '\n';
      
      // Filter and sort orders (same logic as in renderOrders)
      const filteredOrders = sellerOrders.filter(order => {
        const matchesSearch = searchQuery === '' || 
          order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (order.customer_name && order.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (order.customer_email && order.customer_email.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        
        let matchesDate = true;
        if (dateFilter === 'today') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const orderDate = new Date(order.date);
          matchesDate = orderDate >= today;
        } else if (dateFilter === 'week') {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          const orderDate = new Date(order.date);
          matchesDate = orderDate >= weekAgo;
        } else if (dateFilter === 'month') {
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          const orderDate = new Date(order.date);
          matchesDate = orderDate >= monthAgo;
        }
        
        return matchesSearch && matchesStatus && matchesDate;
      });
      
      const ordersToExport = [...filteredOrders].sort((a, b) => {
        if (sortBy === 'date_desc') {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        } else if (sortBy === 'date_asc') {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        } else if (sortBy === 'total_desc') {
          return b.total - a.total;
        } else if (sortBy === 'total_asc') {
          return a.total - b.total;
        }
        return 0;
      });
      
      ordersToExport.forEach(order => {
        const row = [
          `"${order.id}"`,
          `"${new Date(order.date).toLocaleDateString()}"`,
          `"${order.customer_name || 'Anonymous'}"`,
          `"${order.status}"`,
          `"${order.items?.length || 0}"`,
          `"${order.total?.toFixed(2) || '0.00'}"`
        ];
        
        csvContent += row.join(',') + '\n';
      });
      
      // Create a CSV file and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Create filename with current date
      const date = new Date();
      const filename = `cropsay_orders_${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}.csv`;
      
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccessMessage('Orders data downloaded successfully');
    } catch (error) {
      console.error('Error downloading orders:', error);
      setErrorMessage('Failed to download orders data');
    }
  };
  
  // Function to show analytics modal
  const handleShowAnalytics = () => {
    setShowAnalyticsModal(true);
  };
  
  // Render order analytics modal
  const renderAnalyticsModal = () => {
    if (!showAnalyticsModal) return null;
    
    // Calculate analytics from orders data
    const totalOrders = sellerOrders.length;
    const totalSales = sellerOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const pendingOrders = sellerOrders.filter(order => order.status === 'pending').length;
    const processingOrders = sellerOrders.filter(order => order.status === 'processing').length;
    const shippedOrders = sellerOrders.filter(order => order.status === 'shipped').length;
    const deliveredOrders = sellerOrders.filter(order => order.status === 'delivered').length;
    const cancelledOrders = sellerOrders.filter(order => order.status === 'cancelled').length;
    
    // Group orders by date to show daily sales
    const ordersByDate = sellerOrders.reduce((acc, order) => {
      const date = new Date(order.date).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { count: 0, total: 0 };
      }
      acc[date].count += 1;
      acc[date].total += (order.total || 0);
      return acc;
    }, {} as Record<string, { count: number, total: number }>);
    
    // Get top 5 dates by sales
    const topDates = Object.entries(ordersByDate)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 5);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div 
          className={cn(
            "bg-cropsay-dark rounded-lg shadow-xl overflow-hidden flex flex-col",
            isMobile 
              ? "w-full max-w-[95%] max-h-[80vh]" 
              : "w-full max-w-3xl max-h-[85vh]"
          )}
        >
          {/* Header */}
          <div className="bg-cropsay-darkSecondary p-3 sticky top-0 z-10 flex justify-between items-center border-b border-cropsay-grayDark">
            <h3 className="text-lg font-semibold text-cropsay-green">Order Analytics</h3>
            <button 
              className="p-1 rounded-full hover:bg-cropsay-grayDark"
              onClick={() => setShowAnalyticsModal(false)}
              title="Close analytics"
            >
              <X size={18} />
            </button>
          </div>
          
          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {/* Summary Cards */}
              <div className="bg-cropsay-darkSecondary rounded-lg p-3 col-span-2 md:col-span-1">
                <h4 className="text-sm font-medium mb-2 text-cropsay-grayLight">Total Orders</h4>
                <p className="text-2xl font-bold">{totalOrders}</p>
              </div>
              
              <div className="bg-cropsay-darkSecondary rounded-lg p-3 col-span-2 md:col-span-1">
                <h4 className="text-sm font-medium mb-2 text-cropsay-grayLight">Total Sales</h4>
                <p className="text-2xl font-bold text-cropsay-green">रू {totalSales.toFixed(2)}</p>
              </div>
              
              <div className="bg-cropsay-darkSecondary rounded-lg p-3 col-span-2 md:col-span-1">
                <h4 className="text-sm font-medium mb-2 text-cropsay-grayLight">Average Order Value</h4>
                <p className="text-2xl font-bold">रू {totalOrders ? (totalSales / totalOrders).toFixed(2) : '0.00'}</p>
              </div>
              
              {/* Order Status Breakdown */}
              <div className="bg-cropsay-darkSecondary rounded-lg p-3 col-span-2 md:col-span-3">
                <h4 className="text-sm font-medium mb-2">Order Status</h4>
                <div className="grid grid-cols-5 gap-2">
                  <div className="flex flex-col items-center">
                    <div className="h-16 bg-yellow-900/30 rounded-md flex items-end w-full mb-1 overflow-hidden">
                      <div 
                        className="bg-yellow-500 w-full" 
                        style={{height: `${totalOrders ? (pendingOrders / totalOrders) * 100 : 0}%`}}
                      ></div>
                    </div>
                    <p className="text-xs text-center">{pendingOrders}</p>
                    <p className="text-xs text-cropsay-grayLight">Pending</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-16 bg-blue-900/30 rounded-md flex items-end w-full mb-1 overflow-hidden">
                      <div 
                        className="bg-blue-500 w-full" 
                        style={{height: `${totalOrders ? (processingOrders / totalOrders) * 100 : 0}%`}}
                      ></div>
                    </div>
                    <p className="text-xs text-center">{processingOrders}</p>
                    <p className="text-xs text-cropsay-grayLight">Processing</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-16 bg-indigo-900/30 rounded-md flex items-end w-full mb-1 overflow-hidden">
                      <div 
                        className="bg-indigo-500 w-full" 
                        style={{height: `${totalOrders ? (shippedOrders / totalOrders) * 100 : 0}%`}}
                      ></div>
                    </div>
                    <p className="text-xs text-center">{shippedOrders}</p>
                    <p className="text-xs text-cropsay-grayLight">Shipped</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-16 bg-green-900/30 rounded-md flex items-end w-full mb-1 overflow-hidden">
                      <div 
                        className="bg-green-500 w-full" 
                        style={{height: `${totalOrders ? (deliveredOrders / totalOrders) * 100 : 0}%`}}
                      ></div>
                    </div>
                    <p className="text-xs text-center">{deliveredOrders}</p>
                    <p className="text-xs text-cropsay-grayLight">Delivered</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-16 bg-red-900/30 rounded-md flex items-end w-full mb-1 overflow-hidden">
                      <div 
                        className="bg-red-500 w-full" 
                        style={{height: `${totalOrders ? (cancelledOrders / totalOrders) * 100 : 0}%`}}
                      ></div>
                    </div>
                    <p className="text-xs text-center">{cancelledOrders}</p>
                    <p className="text-xs text-cropsay-grayLight">Cancelled</p>
                  </div>
                </div>
              </div>
              
              {/* Top Sales by Date */}
              <div className="bg-cropsay-darkSecondary rounded-lg p-3 col-span-2 md:col-span-3">
                <h4 className="text-sm font-medium mb-2">Top Sales Days</h4>
                <div className="space-y-2">
                  {topDates.length > 0 ? (
                    topDates.map(([date, data]) => (
                      <div key={date} className="flex justify-between items-center">
                        <div>
                          <p className="text-sm">{date}</p>
                          <p className="text-xs text-cropsay-grayLight">{data.count} orders</p>
                        </div>
                        <p className="text-sm font-medium text-cropsay-green">रू {data.total.toFixed(2)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-cropsay-grayLight">No sales data available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="bg-cropsay-darkSecondary p-3 border-t border-cropsay-grayDark">
            <div className="flex justify-end">
              <button 
                className="px-4 py-2 bg-cropsay-dark hover:bg-opacity-80 text-white rounded-md"
                onClick={() => setShowAnalyticsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Show loading spinner while authentication state is being determined
  if (authLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-cropsay-darkPrimary">
        <div className="flex flex-col items-center space-y-4">
          <Loader className="h-12 w-12 animate-spin text-cropsay-green" />
          <p className="text-lg text-gray-300">Loading seller dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-cropsay-darkPrimary overflow-hidden">
      {/* Enhanced Fixed Header with Breadcrumb */}
      <div className="flex-shrink-0 bg-gradient-to-r from-[#1E2735] to-[#1A1F2E] border-b border-[#2A3143] backdrop-blur-sm shadow-lg z-20">
        <div className={cn(isMobile ? "px-4 py-0.5" : "px-8 py-3")}>
          <div className="flex items-center justify-between py-2">
            <div>
              <h1 className={cn("font-bold text-white", isMobile ? "text-lg" : "text-2xl")}>
                {isVendor ? "Seller Dashboard" : "Become a Vendor"}
              </h1>
              <div className="flex items-center text-cropsay-grayText text-sm">
                <span>CropsayAI</span>
                <ChevronRight size={14} className="mx-1" />
                <span className="text-white">{isVendor ? "Seller Portal" : "Vendor Application"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {isVendor ? (
        <>
          {/* Enhanced Fixed Tab Navigation - Only for vendors */}
          <div className="flex-shrink-0 bg-gradient-to-b from-[#1A1F2E] to-[#171C29] border-b border-[#2A3143] backdrop-blur-sm shadow-md z-10">
            <div className={cn(isMobile ? "px-4 py-2" : "px-8 py-5")}>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                <button 
                  className={cn(
                    "font-medium transition-all duration-200 rounded-md flex-1 whitespace-nowrap",
                    isMobile ? "text-sm px-4 py-2" : "text-base px-8 py-3.5",
                    activeTab === 'listing' 
                      ? 'bg-gradient-to-r from-cropsay-green to-green-500 text-white shadow-lg' 
                      : 'text-gray-300 hover:text-white hover:bg-[#374151]'
                  )}
                  onClick={() => setActiveTab('listing')}
                >
                  {isMobile ? "Create" : "Create Listing"}
                </button>
                <button 
                  className={cn(
                    "font-medium transition-all duration-200 rounded-md flex-1 whitespace-nowrap",
                    isMobile ? "text-sm px-4 py-2" : "text-base px-8 py-3.5",
                    activeTab === 'manage' 
                      ? 'bg-gradient-to-r from-cropsay-green to-green-500 text-white shadow-lg' 
                      : 'text-gray-300 hover:text-white hover:bg-[#374151]'
                  )}
                  onClick={() => setActiveTab('manage')}
                >
                  {isMobile ? "Manage" : "Manage Listings"}
                </button>
                <button 
                  className={cn(
                    "font-medium transition-all duration-200 rounded-md flex-1 whitespace-nowrap",
                    isMobile ? "text-sm px-4 py-2" : "text-base px-8 py-3.5",
                    activeTab === 'orders' 
                      ? 'bg-gradient-to-r from-cropsay-green to-green-500 text-white shadow-lg' 
                      : 'text-gray-300 hover:text-white hover:bg-[#374151]'
                  )}
                  onClick={() => setActiveTab('orders')}
                >
                  Orders
                </button>
              </div>
            </div>
          </div>
          
          {/* Scrollable Content Area for vendors */}
          <div className="flex-1 overflow-y-auto">
            <div className={cn("min-h-full", isMobile ? "pt-2" : "pt-4")}>
              {activeTab === 'listing' && renderCreateListingForm()}
              {activeTab === 'manage' && renderManageListings()}
              {activeTab === 'orders' && renderOrders()}
            </div>
          </div>
          
          {/* Delete Confirmation Dialog */}
          {renderDeleteDialog()}
          
          {/* Order details dialog */}
          {renderOrderDetailsDialog()}
        </>
      ) : (
        /* Content for non-vendor users - Application Form */
        <div className="flex-1 overflow-y-auto py-4 px-4">
          <VendorApplicationForm />
        </div>
      )}
      
      {/* Status Update Popup - for order status updates */}
      <StatusUpdatePopup 
        isOpen={showStatusUpdatePopup}
        onClose={() => setShowStatusUpdatePopup(false)}
        orderId={orderToUpdate?.id || ''}
        currentStatus={orderToUpdate?.status || ''}
        onStatusUpdate={async (orderId, newStatus) => {
          try {
            setIsUpdatingOrderStatus(true);
            await updateOrderStatus(orderId, newStatus);
            
            // Update the order in the current state
            const updatedOrders = sellerOrders.map(order => 
              order.id === orderId ? { ...order, status: newStatus } : order
            );
            setSellerOrders(updatedOrders);
            
            setSuccessMessage(`Order status updated to ${newStatus}`);
            setShowStatusUpdatePopup(false);
          } catch (error) {
            console.error('Error updating order status:', error);
            setErrorMessage('Failed to update order status');
          } finally {
            setIsUpdatingOrderStatus(false);
          }
        }}
      />
    </div>
  );
};

export default SellPage;
