-- Comprehensive fix for CropsayAI multivendor system
-- Run this in the Supabase SQL Editor to fix all database issues at once

-- STEP 1: Create or update the products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'products'
  ) THEN
    -- Create the products table if it doesn't exist
    CREATE TABLE public.products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price NUMERIC NOT NULL,
      category TEXT NOT NULL,
      subcategory TEXT NOT NULL,
      brand TEXT NOT NULL,
      seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL DEFAULT 0,
      images TEXT[] NOT NULL DEFAULT '{}',
      in_stock BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    
    RAISE NOTICE 'Created products table with seller_id column';
  ELSE
    -- Check if the seller_id column exists
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'products' 
      AND column_name = 'seller_id'
    ) THEN
      -- Add the seller_id column if it doesn't exist
      ALTER TABLE public.products 
      ADD COLUMN seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
      
      RAISE NOTICE 'Added seller_id column to existing products table';
    ELSE
      RAISE NOTICE 'The products table already has a seller_id column';
    END IF;
  END IF;
END $$;

-- STEP 2: Create an updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_updated_at_products ON public.products;
CREATE TRIGGER set_updated_at_products
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- STEP 3: Create product storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', TRUE)
ON CONFLICT (id) DO NOTHING;

-- STEP 4: Set up storage bucket policies
-- Allow authenticated users to upload product images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage'
    AND policyname = 'Authenticated users can upload product images'
  ) THEN
    CREATE POLICY "Authenticated users can upload product images"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'product-images' AND owner = auth.uid());
  END IF;

  -- Allow authenticated users to update their own product images
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage'
    AND policyname = 'Users can update their own product images'
  ) THEN
    CREATE POLICY "Users can update their own product images"
    ON storage.objects FOR UPDATE TO authenticated
    USING (bucket_id = 'product-images' AND owner = auth.uid());
  END IF;

  -- Allow authenticated users to delete their own product images
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage'
    AND policyname = 'Users can delete their own product images'
  ) THEN
    CREATE POLICY "Users can delete their own product images"
    ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'product-images' AND owner = auth.uid());
  END IF;

  -- Allow public read access to all product images
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage'
    AND policyname = 'Public can view all product images'
  ) THEN
    CREATE POLICY "Public can view all product images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'product-images');
  END IF;
END $$;

-- STEP 5: Set up Row Level Security for products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can read products" ON public.products;
DROP POLICY IF EXISTS "Sellers can insert their own products" ON public.products;
DROP POLICY IF EXISTS "Sellers can update their own products" ON public.products;
DROP POLICY IF EXISTS "Sellers can delete their own products" ON public.products;

-- Create updated policies
CREATE POLICY "Anyone can read products" 
  ON public.products FOR SELECT 
  USING (TRUE);
  
CREATE POLICY "Sellers can insert their own products" 
  ON public.products FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own products" 
  ON public.products FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);
  
CREATE POLICY "Sellers can delete their own products" 
  ON public.products FOR DELETE 
  TO authenticated 
  USING (auth.uid() = seller_id);

-- STEP 6: Create functions for product management
-- Function to create or update a product
DROP FUNCTION IF EXISTS public.create_or_update_product(TEXT, TEXT, NUMERIC, TEXT, TEXT, TEXT, INTEGER, TEXT[], INT);
CREATE OR REPLACE FUNCTION public.create_or_update_product(
  product_name TEXT,
  product_description TEXT,
  product_price NUMERIC,
  product_category TEXT,
  product_subcategory TEXT,
  product_brand TEXT,
  product_quantity INTEGER,
  product_images TEXT[],
  product_id INT DEFAULT NULL
)
RETURNS public.products
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_product public.products;
BEGIN
  IF product_quantity <= 0 THEN
    RAISE EXCEPTION 'Product quantity must be greater than 0';
  END IF;

  -- If product_id is provided, try to update an existing product
  IF product_id IS NOT NULL THEN
    UPDATE public.products
    SET
      name = product_name,
      description = product_description,
      price = product_price,
      category = product_category,
      subcategory = product_subcategory,
      brand = product_brand,
      quantity = product_quantity,
      images = product_images,
      in_stock = TRUE,
      updated_at = NOW()
    WHERE id = product_id AND seller_id = auth.uid()
    RETURNING * INTO new_product;
    
    IF new_product IS NOT NULL THEN
      RETURN new_product;
    END IF;
  END IF;

  -- If no product_id provided or no matching product found, create a new one
  INSERT INTO public.products (
    name,
    description,
    price,
    category,
    subcategory,
    brand,
    seller_id,
    quantity,
    images,
    in_stock
  ) VALUES (
    product_name,
    product_description,
    product_price,
    product_category,
    product_subcategory,
    product_brand,
    auth.uid(),
    product_quantity,
    product_images,
    TRUE
  )
  RETURNING * INTO new_product;
  
  RETURN new_product;
END;
$$;

