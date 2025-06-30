-- Fix RLS policies for products table to allow public read access
-- This allows anyone to read products but only authenticated users can create/update/delete

-- Enable RLS on products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Products are publicly readable" ON public.products;
DROP POLICY IF EXISTS "Users can insert their own products" ON public.products;
DROP POLICY IF EXISTS "Users can update their own products" ON public.products;
DROP POLICY IF EXISTS "Users can delete their own products" ON public.products;

-- Create policy for public read access
CREATE POLICY "Products are publicly readable" ON public.products
  FOR SELECT USING (true);

-- Create policy for authenticated users to insert products
CREATE POLICY "Users can insert their own products" ON public.products
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- Create policy for users to update their own products
CREATE POLICY "Users can update their own products" ON public.products
  FOR UPDATE USING (auth.uid() = seller_id);

-- Create policy for users to delete their own products
CREATE POLICY "Users can delete their own products" ON public.products
  FOR DELETE USING (auth.uid() = seller_id);

-- Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'products';

-- Test query to ensure public read access works
SELECT COUNT(*) as product_count FROM public.products;
