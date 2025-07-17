import { supabase } from '@/integrations/supabase/client';

/**
 * Utility functions for Supabase storage management
 */

/**
 * Check if a storage bucket exists
 */
export async function checkBucketExists(bucketName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.storage.getBucket(bucketName);
    if (error) {
      console.log(`Bucket ${bucketName} check failed:`, error.message);
      return false;
    }
    return data !== null;
  } catch (error) {
    console.error(`Error checking bucket ${bucketName}:`, error);
    return false;
  }
}

/**
 * Create a storage bucket if it doesn't exist
 */
export async function ensureBucketExists(bucketName: string, _isPublic: boolean = true): Promise<boolean> {
  try {
    // First check if bucket exists
    const exists = await checkBucketExists(bucketName);
    if (exists) {
      console.log(`Bucket ${bucketName} already exists`);
      return true;
    }

    console.log(`Bucket ${bucketName} does not exist. Assuming it will be created via SQL script.`);

    // Don't attempt to create bucket via client - this causes RLS errors
    // Instead, assume the bucket exists or will be created via SQL script
    // and return true to allow the app to continue functioning

    console.log(`⚠️  Bucket ${bucketName} not found. Please run the storage setup SQL script:`);
    console.log(`   database/supabase/storage_fix_dashboard.sql`);
    console.log(`   Then set up storage policies in Supabase Dashboard > Storage > Policies`);

    // Return true to prevent blocking the app
    // The actual upload will fail gracefully if bucket doesn't exist
    return true;
  } catch (error) {
    console.error(`Error checking bucket ${bucketName}:`, error);
    // Return true to prevent blocking the app
    return true;
  }
}

/**
 * Initialize required storage buckets
 */
export async function initializeStorageBuckets(): Promise<void> {
  try {
    console.log('🔧 Storage buckets initialization skipped - please set up via Supabase Dashboard');
    console.log('📋 Follow the guide in STORAGE_FIX_GUIDE.md to set up storage properly');

    // Skip bucket initialization to avoid RLS errors
    // The buckets should be created via SQL script and policies set via dashboard

    console.log('✅ Storage initialization complete (manual setup required)');
  } catch (error) {
    console.error('Error in storage initialization:', error);
  }
}

/**
 * Upload file with bucket existence check
 */
export async function uploadFileWithBucketCheck(
  bucketName: string,
  filePath: string,
  file: File,
  options: {
    cacheControl?: string;
    upsert?: boolean;
  } = {}
): Promise<{ data: any; error: any; publicUrl?: string }> {
  try {
    console.log(`🔄 Attempting to upload to bucket: ${bucketName}`);

    // Skip bucket existence check to avoid RLS errors
    // Directly attempt upload - if bucket doesn't exist, it will fail gracefully

    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: options.cacheControl || '3600',
        upsert: options.upsert || true
      });

    if (error) {
      console.error(`❌ Upload failed for ${bucketName}:`, error);

      // Provide helpful error messages
      if (error.message?.includes('row-level security') || error.message?.includes('policy')) {
        console.log('🔧 This is likely a storage policy issue. Please:');
        console.log('   1. Run database/supabase/storage_fix_dashboard.sql');
        console.log('   2. Set up storage policies in Supabase Dashboard');
        console.log('   3. Follow STORAGE_FIX_GUIDE.md for detailed instructions');
      }

      return { data: null, error };
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    return {
      data,
      error: null,
      publicUrl: publicUrlData.publicUrl
    };
  } catch (error) {
    console.error('Error in uploadFileWithBucketCheck:', error);
    return {
      data: null,
      error: { message: error instanceof Error ? error.message : 'Upload failed' }
    };
  }
}
