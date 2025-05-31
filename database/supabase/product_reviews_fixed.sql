-- Product Reviews SQL setup for Supabase
-- This file sets up the tables and functions needed for the product review system

-- Create a table for product reviews
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id INTEGER NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Each user can only review a product once
  CONSTRAINT unique_user_product_review UNIQUE (user_id, product_id)
);

-- Create an index for faster lookups when displaying reviews
CREATE INDEX IF NOT EXISTS product_reviews_product_id_idx ON public.product_reviews(product_id);

-- Add review_count and rating columns to products table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'products'::regclass AND attname = 'review_count') THEN
    ALTER TABLE products ADD COLUMN review_count INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'products'::regclass AND attname = 'rating') THEN
    ALTER TABLE products ADD COLUMN rating NUMERIC(3,1) DEFAULT 0;
  END IF;
END $$;

-- Add a function to calculate average product ratings
CREATE OR REPLACE FUNCTION update_product_rating() 
RETURNS TRIGGER AS $$
BEGIN
  -- Update the product's average rating
  UPDATE products
  SET 
    rating = (
      SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0)
      FROM product_reviews 
      WHERE product_id = NEW.product_id
    ),
    review_count = (
      SELECT COUNT(*)
      FROM product_reviews 
      WHERE product_id = NEW.product_id
    )
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update product ratings when reviews are added, updated or deleted
DROP TRIGGER IF EXISTS update_product_rating_trigger ON product_reviews;
CREATE TRIGGER update_product_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON product_reviews
FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- Create a function to check if a user has purchased a product
-- Modified to work with JSONB items array in orders table
CREATE OR REPLACE FUNCTION has_purchased_product(user_uuid UUID, product_id INTEGER) 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM orders o,
         jsonb_array_elements(o.items) AS item
    WHERE o.user_id = user_uuid 
      AND (item->>'id')::INTEGER = product_id
  );
END;
$$ LANGUAGE plpgsql;

-- Create a view to get reviews with user information but without exposing sensitive details
-- Using profiles.full_name instead of username which was causing the error
CREATE OR REPLACE VIEW public.product_reviews_view AS
SELECT 
  pr.id,
  pr.product_id,
  pr.rating,
  pr.review,
  pr.created_at,
  u.id as user_id,
  -- Only include minimal user information, no personal details
  COALESCE(p.full_name, 'Anonymous') as username,
  -- First character of name for avatar placeholder
  LEFT(COALESCE(p.full_name, 'A'), 1) as avatar_letter,
  -- Verify if the user has actually purchased the product
  -- Modified to work with JSONB items array in orders table
  CASE WHEN EXISTS (
    SELECT 1 
    FROM orders o,
         jsonb_array_elements(o.items) AS item
    WHERE o.user_id = u.id 
      AND (item->>'id')::INTEGER = pr.product_id
  ) THEN TRUE ELSE FALSE END as verified_purchase
FROM 
  product_reviews pr
JOIN 
  auth.users u ON pr.user_id = u.id
LEFT JOIN 
  public.profiles p ON u.id = p.id;

-- Create a secure RLS policy for reviews
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews
CREATE POLICY read_reviews ON public.product_reviews 
  FOR SELECT USING (true);

-- Only users who purchased the product can insert reviews
CREATE POLICY insert_reviews ON public.product_reviews 
  FOR INSERT TO authenticated 
  WITH CHECK (
    has_purchased_product(auth.uid(), product_id) AND 
    user_id = auth.uid()
  );

-- Users can only update their own reviews
CREATE POLICY update_reviews ON public.product_reviews 
  FOR UPDATE TO authenticated 
  USING (user_id = auth.uid());

-- Users can only delete their own reviews
CREATE POLICY delete_reviews ON public.product_reviews 
  FOR DELETE TO authenticated 
  USING (user_id = auth.uid());
