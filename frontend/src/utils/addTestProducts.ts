// Add test products to Supabase database
import { supabase } from '@/integrations/supabase/client';

const testProducts = [
  {
    name: 'Premium Tomato Seeds',
    description: 'High-yield hybrid tomato seeds perfect for home gardens',
    price: 299.99,
    category: 'Seeds',
    subcategory: 'Vegetable Seeds',
    brand: 'GrowBrand',
    quantity: 100,
    images: ['https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=300&h=300&fit=crop'],
    in_stock: true,
    rating: 4.8,
    review_count: 25
  },
  {
    name: 'Chili Pepper Seeds',
    description: 'Spicy chili pepper seeds for hot sauce enthusiasts',
    price: 249.99,
    category: 'Seeds',
    subcategory: 'Vegetable Seeds',
    brand: 'GrowBrand',
    quantity: 75,
    images: ['https://images.unsplash.com/photo-1583663848850-46af132dc08e?w=300&h=300&fit=crop'],
    in_stock: true,
    rating: 4.6,
    review_count: 18
  },
  {
    name: 'Cucumber Seeds Pack',
    description: 'Fresh cucumber seeds for crispy homegrown vegetables',
    price: 199.99,
    category: 'Seeds',
    subcategory: 'Vegetable Seeds',
    brand: 'GrowBrand',
    quantity: 120,
    images: ['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=300&fit=crop'],
    in_stock: true,
    rating: 4.7,
    review_count: 32
  },
  {
    name: 'Organic Compost Fertilizer',
    description: 'Rich organic compost for healthy plant growth',
    price: 599.99,
    category: 'Fertilizers',
    subcategory: 'Organic Fertilizers',
    brand: 'EcoGrow',
    quantity: 50,
    images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=300&fit=crop'],
    in_stock: true,
    rating: 4.7,
    review_count: 28
  },
  {
    name: 'Garden Hoe Tool',
    description: 'Durable steel hoe for soil cultivation',
    price: 899.99,
    category: 'Tools & Equipment',
    subcategory: 'Hand Tools',
    brand: 'ToolMaster',
    quantity: 25,
    images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=300&fit=crop'],
    in_stock: true,
    rating: 4.8,
    review_count: 35
  }
];

export async function addTestProducts() {
  try {
    console.log('Adding test products to database...');

    // Check current user
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user:', user?.id || 'Not authenticated');

    // Check if products already exist
    const { data: existingProducts, error: checkError } = await supabase
      .from('products')
      .select('count(*)', { count: 'exact' });

    if (checkError) {
      console.error('Error checking existing products:', checkError);
      console.log('This might be due to RLS policies requiring authentication');
      return false;
    }

    console.log('Existing products count:', existingProducts);

    // If there are already products, don't add test products
    if (existingProducts && existingProducts.length > 0) {
      console.log('Products already exist, skipping test product creation');
      return true;
    }

    // If not authenticated, we can't add products due to RLS
    if (!user) {
      console.log('Not authenticated, cannot add test products');
      return false;
    }

    // Add test products
    const { data, error } = await supabase
      .from('products')
      .insert(testProducts)
      .select();

    if (error) {
      console.error('Error adding test products:', error);
      return false;
    }

    console.log('Successfully added test products:', data?.length);
    return true;

  } catch (error) {
    console.error('Exception adding test products:', error);
    return false;
  }
}

// Note: This function can be called manually when needed
// Auto-execution removed to prevent unnecessary calls
