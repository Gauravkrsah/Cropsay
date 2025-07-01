// Test Supabase connection and product queries
import { supabase } from '@/integrations/supabase/client';

export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');

    // Check authentication status
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Authentication status:', user ? 'Authenticated' : 'Anonymous');

    // Test basic connection - count products
    const { count, error: testError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (testError) {
      console.error('Supabase connection error:', testError);
      console.log('Error details:', {
        message: testError.message,
        code: testError.code,
        hint: testError.hint
      });
      return false;
    }

    console.log('Supabase connection successful. Product count:', count);

    // Test fetching actual products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(5);

    if (productsError) {
      console.error('Error fetching products:', productsError);
      console.log('Products error details:', {
        message: productsError.message,
        code: productsError.code,
        hint: productsError.hint
      });
      return false;
    }

    console.log('Sample products:', products);
    return true;

  } catch (error) {
    console.error('Exception testing Supabase:', error);
    return false;
  }
}

// Call this function to test
if (typeof window !== 'undefined') {
  // Only run in browser environment
  testSupabaseConnection();
}
