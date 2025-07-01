import { supabase } from '@/integrations/supabase/client';

export interface ProductReview {
  id: string;
  productId: number;
  userId: string;
  rating: number;
  review?: string | null;
  createdAt: Date;
  username?: string;
  avatarLetter?: string;
  verifiedPurchase?: boolean;
}

// Removed mock review generation as we now use real data from the database

// Get all reviews for a product
export const getProductReviews = async (productId: number | string): Promise<ProductReview[]> => {
  try {
    // Convert productId to number if it's a string
    const numericId = typeof productId === 'string' ? parseInt(productId) : productId;
    
    // Use the RPC function instead of querying the view directly
    const { data, error } = await supabase
      .rpc('get_product_reviews', { product_id_param: numericId });

    if (error) {
      console.error('Error fetching reviews from database:', error);
      return []; // Return empty array instead of mock data
    }

    if (!data || data.length === 0) {
      console.log('No reviews found for product');
      return []; // Return empty array instead of mock data
    }

    // Format the reviews from the database
    return data.map(item => ({
      id: item.id,
      productId: item.product_id,
      userId: item.user_id,
      rating: item.rating,
      review: item.review,
      createdAt: new Date(item.created_at),
      username: item.username || 'Anonymous',
      avatarLetter: item.avatar_letter || 'A',
      verifiedPurchase: item.verified_purchase || false
    }));
  } catch (error) {
    console.error('Error in getProductReviews:', error);
    // Return empty array as fallback
    return [];
  }
};

// Check if user has already reviewed a product
export const hasUserReviewedProduct = async (userId: string, productId: number | string): Promise<boolean> => {
  try {
    // Check if we have a valid user ID first
    if (!userId) {
      return false;
    }
    
    // Convert productId to number if it's a string
    const numericId = typeof productId === 'string' ? parseInt(productId) : productId;
      const { count, error } = await supabase
      .from('product_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('product_id', numericId);
      
    if (error) {
      console.error('Error checking if user has reviewed product:', error);
      return false;
    }
    
    return count !== null && count > 0;
  } catch (error) {
    console.error('Error in hasUserReviewedProduct:', error);
    return false;
  }
};

// Add a new review
export const addProductReview = async (
  productId: number | string, 
  rating: number, 
  review?: string
): Promise<ProductReview> => {
  try {
    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) {
      throw new Error('User must be logged in to submit a review');
    }
    
    const userId = userData.user.id;
    
    // Convert productId to number if it's a string
    const numericProductId = typeof productId === 'string' ? parseInt(productId) : productId;    // Insert the review into the product_reviews table
    const { data, error } = await supabase
      .from('product_reviews')
      .insert([{
        product_id: numericProductId,
        user_id: userId,
        rating,
        review: review || null
      }])
      .select('*')
      .single();
      
    if (error) {
      console.error('Error saving review to database:', error);
      throw new Error(error.message || 'Failed to save review to database');
    }
      // Return the newly created review
    return {
      id: String(data.id),
      productId: data.product_id,
      userId: data.user_id,
      rating: data.rating,
      review: data.review,
      createdAt: new Date(data.created_at),
      username: 'You', // Frontend display name
      avatarLetter: 'Y',
      verifiedPurchase: true
    };
  } catch (error: any) {
    console.error('Error in addProductReview:', error);
    throw new Error(error.message || 'Failed to add product review');
  }
};

// Update an existing review
export const updateProductReview = async (
  reviewId: string,
  rating: number,
  review?: string
): Promise<ProductReview> => {
  try {
    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Get the current user
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) {
      throw new Error('User must be logged in to update a review');
    }
    
    const userId = userData.user.id;
    
    // Update the review in the database
    const { data, error } = await supabase
      .from('product_reviews')
      .update({
        rating,
        review: review || null
      })
      .eq('id', reviewId)
      .eq('user_id', userId) // Ensure the user can only update their own reviews
      .select('*')
      .single();
      
    if (error) {
      console.error('Error updating review in database:', error);
      throw new Error(error.message || 'Failed to update review in database');
    }
    
    // Return the updated review
    return {
      id: String(data.id),
      productId: data.product_id,
      userId: data.user_id,
      rating: data.rating,
      review: data.review,
      createdAt: new Date(data.created_at),
      username: 'You', // Frontend display name
      avatarLetter: 'Y',
      verifiedPurchase: true
    };
  } catch (error: any) {
    console.error('Error in updateProductReview:', error);
    throw new Error(error.message || 'Failed to update product review');
  }
};

// Delete a review
export const deleteProductReview = async (reviewId: string): Promise<void> => {
  try {
    // Get the current user
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) {
      throw new Error('User must be logged in to delete a review');
    }
    
    const userId = userData.user.id;
    
    // Delete the review from the database
    const { error } = await supabase
      .from('product_reviews')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', userId); // Ensure the user can only delete their own reviews
      
    if (error) {
      console.error('Error deleting review from database:', error);
      throw new Error(error.message || 'Failed to delete review from database');
    }
    
    return Promise.resolve();
  } catch (error: any) {
    console.error('Error in deleteProductReview:', error);
    throw new Error(error.message || 'Failed to delete product review');
  }
};
