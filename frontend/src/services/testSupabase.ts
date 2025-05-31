import { supabase } from '@/integrations/supabase/client';

// This file contains functions to test the Supabase connection
// and diagnose issues with database access

// Test the connection to Supabase
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('profiles').select('count');
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return {
        success: false,
        message: `Connection failed: ${error.message}`,
        error
      };
    }
    
    return {
      success: true,
      message: 'Connection successful',
      data
    };
  } catch (e) {
    console.error('Exception testing Supabase connection:', e);
    return {
      success: false,
      message: `Exception: ${e instanceof Error ? e.message : String(e)}`,
      error: e
    };
  }
}

// Test product table access
export async function testProductsAccess() {
  try {
    console.log('Testing products table access...');
    const { data, error } = await supabase
      .from('products')
      .select('count');
    
    if (error) {
      console.error('Products table access test failed:', error);
      return {
        success: false,
        message: `Product access failed: ${error.message}`,
        error
      };
    }
    
    console.log('Products table access successful:', data);
    return {
      success: true,
      message: 'Products table access successful',
      data
    };
  } catch (e) {
    console.error('Exception testing products access:', e);
    return {
      success: false,
      message: `Exception: ${e instanceof Error ? e.message : String(e)}`,
      error: e
    };
  }
}

// Insert a test product
export async function insertTestProduct() {
  try {
    const testProduct = {
      name: 'Test Product',
      description: 'This is a test product',
      price: 100,
      category: 'Seeds',
      subcategory: 'Vegetable Seeds',
      brand: 'Test Brand',
      seller_id: 'test',
      quantity: 10,
      images: ['https://placeholder.com/150'],
      in_stock: true
    };
    
    const { data, error } = await supabase
      .from('products')
      .insert(testProduct)
      .select();
    
    if (error) {
      console.error('Test product insert failed:', error);
      return {
        success: false,
        message: `Insert failed: ${error.message}`,
        error
      };
    }
    
    console.log('Test product inserted successfully:', data);
    return {
      success: true,
      message: 'Test product inserted successfully',
      data
    };
  } catch (e) {
    console.error('Exception inserting test product:', e);
    return {
      success: false,
      message: `Exception: ${e instanceof Error ? e.message : String(e)}`,
      error: e
    };
  }
}
