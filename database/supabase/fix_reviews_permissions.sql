-- Fix for product reviews view permission issue
-- This file fixes the "permission denied for table users" error

-- Drop the existing view
DROP VIEW IF EXISTS public.product_reviews_view;

-- Create a secure function to get reviews with user information
CREATE OR REPLACE FUNCTION public.get_product_reviews(product_id_param INTEGER)
RETURNS TABLE (
  id UUID,
  product_id INTEGER,
  rating INTEGER,
  review TEXT,
  created_at TIMESTAMPTZ,
  user_id UUID,
  username TEXT,
  avatar_letter TEXT,
  verified_purchase BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pr.id,
    pr.product_id,
    pr.rating,
    pr.review,
    pr.created_at,
    pr.user_id,
    -- Get username from profiles table instead of auth.users
    COALESCE(p.full_name, 'Anonymous') as username,
    -- First character of name for avatar placeholder
    LEFT(COALESCE(p.full_name, 'A'), 1) as avatar_letter,
    -- Check if the user has actually purchased the product
    CASE WHEN EXISTS (
      SELECT 1 
      FROM orders o,
           jsonb_array_elements(o.items) AS item
      WHERE o.user_id = pr.user_id 
        AND (item->>'id')::INTEGER = pr.product_id
    ) THEN TRUE ELSE FALSE END as verified_purchase
  FROM 
    public.product_reviews pr
  LEFT JOIN 
    public.profiles p ON pr.user_id = p.id
  WHERE 
    pr.product_id = product_id_param
  ORDER BY 
    pr.created_at DESC;
END;
$$;

-- Create a simpler view that doesn't depend on auth.users
CREATE OR REPLACE VIEW public.product_reviews_view AS
SELECT 
  pr.id,
  pr.product_id,
  pr.rating,
  pr.review,
  pr.created_at,
  pr.user_id,
  -- Get username from profiles table instead of auth.users
  COALESCE(p.full_name, 'Anonymous') as username,
  -- First character of name for avatar placeholder
  LEFT(COALESCE(p.full_name, 'A'), 1) as avatar_letter,
  -- We'll set verified_purchase to false in the view for simplicity
  -- Use the function above for verified purchase information
  FALSE as verified_purchase
FROM 
  public.product_reviews pr
LEFT JOIN 
  public.profiles p ON pr.user_id = p.id;

-- Grant necessary permissions to the view
GRANT SELECT ON public.product_reviews_view TO authenticated;
GRANT SELECT ON public.product_reviews_view TO anon;

-- Grant execute permissions on the function
GRANT EXECUTE ON FUNCTION public.get_product_reviews(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_product_reviews(INTEGER) TO anon;

-- Update existing policies if they exist
DROP POLICY IF EXISTS "read_reviews_view" ON public.product_reviews_view;

-- Since it's a view, we need to ensure the underlying table policies work
-- The policies on product_reviews table should be sufficient

SELECT 'Product reviews view permissions fixed successfully!' as result;
