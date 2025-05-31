import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { products as staticProducts, getRecommendedProducts } from '@/data/productData';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCart } from '@/contexts/CartContext';
import { usePurchase } from '@/contexts/PurchaseContext';
import { ArrowLeft, ShoppingBag, User, Star, Truck, Shield, Store, Clock, Info, ChevronRight, Heart, Pencil, Trash2 } from 'lucide-react';
import { CartItemQuantity } from '@/components/ShoppingCart';
import { supabase } from '@/integrations/supabase/client';
import type { Product } from '@/data/productData';
import ProductCard from '@/components/ProductCard';
import { Badge } from '@/components/ui/badge';
import RatingComponent from '@/components/RatingComponent';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { addProductReview, getProductReviews, updateProductReview, deleteProductReview, ProductReview } from '@/services/reviewService';

// Product details based on category for more dynamic content
const categoryDetails = {
  'Seeds': [
    { label: 'Weight', value: '250g' },
    { label: 'Origin', value: 'Nepal' },
    { label: 'Organic', value: 'Yes' },
    { label: 'Shelf Life', value: '12 months' },
    { label: 'Germination Rate', value: '95%' },
    { label: 'Best Season', value: 'Spring' },
    { label: 'Storage', value: 'Cool, dry place' },
    { label: 'Certification', value: 'NASC Certified' },
  ],
  'Fertilizers': [
    { label: 'Weight', value: '1kg' },
    { label: 'Type', value: 'Organic' },
    { label: 'NPK Ratio', value: '14-14-14' },
    { label: 'Application', value: 'Soil' },
    { label: 'Shelf Life', value: '36 months' },
    { label: 'Coverage', value: '100 sq. m.' },
    { label: 'pH Value', value: '6.5-7.5' },
    { label: 'Certification', value: 'Organic Certified' },
  ],
  'Pesticides': [
    { label: 'Volume', value: '500ml' },
    { label: 'Active Ingredient', value: 'Natural Compounds' },
    { label: 'Target Pests', value: 'Multiple' },
    { label: 'Safety Period', value: '3-5 days' },
    { label: 'Application', value: 'Foliar Spray' },
    { label: 'Dilution', value: '2-3ml/L' },
    { label: 'Shelf Life', value: '24 months' },
    { label: 'Eco Rating', value: 'Low Impact' },
  ],
  'Tools & Equipment': [
    { label: 'Material', value: 'Stainless Steel' },
    { label: 'Weight', value: '1.5kg' },
    { label: 'Dimensions', value: '45 × 12 × 5 cm' },
    { label: 'Handle', value: 'Ergonomic Grip' },
    { label: 'Warranty', value: '12 months' },
    { label: 'Origin', value: 'Nepal' },
    { label: 'Maintenance', value: 'Low' },
    { label: 'Usage', value: 'All-purpose' },
  ],
  'Irrigation': [
    { label: 'Material', value: 'HDPE/PVC' },
    { label: 'Pressure Rating', value: '2.5 Bar' },
    { label: 'Flow Rate', value: '2L/hr' },
    { label: 'Coverage', value: '100 sq. m.' },
    { label: 'Warranty', value: '12 months' },
    { label: 'Lifespan', value: '5+ years' },
    { label: 'UV Resistant', value: 'Yes' },
    { label: 'Connection Type', value: 'Standard' },
  ],
};

// Empty fallback reviews array - we'll show "No reviews yet" instead of mock data now
const fallbackReviews: any[] = [];

