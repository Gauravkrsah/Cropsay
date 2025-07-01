import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/data/productData';
import { Database } from '@/integrations/supabase/types';

// Define types for RPC function returns
type RPCProductResult = Database['public']['Functions']['create_or_update_product']['Returns'];
type RPCProductArrayResult = Database['public']['Functions']['get_seller_products']['Returns'];

export type ProductFormData = {
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory: string;
  brand: string;
  quantity: number;
  images: string[];
};

export type SupabaseProduct = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory: string;
  brand: string;
  seller_id: string;
  quantity: number;
  images: string[];
  in_stock: boolean;
  created_at: string;
  updated_at: string;
};

// Convert Supabase product to frontend Product
export function mapSupabaseProductToProduct(product: SupabaseProduct): Product {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category,
    subcategory: product.subcategory,
    brand: product.brand,
    inStock: product.in_stock,
    quantity: product.quantity,
    images: product.images,
    sellerId: product.seller_id,
    createdAt: product.created_at,
    rating: 0, // Default rating for new products
  };
}

// Fetch all products from Supabase, sorted by creation date (newest first)
export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return (data || []).map(mapSupabaseProductToProduct);
}

// Fetch products by seller ID
export async function fetchSellerProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .rpc('get_seller_products');

  if (error) {
    console.error('Error fetching seller products:', error);
    return [];
  }

  return (data || []).map(mapSupabaseProductToProduct);
}

// Create a new product
export async function createProduct(productData: ProductFormData): Promise<Product | null> {
  try {
    const { data, error } = await supabase.rpc('create_or_update_product', {
      product_name: productData.name,
      product_description: productData.description,
      product_price: productData.price,
      product_category: productData.category,
      product_subcategory: productData.subcategory || productData.category, // Use category as default if subcategory is empty
      product_brand: productData.brand,
      product_quantity: productData.quantity,
      product_images: productData.images,
    });

    if (error) {
      console.error('Error creating product:', error);
      return null;
    }

    return data ? mapSupabaseProductToProduct(data) : null;
  } catch (error) {
    console.error('Exception creating product:', error);
    return null;
  }
}

// Update an existing product
export async function updateProduct(productId: number, productData: ProductFormData): Promise<Product | null> {
  try {    
    const { data, error } = await supabase.rpc('create_or_update_product', {
      product_id: productId,
      product_name: productData.name,
      product_description: productData.description,
      product_price: productData.price,
      product_category: productData.category,
      product_subcategory: productData.subcategory || productData.category,
      product_brand: productData.brand,
      product_quantity: productData.quantity,
      product_images: productData.images,
    });

    if (error) {
      console.error('Error updating product:', error);
      return null;
    }

    return mapSupabaseProductToProduct(data);
  } catch (error) {
    console.error('Exception updating product:', error);
    return null;
  }
}

// Update product quantity
export async function updateProductQuantity(productId: number, quantity: number): Promise<Product | null> {
  try {
    const { data, error } = await supabase.rpc('update_product_quantity', {
      product_id: productId,
      new_quantity: quantity,
    });

    if (error) {
      console.error('Error updating product quantity:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    return mapSupabaseProductToProduct(data);
  } catch (error) {
    console.error('Exception updating product quantity:', error);
    return null;
  }
}

// Delete a product
export async function deleteProduct(productId: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      console.error('Error deleting product:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception deleting product:', error);
    return false;
  }
}

// Upload a product image
export async function uploadProductImage(file: File, fileName: string): Promise<string | null> {
  const filePath = `${Date.now()}_${fileName}`;
  
  const { data, error } = await supabase
    .storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Error uploading image:', error);
    return null;
  }

  // Get the public URL for the image
  const { data: publicURLData } = supabase
    .storage
    .from('product-images')
    .getPublicUrl(data.path);

  return publicURLData.publicUrl;
}

