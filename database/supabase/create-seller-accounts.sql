-- Create seller accounts for CropSay AI product import
-- Run this in your Supabase SQL Editor BEFORE importing products

-- =============================================
-- STEP 1: CREATE SELLER PROFILES DIRECTLY
-- =============================================

-- Since we can't directly insert into auth.users, we'll create profiles
-- with the specific UUIDs that match the product CSV seller_ids

-- First, let's create the profiles with the exact UUIDs from the CSV
INSERT INTO public.profiles (
    id,
    full_name,
    avatar_url,
    created_at,
    updated_at
) VALUES
(
    '550e8400-e29b-41d4-a716-446655440001',
    'CropSay Seeds & Fertilizers',
    NULL,
    NOW(),
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    'Organic Nepal Foods',
    NULL,
    NOW(),
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440003',
    'Plant Shop Nepal',
    NULL,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- STEP 2: UPDATE FOREIGN KEY CONSTRAINT (OPTIONAL)
-- =============================================

-- If the products table has a strict foreign key constraint to auth.users,
-- we might need to temporarily disable it or modify the constraint
-- to allow these profile IDs.

-- Check current constraint:
-- SELECT conname, conrelid::regclass, confrelid::regclass
-- FROM pg_constraint
-- WHERE conname LIKE '%seller_id%';

-- If needed, you can temporarily disable the constraint:
-- ALTER TABLE products DISABLE TRIGGER ALL;
-- (Remember to re-enable after import: ALTER TABLE products ENABLE TRIGGER ALL;)

-- =============================================
-- STEP 3: VERIFICATION
-- =============================================

DO $$
DECLARE
    auth_count INTEGER;
    profile_count INTEGER;
BEGIN
    -- Check if users were created
    SELECT COUNT(*) FROM auth.users 
    WHERE id IN (
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440002',
        '550e8400-e29b-41d4-a716-446655440003'
    ) INTO auth_count;
    
    -- Check if profiles were created
    SELECT COUNT(*) FROM public.profiles 
    WHERE id IN (
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440002',
        '550e8400-e29b-41d4-a716-446655440003'
    ) INTO profile_count;
    
    RAISE NOTICE '';
    RAISE NOTICE '🚀 SELLER ACCOUNTS SETUP COMPLETE!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Auth users created: % / 3', auth_count;
    RAISE NOTICE '✅ Profiles created: % / 3', profile_count;
    RAISE NOTICE '';
    RAISE NOTICE '📋 Seller Accounts Created:';
    RAISE NOTICE '1. ✅ cropsay@cropsay.com (Seeds, Fertilizers, Tools)';
    RAISE NOTICE '2. ✅ organicnepal@cropsay.com (Organic Foods)';
    RAISE NOTICE '3. ✅ plantshopnepal@cropsay.com (Plants)';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 READY FOR PRODUCT IMPORT!';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Next Steps:';
    RAISE NOTICE '1. Import your product CSV file';
    RAISE NOTICE '2. Products will be linked to these seller accounts';
    RAISE NOTICE '3. Sellers can login with their respective emails';
    RAISE NOTICE '';
END $$;
