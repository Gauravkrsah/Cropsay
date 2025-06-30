import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, CheckCircle, Trash2, Edit, AlertCircle, Package, MoreVertical, Loader, Info, Image as ImageIcon, X, Truck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  createProduct, 
  fetchSellerProducts, 
  updateProduct, 
  deleteProduct, 
  uploadProductImage,
  getSellerOrders, 
  ProductFormData 
} from '@/services/productService';
import { updateOrderStatus, batchUpdateOrderStatus, markCODOrdersAsShippedAndPaid } from '@/services/orderService';
import { Product } from '@/data/productData';
import { getCategories, getSubcategories } from '@/data/productData';

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
};

const SellPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('listing');
  const [loading, setLoading] = useState(false);
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
      setSellerOrders(orders);
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
  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    setIsLoadingProducts(true);
    try {
      const success = await deleteProduct(productId);
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
    }
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

  // Product listing form
  const renderCreateListingForm = () => {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        {renderNotification()}
        
        <div className="bg-cropsay-darkSecondary rounded-lg p-6">
          <h2 className="text-xl font-medium mb-6">
            {editingProduct ? 'Update Product Listing' : 'Create a Product Listing'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Product Images</label>
              
              {/* Preview selected images */}
              {(selectedFiles.length > 0 || (editingProduct?.images && editingProduct.images.length > 0)) && (
                <div className="grid grid-cols-3 gap-3 mb-3">
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
              
              <div className="grid grid-cols-3 gap-3">
                {/* Camera placeholder - could be used for camera integration */}
                <div 
                  className="aspect-square bg-cropsay-grayDark rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-cropsay-grayMedium transition-colors"
                  onClick={triggerFileInput}
                >
                  <Camera size={24} className="text-cropsay-grayText mb-2" />
                  <span className="text-xs text-cropsay-grayText">Add Photo</span>
                </div>
                
                {/* File upload button */}
                <div 
                  className="aspect-square bg-cropsay-grayDark rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-cropsay-grayMedium transition-colors"
                  onClick={triggerFileInput}
                >
                  <Upload size={24} className="text-cropsay-grayText mb-2" />
                  <span className="text-xs text-cropsay-grayText">Upload</span>
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
                className="w-full bg-cropsay-dark border border-cropsay-grayDark rounded-lg py-2 px-3 focus:border-cropsay-green focus:ring-1 focus:ring-cropsay-green outline-none transition-all"
                placeholder="Enter product name" 
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category *</label>
                <select 
                  name="category"
                  value={productForm.category}
                  onChange={handleInputChange}
                  className="w-full bg-cropsay-dark border border-cropsay-grayDark rounded-lg py-2 px-3 focus:border-cropsay-green focus:ring-1 focus:ring-cropsay-green outline-none transition-all"
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
                  className="w-full bg-cropsay-dark border border-cropsay-grayDark rounded-lg py-2 px-3 focus:border-cropsay-green focus:ring-1 focus:ring-cropsay-green outline-none transition-all"
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
                className="w-full bg-cropsay-dark border border-cropsay-grayDark rounded-lg py-2 px-3 focus:border-cropsay-green focus:ring-1 focus:ring-cropsay-green outline-none transition-all"
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
                className="w-full bg-cropsay-dark border border-cropsay-grayDark rounded-lg py-2 px-3 focus:border-cropsay-green focus:ring-1 focus:ring-cropsay-green outline-none transition-all"
                rows={4}
                placeholder="Describe your product"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Price (रू ) *</label>
                <input 
                  type="number" 
                  name="price"
                  value={productForm.price || ''}
                  onChange={handleInputChange}
                  className="w-full bg-cropsay-dark border border-cropsay-grayDark rounded-lg py-2 px-3 focus:border-cropsay-green focus:ring-1 focus:ring-cropsay-green outline-none transition-all"
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
                  className="w-full bg-cropsay-dark border border-cropsay-grayDark rounded-lg py-2 px-3 focus:border-cropsay-green focus:ring-1 focus:ring-cropsay-green outline-none transition-all"
                  placeholder="0" 
                  min="1"
                  required
                />
              </div>
            </div>
            
            <div className="mt-6">
              <button 
                type="submit" 
                className="primary-button w-full py-3 flex justify-center items-center"
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
                  className="w-full py-2 mt-3 text-cropsay-grayText hover:text-white transition-colors"
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
  
  // Product management table
  const renderManageListings = () => {
    return (
      <div className="p-4">
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
            <h3 className="mt-6 text-xl">No Active Listings</h3>
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
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-medium">Your Products</h2>
              <button 
                className="primary-button"
                onClick={() => setActiveTab('listing')}
              >
                Add New Product
              </button>
            </div>
            
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
                              onClick={() => handleDeleteProduct(product.id)}
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
          </div>
        )}
      </div>
    );
  };
  
  // Orders management
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
          return 'text-yellow-400';
        case 'paid':
        case 'completed':
          return 'text-green-400';
        case 'cancelled':
          return 'text-red-400';
        case 'shipped':
          return 'text-blue-400';
        default:
          return 'text-cropsay-grayText';
      }
    };
    
    // Handle order status update
    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
      try {
        await updateOrderStatus(orderId, newStatus);
        setSuccessMessage(`Order status updated to ${newStatus}`);
        loadSellerOrders(); // Refresh orders
      } catch (error) {
        console.error('Error updating order status:', error);
        setErrorMessage('Failed to update order status');
      }
    };    // Get pending COD orders
    const pendingCODOrders = sellerOrders.filter(
      order => order.status === 'Pending' && order.payment_method === 'COD'
    );
    
    // Handle batch update of COD orders
    const handleMarkCODOrdersAsShipped = async () => {
      if (pendingCODOrders.length === 0) {
        setSuccessMessage('No pending COD orders to update');
        return;
      }

      try {
        setLoading(true);
        const orderIds = pendingCODOrders.map(order => order.id);
        await markCODOrdersAsShippedAndPaid(orderIds);
        setSuccessMessage(`${orderIds.length} COD orders marked as Shipped`);
        loadSellerOrders(); // Refresh orders
      } catch (error) {
        console.error('Error updating COD orders:', error);
        setErrorMessage('Failed to update COD orders');      } finally {
        setLoading(false);
      }
    };
    
    return (
      <div className="p-4">
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
            <h3 className="mt-6 text-xl">No Orders Yet</h3>
            <p className="text-cropsay-grayText mt-2">You haven't received any orders yet.</p>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-medium mb-4">Orders for Your Products</h2>

            {/* Mark COD orders as Shipped button */}
            {pendingCODOrders.length > 0 && (
              <div className="mb-4 bg-cropsay-darkSecondary p-3 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-yellow-400 font-medium">{pendingCODOrders.length} pending COD orders</span>
                  <p className="text-xs text-cropsay-grayText">Cash on Delivery orders that need to be shipped</p>
                </div>
                <button
                  onClick={handleMarkCODOrdersAsShipped}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md flex items-center space-x-2 transition-colors"
                >
                  {loading ? (
                    <Loader size={16} className="animate-spin mr-2" />
                  ) : (
                    <Truck size={16} className="mr-2" />
                  )}
                  <span>Mark All as Shipped</span>
                </button>
              </div>
            )}
            
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
                    {sellerOrders.map((order) => (
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
                          <span className={getStatusColor(order.status)}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">                            <button
                              onClick={() => {
                                const orderItems = order.items.map((item) => 
                                  `${item.name} x ${item.quantity} (रू ${item.price})`
                                ).join(', ');
                                alert(`Order #${order.id.slice(0, 8)}\n\nCustomer: ${order.customer_name}\nAddress: ${order.customer_address}\nPayment: ${order.payment_method}\nItems: ${orderItems}\nTotal: रू ${order.total.toFixed(2)}`);
                              }}
                              className="p-1.5 bg-cropsay-grayDark rounded-md hover:bg-cropsay-grayMedium transition-colors"
                              title="View order details"
                            >
                              <Info size={16} className="text-cropsay-green" />
                            </button>
                            {(order.status === 'Paid' || (order.status === 'Pending' && order.payment_method === 'COD')) && (
                              <button
                                onClick={() => handleStatusUpdate(order.id, 'Shipped')}
                                className="p-1.5 bg-cropsay-grayDark rounded-md hover:bg-cropsay-grayMedium transition-colors"
                                title="Mark as Shipped"
                              >
                                <Package size={16} className="text-blue-400" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
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
      
      {activeTab === 'listing' && renderCreateListingForm()}
      {activeTab === 'manage' && renderManageListings()}
      {activeTab === 'orders' && renderOrders()}
    </div>
  );
};

export default SellPage;