-- Function to get seller's products
DROP FUNCTION IF EXISTS public.get_seller_products();
CREATE OR REPLACE FUNCTION public.get_seller_products()
RETURNS SETOF public.products
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.products
  WHERE seller_id = auth.uid()
  ORDER BY created_at DESC;
$$;

-- Function to count a specific seller's products
DROP FUNCTION IF EXISTS public.count_seller_products(UUID);
CREATE OR REPLACE FUNCTION public.count_seller_products(seller_id_param UUID)
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::integer FROM public.products
  WHERE seller_id = seller_id_param;
$$;

-- Function to update product quantity
DROP FUNCTION IF EXISTS public.update_product_quantity(INTEGER, INTEGER);
CREATE OR REPLACE FUNCTION public.update_product_quantity(
  product_id INTEGER,
  new_quantity INTEGER
)
RETURNS public.products
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_product public.products;
BEGIN
  IF new_quantity < 0 THEN
    RAISE EXCEPTION 'Product quantity cannot be negative';
  END IF;

  UPDATE public.products
  SET 
    quantity = new_quantity,
    in_stock = new_quantity > 0,
    updated_at = NOW()
  WHERE id = product_id AND seller_id = auth.uid()
  RETURNING * INTO updated_product;
  
  IF updated_product IS NULL THEN
    RAISE EXCEPTION 'Product not found or you do not have permission to update it';
  END IF;
  
  RETURN updated_product;
END;
$$;

-- Success message
SELECT 'CropsayAI multivendor database configuration completed successfully!' as result;

-- STEP 7: Add search function for products
DROP FUNCTION IF EXISTS public.search_products(TEXT);
CREATE OR REPLACE FUNCTION public.search_products(search_term TEXT)
RETURNS SETOF public.products
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.products
  WHERE 
    name ILIKE '%' || search_term || '%' OR
    description ILIKE '%' || search_term || '%' OR
    category ILIKE '%' || search_term || '%' OR
    subcategory ILIKE '%' || search_term || '%' OR
    brand ILIKE '%' || search_term || '%'
  ORDER BY 
    CASE WHEN name ILIKE '%' || search_term || '%' THEN 0
         WHEN brand ILIKE '%' || search_term || '%' THEN 1
         WHEN category ILIKE '%' || search_term || '%' THEN 2
         WHEN subcategory ILIKE '%' || search_term || '%' THEN 3
         ELSE 4
    END,
    created_at DESC;
$$;

-- STEP 8: Add function to get newest products
DROP FUNCTION IF EXISTS public.get_newest_products(INTEGER);
CREATE OR REPLACE FUNCTION public.get_newest_products(max_count INTEGER DEFAULT 10)
RETURNS SETOF public.products
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.products
  WHERE in_stock = TRUE
  ORDER BY created_at DESC
  LIMIT max_count;
$$;

-- Add category-based product search
DROP FUNCTION IF EXISTS public.get_products_by_category(TEXT, INTEGER);
CREATE OR REPLACE FUNCTION public.get_products_by_category(category_name TEXT, max_count INTEGER DEFAULT 20)
RETURNS SETOF public.products
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.products
  WHERE category = category_name AND in_stock = TRUE
  ORDER BY created_at DESC
  LIMIT max_count;
$$;

-- Final success message
SELECT 'CropsayAI multivendor database and search functions configured successfully!' as result;

-- STEP 9: Add function to get best selling products (highest rated with most reviews)
DROP FUNCTION IF EXISTS public.get_best_selling_products(INTEGER);
CREATE OR REPLACE FUNCTION public.get_best_selling_products(max_count INTEGER DEFAULT 8)
RETURNS SETOF public.products
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.products
  WHERE in_stock = TRUE 
    AND rating IS NOT NULL 
    AND rating > 0
    AND review_count IS NOT NULL 
    AND review_count > 0
  ORDER BY 
    rating DESC, 
    review_count DESC, 
    created_at DESC
  LIMIT max_count;
$$;

-- If no products have ratings yet, fall back to newest products
DROP FUNCTION IF EXISTS public.get_best_selling_products_fallback(INTEGER);
CREATE OR REPLACE FUNCTION public.get_best_selling_products_fallback(max_count INTEGER DEFAULT 8)
RETURNS SETOF public.products
LANGUAGE sql
SECURITY DEFINER
AS $$
  -- First try to get products with ratings
  WITH rated_products AS (
    SELECT * FROM public.products
    WHERE in_stock = TRUE 
      AND rating IS NOT NULL 
      AND rating > 0
    ORDER BY 
      rating DESC, 
      review_count DESC NULLS LAST, 
      created_at DESC
    LIMIT max_count
  ),
  fallback_products AS (
    SELECT * FROM public.products
    WHERE in_stock = TRUE
    ORDER BY created_at DESC
    LIMIT max_count
  )
  SELECT * FROM rated_products
  UNION ALL
  SELECT * FROM fallback_products
  WHERE NOT EXISTS (SELECT 1 FROM rated_products)
  LIMIT max_count;
$$;

-- Final success message with best sellers
SELECT 'CropsayAI database with best sellers function configured successfully!' as result;