// Get seller orders (orders for products sold by the current user)
export async function getSellerOrders() {
  const { data: products, error: productsError } = await supabase
    .rpc('get_seller_products');

  if (productsError) {
    console.error('Error fetching seller products:', productsError);
    return [];
  }

  if (!products || products.length === 0) {
    return [];
  }

  // Extract product IDs for filtering orders
  const productIds = products.map(product => product.id);

  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .order('date', { ascending: false });

  if (ordersError) {
    console.error('Error fetching seller orders:', ordersError);
    return [];
  }

  // Filter and format orders that contain the seller's products
  const sellerOrders = orders?.filter(order => {
    // Parse the items JSON if needed
    const orderItems = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    // Check if any item in the order contains the seller's products
    return orderItems.some((item: any) => productIds.includes(Number(item.id)));
  }).map(order => {
    // Parse items if needed
    const orderItems = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    
    // Filter only items belonging to this seller
    const sellerItems = orderItems.filter((item: any) => productIds.includes(Number(item.id)));
    
    // Extract customer info from address field (since we don't have customer_name directly)
    const addressParts = order.address.split(',');
    const customerName = addressParts[0]?.trim() || 'Customer';
      return {
      id: order.id,
      date: order.date,
      status: order.status,
      payment_method: order.payment_method || 'N/A',
      total: sellerItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0),
      items: sellerItems,
      customer_name: customerName,
      customer_email: order.user_id || 'N/A',
      customer_address: order.address
    };
  });
  
  return sellerOrders || [];
}

// Search products
export async function searchProducts(searchTerm: string): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .rpc('search_products', { search_term: searchTerm });

    if (error) {
      console.error('Error searching products:', error);
      return [];
    }

    return (data || []).map(mapSupabaseProductToProduct);
  } catch (error) {
    console.error('Exception searching products:', error);
    return [];
  }
}

// Get newest products
export async function getNewestProducts(maxCount: number = 10): Promise<Product[]> {
  try {
    // Try RPC function first
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_newest_products', { max_count: maxCount });

    if (!rpcError && rpcData) {
      console.log('Successfully fetched products via RPC:', rpcData.length);
      return (rpcData || []).map(mapSupabaseProductToProduct);
    }

    console.log('RPC failed, trying direct query. Error:', rpcError);

    // Fallback to direct query
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('in_stock', true)
      .order('created_at', { ascending: false })
      .limit(maxCount);

    if (error) {
      console.error('Error fetching newest products via direct query:', error);
      return [];
    }

    console.log('Successfully fetched products via direct query:', data?.length || 0);
    return (data || []).map(mapSupabaseProductToProduct);
  } catch (error) {
    console.error('Exception fetching newest products:', error);
    return [];
  }
}

// Get products by category
export async function getProductsByCategory(category: string, maxCount: number = 20): Promise<Product[]> {
  try {
    // Log for debugging
    console.log(`Calling getProductsByCategory with category: "${category}"`);
    
    // Try direct query first (for more flexibility and better debugging)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .ilike('category', category)  // Use ilike for case-insensitive matching
      .limit(maxCount);

    if (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }

    console.log(`Direct query found ${data?.length || 0} products for category "${category}"`);
    if (data?.length) {
      // Log a sample product for debugging category values
      console.log('Sample product category values:', {
        categoryInDb: data[0].category,
        requestedCategory: category,
        matches: data[0].category.toLowerCase() === category.toLowerCase()
      });
    }
    
    return (data || []).map(mapSupabaseProductToProduct);
  } catch (error) {
    console.error('Exception fetching products by category:', error);
    return [];
  }
}

// Get best selling products (highest rated with most reviews)
export async function getBestSellingProducts(maxCount: number = 8): Promise<Product[]> {
  try {
    console.log(`Fetching best selling products (max: ${maxCount})...`);
    
    // First, try to get all products and sort them by rating client-side
    // This approach works with existing functions while we wait for the database function to be deployed
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('in_stock', true)
      .order('created_at', { ascending: false })
      .limit(50); // Get more products to have a better selection

    if (error) {
      console.error('Error fetching products for best sellers:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('No products found for best sellers');
      return [];
    }

    // Convert to frontend format
    const products = data.map(mapSupabaseProductToProduct);
    
    // Sort by rating (if available), then by newest
    const sortedProducts = products
      .filter(product => product.inStock)
      .sort((a, b) => {
        // If both have ratings, sort by rating
        if (a.rating && b.rating) {
          return b.rating - a.rating;
        }
        // If only one has rating, prioritize it
        if (a.rating && !b.rating) return -1;
        if (!a.rating && b.rating) return 1;
        // If neither has rating, sort by newest
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      })
      .slice(0, maxCount);

    console.log(`Successfully fetched ${sortedProducts.length} best selling products`);
    return sortedProducts;
  } catch (error) {
    console.error('Exception fetching best selling products:', error);
    return [];
  }
}
