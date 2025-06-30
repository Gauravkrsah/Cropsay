-- Sample products for CropsayAI
-- Run this to add sample products to the database

-- First, let's create a sample user if one doesn't exist (for testing)
-- Note: In production, products should be created by actual authenticated users

-- Insert sample products (using a dummy seller_id - replace with actual user ID)
-- You'll need to replace 'your-user-id-here' with an actual user UUID from auth.users

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
  in_stock,
  rating,
  review_count
) VALUES 
-- Seeds
('Premium Tomato Seeds', 'High-yield hybrid tomato seeds perfect for home gardens', 299.99, 'Seeds', 'Vegetable Seeds', 'GrowBrand', (SELECT id FROM auth.users LIMIT 1), 100, ARRAY['https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=300&h=300&fit=crop'], true, 4.8, 25),
('Chili Pepper Seeds', 'Spicy chili pepper seeds for hot sauce enthusiasts', 249.99, 'Seeds', 'Vegetable Seeds', 'GrowBrand', (SELECT id FROM auth.users LIMIT 1), 75, ARRAY['https://images.unsplash.com/photo-1583663848850-46af132dc08e?w=300&h=300&fit=crop'], true, 4.6, 18),
('Cucumber Seeds Pack', 'Fresh cucumber seeds for crispy homegrown vegetables', 199.99, 'Seeds', 'Vegetable Seeds', 'GrowBrand', (SELECT id FROM auth.users LIMIT 1), 120, ARRAY['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=300&fit=crop'], true, 4.7, 32),
('Carrot Seeds', 'Sweet and crunchy carrot seeds for healthy gardens', 179.99, 'Seeds', 'Vegetable Seeds', 'GrowBrand', (SELECT id FROM auth.users LIMIT 1), 90, ARRAY['https://images.unsplash.com/photo-1445282768818-728615cc910a?w=300&h=300&fit=crop'], true, 4.5, 14),
('Lettuce Seeds Mix', 'Mixed variety lettuce seeds for fresh salads', 159.99, 'Seeds', 'Vegetable Seeds', 'GrowBrand', (SELECT id FROM auth.users LIMIT 1), 80, ARRAY['https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&h=300&fit=crop'], true, 4.9, 41),

-- Fertilizers
('Organic Compost Fertilizer', 'Rich organic compost for healthy plant growth', 599.99, 'Fertilizers', 'Organic Fertilizers', 'EcoGrow', (SELECT id FROM auth.users LIMIT 1), 50, ARRAY['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=300&fit=crop'], true, 4.7, 28),
('NPK Balanced Fertilizer', 'Complete NPK fertilizer for all-purpose gardening', 449.99, 'Fertilizers', 'Chemical Fertilizers', 'ChemGrow', (SELECT id FROM auth.users LIMIT 1), 60, ARRAY['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=300&fit=crop'], true, 4.4, 22),
('Liquid Plant Food', 'Fast-acting liquid fertilizer for quick results', 349.99, 'Fertilizers', 'Liquid Fertilizers', 'QuickGrow', (SELECT id FROM auth.users LIMIT 1), 40, ARRAY['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=300&fit=crop'], true, 4.6, 19),

-- Tools & Equipment
('Garden Hoe Tool', 'Durable steel hoe for soil cultivation', 899.99, 'Tools & Equipment', 'Hand Tools', 'ToolMaster', (SELECT id FROM auth.users LIMIT 1), 25, ARRAY['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=300&fit=crop'], true, 4.8, 35),
('Pruning Shears', 'Sharp pruning shears for plant maintenance', 649.99, 'Tools & Equipment', 'Hand Tools', 'ToolMaster', (SELECT id FROM auth.users LIMIT 1), 30, ARRAY['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=300&fit=crop'], true, 4.7, 27),
('Watering Can 5L', 'Large capacity watering can for garden irrigation', 399.99, 'Tools & Equipment', 'Watering Tools', 'GardenPro', (SELECT id FROM auth.users LIMIT 1), 35, ARRAY['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=300&fit=crop'], true, 4.5, 16),

-- Pesticides
('Organic Neem Oil', 'Natural pest control solution for organic farming', 299.99, 'Pesticides', 'Organic Pesticides', 'NaturalGuard', (SELECT id FROM auth.users LIMIT 1), 45, ARRAY['https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=300&h=300&fit=crop'], true, 4.6, 21),
('Insect Spray', 'Effective insect control spray for garden protection', 399.99, 'Pesticides', 'Insecticides', 'BugAway', (SELECT id FROM auth.users LIMIT 1), 55, ARRAY['https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=300&h=300&fit=crop'], true, 4.3, 13),

-- Irrigation
('Drip Irrigation Kit', 'Complete drip irrigation system for efficient watering', 1299.99, 'Irrigation', 'Drip Systems', 'WaterWise', (SELECT id FROM auth.users LIMIT 1), 20, ARRAY['https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=300&h=300&fit=crop'], true, 4.9, 38),
('Garden Sprinkler', 'Adjustable garden sprinkler for lawn and garden', 799.99, 'Irrigation', 'Sprinklers', 'WaterWise', (SELECT id FROM auth.users LIMIT 1), 15, ARRAY['https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=300&h=300&fit=crop'], true, 4.4, 24);

-- Update the created_at timestamps to have some variety (newest first)
UPDATE public.products SET created_at = NOW() - INTERVAL '1 day' WHERE name LIKE '%Tomato%';
UPDATE public.products SET created_at = NOW() - INTERVAL '2 days' WHERE name LIKE '%Chili%';
UPDATE public.products SET created_at = NOW() - INTERVAL '3 days' WHERE name LIKE '%Cucumber%';
UPDATE public.products SET created_at = NOW() - INTERVAL '4 days' WHERE name LIKE '%Drip%';
UPDATE public.products SET created_at = NOW() - INTERVAL '5 days' WHERE name LIKE '%Organic Compost%';

-- Verify the products were inserted
SELECT COUNT(*) as total_products FROM public.products;
SELECT name, category, price, rating, created_at FROM public.products ORDER BY created_at DESC LIMIT 10;
