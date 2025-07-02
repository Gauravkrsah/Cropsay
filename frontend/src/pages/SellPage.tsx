import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, CheckCircle, Trash2, Edit, AlertCircle, Package, MoreVertical, Loader, Info, Image as ImageIcon, X, Truck, Home, ChevronRight, Search, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  createProduct, 
  fetchSellerProducts, 
  updateProduct, 
  deleteProduct, 
  uploadProductImage,
  ProductFormData 
} from '@/services/productService';
import { getSellerOrders } from '@/services/orderService';
import { updateOrderStatus, batchUpdateOrderStatus, markCODOrdersAsShippedAndPaid } from '@/services/orderService';
import { Product } from '@/data/productData';
import { getCategories, getSubcategories } from '@/data/productData';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

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

const StatusOption = ({ emoji, status, description, value, currentStatus, orderId, onClick }: StatusOptionProps) => {
  const isActive = currentStatus.toLowerCase() === value.toLowerCase();
  
  return (
    <li 
      className={cn(
        "px-3 py-2 hover:bg-cropsay-grayDark/50 cursor-pointer flex items-start",
        isActive ? "bg-cropsay-grayDark" : ""
      )}
      onClick={(e) => {
        e.stopPropagation();
        onClick(orderId, value);
      }}
    >
      <span className="mr-2 text-lg">{emoji}</span>
      <div className="flex-1">
        <div className="flex items-center">
          <span className="font-medium text-white text-sm">{status}</span>
          {isActive && <span className="ml-2 text-xs bg-cropsay-green/20 text-cropsay-green px-1.5 py-0.5 rounded">Current</span>}
        </div>
        {description && <p className="text-xs text-cropsay-grayText mt-0.5">{description}</p>}
      </div>
    </li>
  );
};

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
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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
    if (activeTab === 'manage') {
      loadSellerProducts();
    } else if (activeTab === 'orders') {
      loadSellerOrders();
    }
  }, [activeTab]);
  
  // Set up auto-refresh interval for orders
  useEffect(() => {
    if (activeTab === 'orders') {
      const interval = setInterval(() => {
        loadSellerOrders();
      }, 60000); // 60 seconds interval
      
      return () => clearInterval(interval);
    }
  }, [activeTab]);
  
  // Load products created by the seller
  const loadSellerProducts = async () => {
    if (!user) return;
    
    setIsLoadingProducts(true);
    try {
      const products = await fetchSellerProducts();
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
      const orders = await getSellerOrders();
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
          // Reset form
          resetForm();
        }
      } else {
        // Create new product
        result = await createProduct(productData);
        if (result) {
          setSuccessMessage('Product created successfully!');
          // Reset form
          resetForm();
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
  const resetForm = () => {
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
    setActiveTab('manage'); // Switch to manage tab after successful creation
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
            <div className="flex items-center mb-4">
              <div className="bg-red-100 rounded-full p-2 mr-3">
                <AlertCircle size={24} className="text-red-600" />
              </div>
              <h3 className={cn("font-semibold text-white", isMobile ? "text-lg" : "text-xl")}>
                Delete Product
              </h3>
            </div>
            
            <p className="text-cropsay-grayText mb-6">
              Are you sure you want to delete <span className="font-medium text-white">"{productToDelete.name}"</span>? 
              This action cannot be undone.
            </p>
            
            <div className={cn("flex gap-3", isMobile ? "flex-col" : "flex-row justify-end")}>
              <button
                onClick={cancelDeleteProduct}
                className={cn(
                  "px-4 py-2 border border-cropsay-grayDark text-cropsay-grayText hover:text-white hover:border-cropsay-grayMedium rounded-md transition-colors",
                  isMobile ? "w-full" : ""
                )}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteProduct}
                disabled={loading}
                className={cn(
                  "px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors flex items-center justify-center",
                  isMobile ? "w-full" : ""
                )}
              >
                {loading ? (
                  <>
                    <Loader size={16} className="animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete Product'
                )}
              </button>
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
              
              {editingProduct && (
                <button 
                  type="button"
                  onClick={resetForm}
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
              <div className="bg-cropsay-darkSecondary p-6 rounded-full">
                <Package size={48} className="text-cropsay-grayText" />
              </div>
            </div>
            <h3 className={cn("mt-6", isMobile ? "text-lg" : "text-xl")}>No Active Listings</h3>
            <p className="text-cropsay-grayText mt-2">You don't have any product listings yet.</p>
            <button 
              className="primary-button mt-6 mx-auto"
              onClick={() => setActiveTab('listing')}
            >
              Create Your First Listing
            </button>
          </div>
        ) : (
          <div>
            <div className={cn("mb-4 items-center", isMobile ? "flex flex-col space-y-3" : "flex justify-between")}>
              <h2 className={cn("font-medium", isMobile ? "text-lg" : "text-xl")}>Your Products</h2>
              <button 
                className={cn("primary-button", isMobile ? "w-full" : "")}
                onClick={() => setActiveTab('listing')}
              >
                {isMobile ? "Add Product" : "Add New Product"}
              </button>
            </div>
            
            {/* Mobile Card Layout */}
            {isMobile ? (
              <div className="space-y-3">
                {sellerProducts.map((product) => (
                  <div key={product.id} className="bg-cropsay-darkSecondary rounded-lg p-4 border border-cropsay-grayDark">
                    <div className="flex items-start space-x-3">
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-cropsay-grayDark rounded-md overflow-hidden flex items-center justify-center flex-shrink-0">
                        {product.images && product.images.length > 0 ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon size={20} className="text-cropsay-grayText" />
                        )}
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm truncate">{product.name}</h3>
                            <p className="text-xs text-cropsay-grayText">{product.brand}</p>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center space-x-1 ml-2">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="p-2 bg-cropsay-grayDark rounded-md hover:bg-cropsay-grayMedium transition-colors"
                              title="Edit product"
                            >
                              <Edit size={14} className="text-cropsay-green" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product)}
                              className="p-2 bg-cropsay-grayDark rounded-md hover:bg-cropsay-grayMedium transition-colors"
                              title="Delete product"
                            >
                              <Trash2 size={14} className="text-red-400" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Product Details */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-cropsay-grayText">Price:</span>
                            <span className="ml-1 font-medium">रू {product.price.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-cropsay-grayText">Qty:</span>
                            <span className="ml-1 font-medium">{product.quantity || 0}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-cropsay-grayText">Category:</span>
                            <span className="ml-1 font-medium">{product.category}</span>
                            {product.subcategory && (
                              <span className="text-cropsay-grayText"> / {product.subcategory}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Desktop Table Layout */
              <div className="bg-cropsay-darkSecondary rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead className="bg-cropsay-grayDark">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm">Product</th>
                        <th className="py-3 px-4 text-left text-sm">Price</th>
                        <th className="py-3 px-4 text-left text-sm">Quantity</th>
                        <th className="py-3 px-4 text-left text-sm">Category</th>
                        <th className="py-3 px-4 text-left text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cropsay-grayDark">
                      {sellerProducts.map((product) => (
                        <tr key={product.id}>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-cropsay-grayDark rounded-md overflow-hidden flex items-center justify-center">
                                {product.images && product.images.length > 0 ? (
                                  <img 
                                    src={product.images[0]} 
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <ImageIcon size={16} className="text-cropsay-grayText" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium">{product.name}</div>
                                <div className="text-xs text-cropsay-grayText">
                                  {product.brand}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">रू {product.price.toFixed(2)}</td>
                          <td className="py-3 px-4">{product.quantity || 0}</td>
                          <td className="py-3 px-4">
                            <div>{product.category}</div>
                            {product.subcategory && (
                              <div className="text-xs text-cropsay-grayText">{product.subcategory}</div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="p-1.5 bg-cropsay-grayDark rounded-md hover:bg-cropsay-grayMedium transition-colors"
                                title="Edit product"
                              >
                                <Edit size={16} className="text-cropsay-green" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product)}
                                className="p-1.5 bg-cropsay-grayDark rounded-md hover:bg-cropsay-grayMedium transition-colors"
                                title="Delete product"
                              >
                                <Trash2 size={16} className="text-red-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  
  // Orders management with responsive design
  const renderOrders = () => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    };
    
    // Helper function to get status color
    const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
        case 'pending':
        case 'order_received':
          return 'text-yellow-400';
        case 'paid':
        case 'payment_received':
        case 'completed':
        case 'delivered':
          return 'text-green-400';
        case 'cancelled':
          return 'text-red-400';
        case 'shipped':
        case 'out_for_delivery':
          return 'text-blue-400';
        case 'processing':
        case 'inventory_check':
        case 'packaging':
          return 'text-orange-400';
        case 'returned':
          return 'text-purple-400';
        default:
          return 'text-cropsay-grayText';
      }
    };
    
    // Get emoji for status
    const getStatusEmoji = (status: string) => {
      switch (status.toLowerCase()) {
        case 'order_received': return '📦';
        case 'payment_received': return '💳';
        case 'processing': return '⚙️';
        case 'inventory_check': return '📊';
        case 'packaging': return '🎁';
        case 'shipped': return '🚚';
        case 'out_for_delivery': return '📍';
        case 'delivered': return '✅';
        case 'returned': return '↩️';
        case 'cancelled': return '❌';
        default: return '📦';
      }
    };
    
    // Filter and sort orders based on search, date, status, and sort criteria
    const getFilteredOrders = () => {
      return sellerOrders
        .filter(order => {
          // Search filter
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const searchInOrder = 
              order.id.toLowerCase().includes(query) ||
              order.customer_name?.toLowerCase().includes(query) ||
              order.customer_email?.toLowerCase().includes(query);
              
            if (!searchInOrder) return false;
          }
          
          // Date filter
          if (dateFilter !== 'all') {
            const orderDate = new Date(order.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            
            const weekStart = new Date(today);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            
            const monthStart = new Date(today);
            monthStart.setDate(1);
            
            const lastMonthStart = new Date(today);
            lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
            lastMonthStart.setDate(1);
            
            const lastMonthEnd = new Date(today);
            lastMonthEnd.setDate(0);
            
            switch (dateFilter) {
              case 'today':
                if (orderDate < today || orderDate >= new Date(today.getTime() + 86400000))
                  return false;
                break;
              case 'yesterday':
                if (orderDate < yesterday || orderDate >= today)
                  return false;
                break;
              case 'week':
                if (orderDate < weekStart)
                  return false;
                break;
              case 'month':
                if (orderDate < monthStart)
                  return false;
                break;
              case 'last_month':
                if (orderDate < lastMonthStart || orderDate >= monthStart)
                  return false;
                break;
            }
          }
          
          // Status filter
          if (statusFilter !== 'all' && order.status.toLowerCase() !== statusFilter) {
            return false;
          }
          
          return true;
        })
        .sort((a, b) => {
          switch (sortBy) {
            case 'date_desc':
              return new Date(b.date).getTime() - new Date(a.date).getTime();
            case 'date_asc':
              return new Date(a.date).getTime() - new Date(b.date).getTime();
            case 'total_desc':
              return b.total - a.total;
            case 'total_asc':
              return a.total - b.total;
            default:
              return new Date(b.date).getTime() - new Date(a.date).getTime();
          }
        });
    };

    // Order details dialog
    const renderOrderDetailsDialog = () => {
      if (!showOrderDetailsDialog || !selectedOrder) return null;

      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={cn(
            "bg-cropsay-darkSecondary rounded-lg border border-cropsay-grayDark shadow-xl flex flex-col",
            isMobile ? "w-full max-w-sm max-h-[65vh]" : "w-full max-w-2xl max-h-[90vh]"
          )}>
            {/* Header - Fixed */}
            <div className={cn(
              "flex-shrink-0 flex items-center justify-between border-b border-cropsay-grayDark",
              isMobile ? "p-2" : "p-6"
            )}>
              <div className="flex items-center">
                <div className={cn("bg-cropsay-green/20 rounded-full mr-2", isMobile ? "p-1" : "p-2")}>
                  <Package size={isMobile ? 16 : 24} className="text-cropsay-green" />
                </div>
                <div>
                  <h3 className={cn("font-semibold text-white", isMobile ? "text-sm" : "text-xl")}>
                    Order Details
                  </h3>
                  <p className={cn("text-cropsay-grayText", isMobile ? "text-xs leading-tight" : "text-sm")}>
                    #{selectedOrder.id.slice(0, 8)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowOrderDetailsDialog(false)}
                className={cn("hover:bg-cropsay-grayDark rounded-md transition-colors", isMobile ? "p-1" : "p-2")}
              >
                <X size={isMobile ? 16 : 18} className="text-cropsay-grayText" />
              </button>
            </div>
            
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto">
              <div className={cn("p-1", isMobile ? "p-2" : "p-6")}>
                <div className={cn("space-y-3", isMobile ? "space-y-1.5" : "space-y-4")}>
                  {/* Customer Information */}
                  <div className={cn("bg-cropsay-grayDark/30 rounded-lg", isMobile ? "p-2" : "p-4")}>
                    <h4 className={cn("font-medium text-white flex items-center", isMobile ? "text-xs mb-1" : "mb-3")}>
                      <Home size={isMobile ? 12 : 14} className={cn("text-cropsay-green", isMobile ? "mr-1" : "mr-2")} />
                      Customer
                    </h4>
                    <div className={cn("space-y-1", isMobile ? "text-xs" : "text-sm")}>
                      <div className="flex justify-between">
                        <span className="text-cropsay-grayText">Name:</span>
                        <span className="text-white font-medium">{selectedOrder.customer_name || 'Unknown Customer'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-cropsay-grayText">Email:</span>
                        <span className="text-white text-right flex-1 ml-2 truncate">{selectedOrder.customer_email || 'No email'}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-cropsay-grayText">Phone:</span>
                        <span className="text-white text-right flex-1 ml-2">{selectedOrder.phone || 'No phone'}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-cropsay-grayText">Customer Address:</span>
                        <span className="text-white text-right flex-1 ml-2">{selectedOrder.customer_address || 'No customer address'}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-cropsay-grayText">Delivery Address:</span>
                        <span className="text-white text-right flex-1 ml-2">{selectedOrder.address || 'No delivery address'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Information */}
                  <div className={cn("bg-cropsay-grayDark/30 rounded-lg", isMobile ? "p-2" : "p-4")}>
                    <h4 className={cn("font-medium text-white flex items-center", isMobile ? "text-xs mb-1" : "mb-3")}>
                      <Info size={isMobile ? 12 : 14} className={cn("text-cropsay-green", isMobile ? "mr-1" : "mr-2")} />
                      Order Info
                    </h4>
                    <div className={cn("space-y-1", isMobile ? "text-xs" : "text-sm")}>
                      <div className="flex justify-between">
                        <span className="text-cropsay-grayText">Date:</span>
                        <span className="text-white">{formatDate(selectedOrder.date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-cropsay-grayText">Payment:</span>
                        <span className="text-white">{selectedOrder.payment_method}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-cropsay-grayText">Status:</span>
                        <span className={getStatusColor(selectedOrder.status)}>
                          {selectedOrder.status}
                        </span>
                      </div>
                      <div className={cn("flex justify-between items-center pt-1 border-t border-cropsay-grayDark", isMobile ? "pt-1" : "pt-2")}>
                        <span className="text-cropsay-grayText font-medium">Total:</span>
                        <span className={cn("text-cropsay-green font-semibold", isMobile ? "text-sm" : "text-lg")}>
                          रू {selectedOrder.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className={cn("bg-cropsay-grayDark/30 rounded-lg", isMobile ? "p-2" : "p-4")}>
                    <h4 className={cn("font-medium text-white flex items-center", isMobile ? "text-xs mb-1" : "mb-3")}>
                      <Package size={isMobile ? 12 : 14} className={cn("text-cropsay-green", isMobile ? "mr-1" : "mr-2")} />
                      Items ({selectedOrder.items.length})
                    </h4>
                    <div className={cn("space-y-2", isMobile ? "space-y-1" : "space-y-3")}>
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className={cn(
                          "bg-cropsay-darkPrimary rounded-md",
                          isMobile ? "p-1.5" : "p-3"
                        )}>
                          {isMobile ? (
                            /* Compact mobile layout */
                            <div className="space-y-0.5">
                              <div className="flex justify-between items-start">
                                <span className="font-medium text-white text-xs leading-tight flex-1 pr-2">{item.name}</span>
                                <span className="text-cropsay-green font-medium text-xs whitespace-nowrap">
                                  रू {(item.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs text-cropsay-grayText">
                                <span>रू {item.price} × {item.quantity}</span>
                              </div>
                            </div>
                          ) : (
                            /* Desktop layout */
                            <div className="flex justify-between items-center">
                              <div className="flex-1">
                                <div className="font-medium text-white">{item.name}</div>
                                <div className="text-xs text-cropsay-grayText">
                                  Unit Price: रू {item.price}
                                </div>
                              </div>
                              <div className="text-center px-3">
                                <div className="text-sm text-cropsay-grayText">Qty</div>
                                <div className="font-medium text-white">{item.quantity}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-cropsay-grayText">Subtotal</div>
                                <div className="font-medium text-cropsay-green">
                                  रू {(item.price * item.quantity).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer - Fixed */}
            <div className={cn(
              "flex-shrink-0 flex justify-end border-t border-cropsay-grayDark",
              isMobile ? "p-2" : "p-6"
            )}>
              <button
                onClick={() => setShowOrderDetailsDialog(false)}
                className={cn(
                  "bg-cropsay-green hover:bg-cropsay-green/90 text-white rounded-md transition-colors",
                  isMobile ? "w-full py-1.5 text-xs" : "px-6 py-2"
                )}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      );
    };
    
    // Show status update popup
    const showUpdateStatusPopup = (order: OrderWithItems) => {
      setOrderToUpdate(order);
      setShowStatusUpdatePopup(true);
    };
    
    // Handle order status update
    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
      try {
        // Close popup
        setShowStatusUpdatePopup(false);
        setOpenOrderStatusDropdown(null);
        
        // Format status for display
        const statusMap: {[key: string]: string} = {
          'order_received': 'Order Received',
          'payment_received': 'Payment Received',
          'payment_received_cod': 'Payment Received (COD)',
          'processing': 'Processing',
          'inventory_check': 'Inventory Check',
          'packaging': 'Packaging',
          'shipped': 'Shipped',
          'out_for_delivery': 'Out for Delivery',
          'delivered': 'Delivered',
          'cancelled': 'Cancelled',
          'returned': 'Returned',
        };
        
        const displayStatus = statusMap[newStatus] || newStatus;
        
        setLoading(true);
        await updateOrderStatus(orderId, displayStatus);
        
        // Update the order locally to avoid reloading the entire list
        setSellerOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? {...order, status: displayStatus} 
              : order
          )
        );
        
        setSuccessMessage(`Order status updated to ${displayStatus}`);
        
        // Special handling for COD orders marked as delivered
        if (newStatus === 'payment_received_cod') {
          // Update payment status to Paid as well
          await updateOrderStatus(orderId, 'Paid');
          
          // Update local orders again
          setSellerOrders(prevOrders => 
            prevOrders.map(order => 
              order.id === orderId 
                ? {...order, status: 'Paid'} 
                : order
            )
          );
          
          setSuccessMessage('Order marked as delivered and payment received');
        }
      } catch (error) {
        console.error('Error updating order status:', error);
        setErrorMessage('Failed to update order status');
      } finally {
        setLoading(false);
      }
    };
    
    // Render status update popup
    const renderStatusUpdatePopup = () => {
      if (!showStatusUpdatePopup || !orderToUpdate) return null;
      
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={cn(
            "bg-cropsay-darkSecondary rounded-lg border border-cropsay-grayDark shadow-xl",
            isMobile ? "w-full max-w-sm" : "w-full max-w-md"
          )}>
            <div className="p-4 border-b border-cropsay-grayDark flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-cropsay-green/20 rounded-full p-2 mr-2">
                  <Package size={isMobile ? 18 : 20} className="text-cropsay-green" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Update Order Status</h3>
                  <p className="text-xs text-cropsay-grayText">Order #{orderToUpdate.id.slice(0, 8)}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowStatusUpdatePopup(false)}
                className="p-1.5 hover:bg-cropsay-grayDark rounded-md"
              >
                <X size={18} className="text-cropsay-grayText" />
              </button>
            </div>
            
            <div className="max-h-80 overflow-y-auto p-2">
              <div className="space-y-1">
                <StatusOption 
                  emoji="📦" 
                  status="Order Received" 
                  description="Arrives in 3 days" 
                  value="order_received"
                  currentStatus={orderToUpdate.status}
                  orderId={orderToUpdate.id}
                  onClick={handleStatusUpdate}
                />
                
                {orderToUpdate.payment_method === "Prepaid" && (
                  <StatusOption 
                    emoji="💳" 
                    status="Payment Received" 
                    description="Prepaid" 
                    value="payment_received"
                    currentStatus={orderToUpdate.status}
                    orderId={orderToUpdate.id}
                    onClick={handleStatusUpdate}
                  />
                )}
                
                <StatusOption 
                  emoji="⚙️" 
                  status="Processing" 
                  description="Arrives in 3 days" 
                  value="processing"
                  currentStatus={orderToUpdate.status}
                  orderId={orderToUpdate.id}
                  onClick={handleStatusUpdate}
                />
                
                <StatusOption 
                  emoji="📊" 
                  status="Inventory Check" 
                  description="Arrives in 2–3 days" 
                  value="inventory_check"
                  currentStatus={orderToUpdate.status}
                  orderId={orderToUpdate.id}
                  onClick={handleStatusUpdate}
                />
                
                <StatusOption 
                  emoji="🎁" 
                  status="Packaging" 
                  description="Arrives in 2 days" 
                  value="packaging"
                  currentStatus={orderToUpdate.status}
                  orderId={orderToUpdate.id}
                  onClick={handleStatusUpdate}
                />
                
                <StatusOption 
                  emoji="🚚" 
                  status="Shipped" 
                  description="Arrives in 1–2 days" 
                  value="shipped"
                  currentStatus={orderToUpdate.status}
                  orderId={orderToUpdate.id}
                  onClick={handleStatusUpdate}
                />
                
                <StatusOption 
                  emoji="📍" 
                  status="Out for Delivery" 
                  description="Arrives today" 
                  value="out_for_delivery"
                  currentStatus={orderToUpdate.status}
                  orderId={orderToUpdate.id}
                  onClick={handleStatusUpdate}
                />
                
                <StatusOption 
                  emoji="✅" 
                  status="Delivered" 
                  description="Order Complete" 
                  value="delivered"
                  currentStatus={orderToUpdate.status}
                  orderId={orderToUpdate.id}
                  onClick={handleStatusUpdate}
                />
                
                {orderToUpdate.payment_method === "COD" && (
                  <StatusOption 
                    emoji="💵" 
                    status="Payment Received (COD)" 
                    value="payment_received_cod"
                    currentStatus={orderToUpdate.status}
                    orderId={orderToUpdate.id}
                    onClick={handleStatusUpdate}
                  />
                )}
                
                <StatusOption 
                  emoji="↩️" 
                  status="Returned" 
                  description="Refund Initiated" 
                  value="returned"
                  currentStatus={orderToUpdate.status}
                  orderId={orderToUpdate.id}
                  onClick={handleStatusUpdate}
                />
                
                <StatusOption 
                  emoji="❌" 
                  status="Cancelled" 
                  value="cancelled"
                  currentStatus={orderToUpdate.status}
                  orderId={orderToUpdate.id}
                  onClick={handleStatusUpdate}
                />
              </div>
            </div>
            
            <div className="p-3 border-t border-cropsay-grayDark flex justify-end">
              <button 
                onClick={() => setShowStatusUpdatePopup(false)}
                className="px-4 py-2 bg-cropsay-grayDark hover:bg-cropsay-grayMedium text-white rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      );
    };
    
    return (
      <div className={cn(isMobile ? "p-2" : "p-4")}>
        {renderNotification()}
        
        {isLoadingOrders ? (
          <div className="flex justify-center py-16">
            <Loader size={36} className="animate-spin text-cropsay-green" />
          </div>
        ) : sellerOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="flex justify-center">
              <div className="bg-cropsay-darkSecondary p-6 rounded-full">
                <CheckCircle size={48} className="text-cropsay-grayText" />
              </div>
            </div>
            <h3 className={cn("mt-6", isMobile ? "text-lg" : "text-xl")}>No Orders Yet</h3>
            <p className="text-cropsay-grayText mt-2">You haven't received any orders yet.</p>
          </div>
        ) : (
          <div>
            <h2 className={cn("font-medium mb-4", isMobile ? "text-lg" : "text-xl")}>Orders for Your Products</h2>

            {/* Search and Filter Orders */}
            <div className={cn(
              "mb-4 bg-cropsay-darkSecondary rounded-lg border border-cropsay-grayDark",
              isMobile ? "p-3" : "p-4"
            )}>
              <div className={cn(
                isMobile ? "space-y-3" : "flex items-center justify-between gap-4"
              )}>
                {/* Search */}
                <div className={cn(
                  "relative",
                  isMobile ? "w-full" : "w-1/3"
                )}>
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cropsay-grayText" />
                  <input
                    type="text"
                    placeholder="Search by order ID, customer name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-black border border-cropsay-grayDark rounded-md pl-10 pr-3 py-2 text-sm text-white placeholder-cropsay-grayText focus:outline-none focus:ring-1 focus:ring-cropsay-green"
                  />
                </div>
                
                <div className={cn(
                  "flex items-center gap-3",
                  isMobile ? "flex-wrap" : "flex-nowrap"
                )}>
                  {/* Date Filter */}
                  <div className="relative">
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="bg-black border border-cropsay-grayDark rounded-md pl-3 pr-8 py-2 text-sm text-white appearance-none focus:outline-none focus:ring-1 focus:ring-cropsay-green"
                    >
                      <option value="all">All Dates</option>
                      <option value="today">Today</option>
                      <option value="yesterday">Yesterday</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="last_month">Last Month</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-cropsay-grayText" />
                  </div>
                  
                  {/* Status Filter */}
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-black border border-cropsay-grayDark rounded-md pl-3 pr-8 py-2 text-sm text-white appearance-none focus:outline-none focus:ring-1 focus:ring-cropsay-green"
                    >
                      <option value="all">All Statuses</option>
                      <option value="order_received">Order Received</option>
                      <option value="payment_received">Payment Received</option>
                      <option value="processing">Processing</option>
                      <option value="inventory_check">Inventory Check</option>
                      <option value="packaging">Packaging</option>
                      <option value="shipped">Shipped</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="returned">Returned</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-cropsay-grayText" />
                  </div>
                  
                  {/* Sort By */}
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-black border border-cropsay-grayDark rounded-md pl-3 pr-8 py-2 text-sm text-white appearance-none focus:outline-none focus:ring-1 focus:ring-cropsay-green"
                    >
                      <option value="date_desc">Newest First</option>
                      <option value="date_asc">Oldest First</option>
                      <option value="total_desc">Highest Amount</option>
                      <option value="total_asc">Lowest Amount</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-cropsay-grayText" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mobile Card Layout */}
            {isMobile ? (
              <div className="space-y-3">
                {getFilteredOrders().map((order) => (
                  <div key={order.id} className="bg-cropsay-darkSecondary rounded-lg p-4 border border-cropsay-grayDark">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-sm">#{order.id.slice(0, 8)}</h3>
                        <p className="text-xs text-cropsay-grayText">{formatDate(order.date)}</p>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm mr-1">{getStatusEmoji(order.status)}</span>
                        <span className={cn("text-xs font-medium", getStatusColor(order.status))}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-cropsay-grayText">Customer:</span>
                        <span className="ml-1 font-medium">{order.customer_name}</span>
                      </div>
                      <div>
                        <span className="text-cropsay-grayText">Email:</span>
                        <span className="ml-1">{order.customer_email}</span>
                      </div>
                      <div>
                        <span className="text-cropsay-grayText">Total:</span>
                        <span className="ml-1 font-medium">रू {order.total.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-cropsay-grayText">Payment:</span>
                        <span className="ml-1">{order.payment_method}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-cropsay-grayDark">
                      <button
                        onClick={() => handleViewOrderDetails(order)}
                        className="flex items-center space-x-1 text-cropsay-green text-sm"
                      >
                        <Info size={14} />
                        <span>View Details</span>
                      </button>
                      
                      {/* Status Update Dropdown */}
                      <button
                        onClick={() => showUpdateStatusPopup(order)}
                        className="flex items-center space-x-1 bg-cropsay-grayDark hover:bg-cropsay-grayMedium text-white px-3 py-1.5 rounded text-sm transition-colors"
                      >
                        <span>Update Status</span>
                        <Package size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Desktop Table Layout */
              <div className="bg-cropsay-darkSecondary rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead className="bg-cropsay-grayDark">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm">Order</th>
                        <th className="py-3 px-4 text-left text-sm">Date</th>
                        <th className="py-3 px-4 text-left text-sm">Customer</th>
                        <th className="py-3 px-4 text-left text-sm">Total</th>
                        <th className="py-3 px-4 text-left text-sm">Status</th>
                        <th className="py-3 px-4 text-left text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cropsay-grayDark">
                      {getFilteredOrders().map((order) => (
                        <tr key={order.id}>
                          <td className="py-3 px-4">
                            #{order.id.slice(0, 8)}
                          </td>
                          <td className="py-3 px-4">{formatDate(order.date)}</td>
                          <td className="py-3 px-4">
                            <div>{order.customer_name}</div>
                            <div className="text-xs text-cropsay-grayText">{order.customer_email}</div>
                          </td>
                          <td className="py-3 px-4">रू {order.total.toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <span className="mr-1.5">{getStatusEmoji(order.status)}</span>
                              <span className={getStatusColor(order.status)}>
                                {order.status}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleViewOrderDetails(order)}
                                className="p-1.5 bg-cropsay-grayDark rounded-md hover:bg-cropsay-grayMedium transition-colors"
                                title="View order details"
                              >
                                <Info size={16} className="text-cropsay-green" />
                              </button>
                              
                              {/* Status Update Button */}
                              <button
                                onClick={() => showUpdateStatusPopup(order)}
                                className="p-1.5 bg-cropsay-grayDark rounded-md hover:bg-cropsay-grayMedium transition-colors"
                                title="Update Status"
                              >
                                <Package size={16} className="text-white" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Order Details Dialog */}
        {renderOrderDetailsDialog()}
        
        {/* Status Update Popup */}
        {renderStatusUpdatePopup()}
      </div>
    );
  };
  
  return (
    <div className="h-full flex flex-col bg-cropsay-darkPrimary overflow-hidden">
      {/* Enhanced Fixed Header with Breadcrumb */}
      <div className="flex-shrink-0 bg-gradient-to-r from-[#1E2735] to-[#1A1F2E] border-b border-[#2A3143] backdrop-blur-sm shadow-lg z-20">
        <div className={cn(isMobile ? "px-4 py-0.5" : "px-8 py-3")}>
          <div className="flex items-center justify-between">
            {/* Enhanced Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <button 
                onClick={() => navigate("/")}
                className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors rounded-md p-1.5 hover:bg-[#2A3143]"
              >
                <Home size={isMobile ? 16 : 18} />
                {!isMobile && <span>Home</span>}
              </button>
              <ChevronRight size={isMobile ? 12 : 14} className="text-gray-500" />
              <span className={cn("text-white font-semibold", isMobile ? "text-sm" : "text-base")}>
                Seller Dashboard
              </span>
            </div>
            
            {/* Mobile menu indicator */}
            {isMobile && (
              <div className="text-xs text-gray-400 bg-[#2A3143] px-2 py-1 rounded">
                {activeTab === 'listing' && 'Create'}
                {activeTab === 'manage' && 'Manage'}
                {activeTab === 'orders' && 'Orders'}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Enhanced Fixed Tab Navigation */}
      <div className="flex-shrink-0 bg-gradient-to-b from-[#1A1F2E] to-[#171C29] border-b border-[#2A3143] backdrop-blur-sm shadow-md z-10">
        <div className={cn(isMobile ? "px-4 py-2" : "px-8 py-5")}>
          <div className={cn("flex", isMobile ? "justify-center" : "justify-start")}>
            <div className={cn(
              "flex bg-[#2A3143] rounded-lg shadow-inner",
              isMobile ? "w-full p-1" : "inline-flex p-2 gap-3 min-w-[500px]"
            )}>
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
      </div>
      
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className={cn("min-h-full", isMobile ? "pt-2" : "pt-4")}>
          {activeTab === 'listing' && renderCreateListingForm()}
          {activeTab === 'manage' && renderManageListings()}
          {activeTab === 'orders' && renderOrders()}
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      {renderDeleteDialog()}
    </div>
  );
};

export default SellPage;