// Delivery and return policies
const policies = {
  delivery: [
    "Free delivery on orders above रू 1000",
    "Standard delivery: 2-5 business days",
    "Express delivery available for additional fee",
    "Track your order status in real-time"
  ],
  returns: [
    "Easy returns within 7 days of delivery",
    "Damaged or defective products eligible for replacement",
    "Original packaging required for returns",
    "Contact customer service for return authorization"
  ]
};

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();  const navigate = useNavigate();
  const { addItem, items, openCart, removeItem, updateQuantity } = useCart();
  const { isPurchased, hasRated, markAsRated } = usePurchase();  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sellerName, setSellerName] = useState<string>('');
  const [activeImage, setActiveImage] = useState<number>(0);
  const [isWishlist, setIsWishlist] = useState<boolean>(false);
  const [showRatingDialog, setShowRatingDialog] = useState<boolean>(false);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState<boolean>(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editingReview, setEditingReview] = useState<ProductReview | null>(null);
  const cartItem = items.find(item => item.id === Number(id));

  // Handle rating submission
  const handleSubmitRating = async (productId: string | number, rating: number, reviewText: string) => {
    if (editingReview) {
      // We are editing an existing review
      await handleUpdateReview(editingReview.id, rating, reviewText);
    } else {
      // We are adding a new review
      try {
        const newReview = await addProductReview(productId, rating, reviewText);
        markAsRated(String(productId));
        setShowRatingDialog(false);
        setEditingReview(null); // Clear editing state

        if (product) {
          setReviews(prevReviews => [newReview, ...prevReviews].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

          const { data: updatedProductData, error: productRefreshError } = await supabase
            .from('products')
            .select('rating')
            .eq('id', Number(product.id))
            .single();

          if (productRefreshError) {
            console.error('Error refreshing product data after new review:', productRefreshError);
          } else if (updatedProductData) {
            setProduct(prevProduct => {
              if (!prevProduct) return null;
              return {
                ...prevProduct,
                rating: updatedProductData.rating,
              };
            });
          }
        }

        toast({
          title: "Rating Submitted",
          description: "Thank you for rating this product!",
        });
      } catch (error) {
        console.error('Error submitting new review:', error);
        toast({
          title: "Submission Failed",
          description: "There was an issue submitting your new review. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  // Fetch product details - first check database, then fall back to static data
  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const { data: dbProduct, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', Number(id))
          .single();
          
        if (dbProduct) {
          setProduct({
            id: dbProduct.id,
            name: dbProduct.name,
            description: dbProduct.description,
            price: dbProduct.price,
            category: dbProduct.category,
            subcategory: dbProduct.subcategory,
            brand: dbProduct.brand,
            inStock: dbProduct.in_stock,
            rating: dbProduct.rating, // Use rating from database
            quantity: dbProduct.quantity,
            images: dbProduct.images,
            sellerId: dbProduct.seller_id,
            createdAt: dbProduct.created_at
          });
          
          fetchSellerInfo(dbProduct.seller_id);
        } else {
          // Fall back to static product data
          const staticProduct = staticProducts.find(p => p.id === Number(id));
          if (staticProduct) {
            setProduct(staticProduct);
          } else {
            navigate('/shop'); // Product not found
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        // Fall back to static product data
        const staticProduct = staticProducts.find(p => p.id === Number(id));
        if (staticProduct) {
          setProduct(staticProduct);
        } else {
          navigate('/shop'); // Product not found
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductDetails();
  }, [id, navigate]);
  
  // Fetch seller info if product is from a seller
  const fetchSellerInfo = async (sellerId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', sellerId)
        .single();
        
      if (profile) {
        setSellerName(profile.full_name || 'Community Seller');
      }
    } catch (error) {
      console.error('Error fetching seller info:', error);
    }
  };

  const recommended = useMemo(() => {
    if (!product) return [];
    return getRecommendedProducts(product.id, product.category, 4);
  }, [product]);

  const details = useMemo(() => {
    if (!product) return [];
    return (categoryDetails[product.category as keyof typeof categoryDetails] || categoryDetails['Seeds'])
      .sort(() => 0.5 - Math.random()).slice(0, 6);
  }, [product]);  

  useEffect(() => {
    // Scroll to top when navigating to a new product
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Reset active image when product changes
    setActiveImage(0);
  }, [id]);
  
  // Load product reviews
  useEffect(() => {
    const loadReviews = async () => {
      if (product && product.id) {
        setLoadingReviews(true);
        try {
          const productReviews = await getProductReviews(product.id);
          setReviews(productReviews);
        } catch (error) {
          console.error('Error loading reviews:', error);
          setReviews([]);
        } finally {
          setLoadingReviews(false);
        }
      }
    };    
    loadReviews();
  }, [product && product.id]); // Use logical AND operator which is safe in dependency arrays
  
  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setCurrentUserId(data.user.id);
      }
    };
    
    getCurrentUser();
  }, []);
  
  // Add to cart handler for main product
  const handleAddToCart = () => {
    if (product && product.inStock) {
      console.log(`ProductDetailPage: Adding product to cart: ID=${product.id}, Name=${product.name}`);
      
      // Make sure we add the correct product with all required properties
      addItem({
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: product.price,
        category: product.category,
        image: product.images && product.images.length > 0 ? product.images[0] : undefined
      });
    }
  };

  // Toggle wishlist status
  const handleToggleWishlist = () => {
    setIsWishlist(!isWishlist);
  };
  // Generate breadcrumbs based on product category

  // Generate breadcrumbs based on product category
  const breadcrumbs = useMemo(() => {
    if (!product) return [];
    
    return [      { label: 'Home', path: '/' },
      { label: 'Shop', path: '/shop' },
      { label: product.category, path: `/shop?category=${product.category}` },
      ...(product.subcategory ? [{ label: product.subcategory, path: `/shop?category=${product.category}&subcategory=${product.subcategory}` }] : []),
      { label: product.name, path: `/shop/product/${product.id}` }
    ];
  }, [product]);

  // Handle updating a review
  const handleUpdateReview = async (reviewId: string, rating: number, review: string) => {
    try {
      const updatedReview = await updateProductReview(reviewId, rating, review);
      
      // Update the reviews list to reflect the changes
      setReviews(currentReviews => 
        currentReviews.map(r => r.id === reviewId ? updatedReview : r)
      );
      
      // Close the rating dialog
      setShowRatingDialog(false);
      setEditingReview(null);
      
      // Show success message
      toast({
        title: "Review Updated",
        description: "Your review has been successfully updated.",
      });
      
      // Reload product to get updated rating
      if (product) {
        const { data: updatedProduct } = await supabase
          .from('products')
          .select('rating')
          .eq('id', product.id)
          .single();
          
        if (updatedProduct) {
          setProduct({
            ...product,
            rating: updatedProduct.rating || product.rating
          });
        }
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error updating review:', error);
      toast({
        title: "Update Failed",
        description: "There was a problem updating your review. Please try again.",
        variant: "destructive",
      });
      return Promise.reject(error);
    }
  };
  
  // Handle deleting a review
  const handleDeleteReview = async (reviewId: string) => {
    if (window.confirm('Are you sure you want to delete your review?')) {
      try {
        await deleteProductReview(reviewId);
        
        // Remove the review from the list
        setReviews(currentReviews => 
          currentReviews.filter(r => r.id !== reviewId)
        );
        
        // Show success message
        toast({
          title: "Review Deleted",
          description: "Your review has been deleted successfully.",
        });
        
        // Reload product to get updated rating
        if (product) {
          const { data: updatedProduct } = await supabase
            .from('products')
            .select('rating')
            .eq('id', product.id)
            .single();
            
          if (updatedProduct) {
            setProduct({
              ...product,
              rating: updatedProduct.rating || product.rating
            });
          }
        }
      } catch (error) {
        console.error('Error deleting review:', error);
        toast({
          title: "Delete Failed",
          description: "There was a problem deleting your review. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-[#1E2735] flex-1 flex items-center justify-center h-screen p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#11B981] mx-auto"></div>
          <h2 className="text-xl font-medium mt-4 text-white">Loading Product Details...</h2>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-[#1E2735] flex-1 flex flex-col items-center justify-center h-screen p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-3 text-white">Product Not Found</h2>
          <p className="text-[#a6b0c3] mb-6">The product you're looking for may have been removed or is no longer available.</p>
          <Button 
            onClick={() => navigate('/shop')}
            className="bg-[#11B981] hover:bg-[#0ea06e] text-white"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1E2735] flex-1 overflow-y-auto p-4 md:p-6">
      {/* Rating Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={(isOpen) => {
        setShowRatingDialog(isOpen);
        if (!isOpen) {
          setEditingReview(null); // Reset editingReview when dialog is closed
        }
      }}>
        <DialogContent className="bg-[#1c232d] text-white border-[#2A3143] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">{editingReview ? "Edit Your Review" : "Rate this Product"}</DialogTitle>
          </DialogHeader>
          {product && (
            <RatingComponent 
              productId={product.id} 
              onSubmit={handleSubmitRating}
              onCancel={() => {
                setShowRatingDialog(false);
                setEditingReview(null); // Ensure editingReview is reset on cancel
              }}
              existingReview={editingReview}
            />
          )}
        </DialogContent>
      </Dialog>
      
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <div className="flex items-center text-xs mb-4 text-[#a6b0c3] overflow-x-auto pb-1 whitespace-nowrap">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight size={14} className="mx-1 text-[#a6b0c3]/50" />}
              {index === breadcrumbs.length - 1 ? (
                <span className="text-white font-medium">{crumb.label}</span>
              ) : (
                <button 
                  onClick={() => navigate(crumb.path)}
                  className="hover:text-white transition-colors"
                >
                  {crumb.label}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>
        
        {/* Main product content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product images */}
          <div className="space-y-4">
            {/* Main image with rating badge */}
            <div className="bg-[#262f3e] rounded-lg overflow-hidden aspect-square shadow-md relative">
              {/* Rating badge */}
              <div className="absolute top-3 right-3 z-10 bg-[#11B981] rounded-full px-2.5 py-1 shadow-md flex items-center">
                <Star size={16} className="text-white fill-white" />
                <span className="text-white text-sm ml-1 font-semibold">{product.rating ? product.rating.toFixed(1) : "0.0"}</span>
              </div>
              
              {/* Wishlist button */}
              <button 
                onClick={handleToggleWishlist}
                className={`absolute top-3 left-3 z-10 rounded-full p-2 transition-colors ${isWishlist ? 'bg-red-500 text-white' : 'bg-[#1c232d]/80 text-white hover:bg-[#1c232d]'}`}
                aria-label={isWishlist ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart size={20} className={isWishlist ? "fill-white" : ""} />
              </button>
              
              {product.images && product.images.length > 0 ? (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <img
                    src={product.images[activeImage]} 
                    alt={product.name}
                    className="w-auto max-w-full max-h-full object-contain transition-all duration-300 hover:scale-105"
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <img 
                    src="/placeholder.svg" 
                    alt="Product placeholder" 
                    className="w-32 h-32 opacity-30"
                  />
                </div>
              )}
            </div>
            
            {/* Thumbnail images */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {product.images.map((image, index) => (
                  <button 
                    key={index} 
                    className={`rounded-lg overflow-hidden aspect-square transition-all ${
                      activeImage === index ? 'ring-2 ring-[#11B981]' : 'hover:ring-2 hover:ring-[#11B981]/50'
                    }`}
                    onClick={() => setActiveImage(index)}
                  >
                    <div className="w-full h-full flex items-center justify-center p-1 bg-[#1c232d]">
                      <img 
                        src={image} 
                        alt={`${product.name} thumbnail ${index + 1}`}
                        className={`w-full h-full object-contain transition-opacity ${
                          activeImage === index ? 'opacity-100' : 'opacity-70 hover:opacity-90'
                        }`}
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product details */}
          <div className="space-y-6">
            {/* Category and product badges */}
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant="outline" className="bg-[#232936] text-[#a6b0c3] hover:bg-[#262f3e] border-[#2A3143]">
                {product.category}
              </Badge>
              
              {product.subcategory && product.subcategory !== product.category && (
                <Badge variant="outline" className="bg-[#232936] text-[#a6b0c3] hover:bg-[#262f3e] border-[#2A3143]">
                  {product.subcategory}
                </Badge>
              )}
              
              {product.brand && (
                <Badge variant="outline" className="bg-[#232936] text-[#a6b0c3] hover:bg-[#262f3e] border-[#2A3143]">
                  {product.brand}
                </Badge>
              )}
              
              {product.inStock ? (
                <Badge className="bg-[#11B981]/20 text-[#11B981] hover:bg-[#11B981]/30 border-[#11B981]/20">
                  In Stock
                </Badge>
              ) : (
                <Badge className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/20">
                  Out of Stock
                </Badge>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-white">{product.name}</h1>
            
            {/* Price */}
            <div className="flex items-center">
              <span className="text-[#11B981] text-2xl md:text-3xl font-semibold">रू {product.price.toFixed(2)}</span>
              {/* Optional: Add discounted price comparison here */}
            </div>
            
            {/* Description */}
            <div>
              <p className="text-[#a6b0c3] leading-relaxed">{product.description}</p>
            </div>
            
            {/* Seller information */}
            {product.sellerId && (
              <div className="bg-[#232936] rounded-lg p-4 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[#2A3143] flex items-center justify-center flex-shrink-0">
                  <Store size={20} className="text-[#11B981]" />
                </div>
                <div>
                  <p className="text-sm text-[#a6b0c3]">Sold by</p>
                  <p className="font-medium text-white">{sellerName || 'Community Seller'}</p>
                </div>
              </div>
            )}
            
            {/* Quantity info */}
            {product.quantity !== undefined && product.quantity > 0 && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-[#11B981] flex-shrink-0"></div>
                <p className="text-sm text-white">
                  <span className="font-medium">{product.quantity}</span> units available
                </p>
              </div>
            )}
            
            {/* Add to cart section */}
            <div className="flex flex-col-reverse sm:flex-row gap-4">
              {cartItem ? (
                <>
                  <div className="flex-grow flex items-center justify-between bg-[#232936] rounded-lg p-2 border border-[#2A3143]">
                    <CartItemQuantity id={cartItem.id} quantity={cartItem.quantity} />
                  </div>
                  
                  <Button 
                    variant="outline"
                    className="bg-[#232936] border-[#2A3143] hover:bg-[#262f3e] text-white flex-shrink-0"
                    onClick={openCart}
                  >
                    <ShoppingBag size={18} className="mr-2" />
                    View Cart
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    className="flex-grow bg-[#11B981] hover:bg-[#0ea06e] text-white rounded-lg py-6 font-medium transition-all duration-200 hover:shadow-md hover:shadow-[#11B981]/20 text-base"
                    disabled={!product.inStock}
                    onClick={handleAddToCart}
                  >
                    <ShoppingBag size={18} className="mr-2" />
                    Add to Cart
                  </Button>
                  
                  <Button 
                    className={`flex-shrink-0 rounded-lg p-6 transition-colors ${
                      isWishlist 
                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                        : 'bg-[#232936] hover:bg-[#262f3e] text-white'
                    }`}
                    onClick={handleToggleWishlist}
                    aria-label={isWishlist ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart size={20} className={isWishlist ? "fill-white" : ""} />
                  </Button>
                </>
              )}
            </div>
            
            {/* Delivery and shipping info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-3 bg-[#232936] rounded-lg p-3">
                <div className="w-10 h-10 rounded-full bg-[#2A3143] flex items-center justify-center flex-shrink-0">
                  <Truck size={18} className="text-[#11B981]" />
                </div>
                <div>
                  <p className="font-medium text-white">Free Delivery</p>
                  <p className="text-xs text-[#a6b0c3]">On orders over रू 1000</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#232936] rounded-lg p-3">
                <div className="w-10 h-10 rounded-full bg-[#2A3143] flex items-center justify-center flex-shrink-0">
                  <Shield size={18} className="text-[#11B981]" />
                </div>
                <div>
                  <p className="font-medium text-white">Guaranteed Quality</p>
                  <p className="text-xs text-[#a6b0c3]">100% authentic products</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product tabs for additional information */}
        <div className="mb-12">
          <Tabs defaultValue="specifications" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6 bg-[#232936]">
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
            </TabsList>
            
            {/* Specifications tab */}
            <TabsContent value="specifications" className="bg-[#1c232d] rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4 text-white">Product Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {product.brand && (
                  <div className="flex justify-between p-3 bg-[#232936] rounded-lg hover:bg-[#262f3e] transition-colors">
                    <span className="text-[#a6b0c3]">Brand</span>
                    <span className="text-white font-medium">{product.brand}</span>
                  </div>
                )}
                {details.map((detail, index) => (
                  <div key={index} className="flex justify-between p-3 bg-[#232936] rounded-lg hover:bg-[#262f3e] transition-colors">
                    <span className="text-[#a6b0c3]">{detail.label}</span>
                    <span className="text-white font-medium">{detail.value}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            {/* Reviews tab */}
            <TabsContent value="reviews" className="bg-[#1c232d] rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-white">Customer Reviews</h3>
                <div className="flex items-center">
                  <div className="flex mr-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star}
                        size={16} 
                        className={star <= Math.round(product.rating || 0) // Handle null rating
                          ? "text-yellow-500 fill-yellow-500" 
                          : "text-gray-400"
                        } 
                      />
                    ))}
                  </div>                  <span className="text-white font-medium">{(product.rating ? product.rating.toFixed(1) : "0.0")}</span>
                  <span className="text-[#a6b0c3] ml-1">({reviews.length})</span>
                </div>
              </div>
              

              {/* Add Rating Button (only for purchased but not yet rated products) */}
              {isPurchased(product.id) && !hasRated(product.id) && (
                <div className="flex justify-end mb-4">
                  <Button 
                    onClick={() => setShowRatingDialog(true)}
                    className="bg-[#11B981] hover:bg-[#0ea06e]"
                  >
                    Rate This Product
                  </Button>
                </div>
              )}              <div className="space-y-6">                {loadingReviews ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#11B981] mx-auto"></div>
                    <p className="text-[#a6b0c3] mt-2">Loading reviews...</p>
                  </div>
                ) : reviews.length > 0 ? (                  reviews.map(review => (
                    <div key={review.id} className="border-b border-[#2A3143] pb-4 last:border-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center">
                            <div className="flex mr-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star}
                                  size={14} 
                                  className={star <= review.rating 
                                    ? "text-yellow-500 fill-yellow-500" 
                                    : "text-gray-400"
                                  } 
                                />
                              ))}

                            </div>
                            <span className="text-xs text-[#a6b0c3] ml-2">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="font-medium text-white mt-1">
                            {review.username ? `${review.username.substring(0, 1).toUpperCase()}${review.username.substring(1)}` : 'Anonymous'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {currentUserId && review.userId === currentUserId && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingReview(review);
                                  setShowRatingDialog(true);
                                }}
                                className="p-1.5 rounded-full bg-[#232936] hover:bg-[#323c4e] text-[#a6b0c3] hover:text-white transition-colors"
                                aria-label="Edit review"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteReview(review.id)}
                                className="p-1.5 rounded-full bg-[#232936] hover:bg-[#323c4e] text-[#a6b0c3] hover:text-red-400 transition-colors"
                                aria-label="Delete review"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                          {review.verifiedPurchase && (
                            <Badge variant="outline" className="bg-transparent border-[#2A3143] text-[#a6b0c3]">
                              Verified Purchase
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-[#a6b0c3] mt-3">{review.review}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-[#a6b0c3]">
                    <p>No reviews yet. Be the first to review this product!</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Shipping & Returns tab */}
            <TabsContent value="shipping" className="bg-[#1c232d] rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center mb-4">
                    <Truck size={20} className="text-[#11B981] mr-2" />
                    <h3 className="text-lg font-medium text-white">Delivery Information</h3>
                  </div>
                  <ul className="space-y-3">
                    {policies.delivery.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-1 h-1 rounded-full bg-[#11B981] mt-2 mr-2"></div>
                        <span className="text-[#a6b0c3]">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="flex items-center mb-4">
                    <Clock size={20} className="text-[#11B981] mr-2" />
                    <h3 className="text-lg font-medium text-white">Returns Policy</h3>
                  </div>
                  <ul className="space-y-3">
                    {policies.returns.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-1 h-1 rounded-full bg-[#11B981] mt-2 mr-2"></div>
                        <span className="text-[#a6b0c3]">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Recommended products section */}
        {recommended.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Recommended Products</h2>
              <Button 
                variant="outline" 
                className="bg-[#232936] border-[#2A3143] hover:bg-[#262f3e] text-white text-sm"
                onClick={() => navigate('/shop')}
              >
                View All
                <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommended.map(rec => (
                <ProductCard key={rec.id} product={rec} />
              ))}
            </div>
          </div>
        )}      </div>
        {/* Rating Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={(open) => {
        setShowRatingDialog(open);
        if (!open) setEditingReview(null);
      }}>
        <DialogContent className="max-w-md w-full bg-[#10141E] text-gray-100 border border-[#2A3143]">
          <DialogHeader>
            <DialogTitle>{editingReview ? 'Edit Review' : 'Rate Product'}</DialogTitle>
          </DialogHeader>
          {product && (
            <RatingComponent 
              productId={product.id}
              onSubmit={handleSubmitRating}
              onCancel={() => {
                setShowRatingDialog(false);
                setEditingReview(null);
              }}
              existingReview={editingReview}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductDetailPage;
