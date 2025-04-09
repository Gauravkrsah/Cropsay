/*
 * Supabase configuration file
 * Contains connection strings and API credentials
 */

// Note: The password is URL encoded to avoid issues with special characters
// Connection strings for raw database access
export const directConnection = "postgresql://postgres:Crospay%40369@db.zhfpcuefguddxtagnzoh.supabase.co:5432/postgres";
export const transactionPooler = "postgresql://postgres.zhfpcuefguddxtagnzoh:Crospay%40369@aws-0-ap-south-1.pooler.supabase.com:6543/postgres";
export const sessionPooler = "postgresql://postgres.zhfpcuefguddxtagnzoh:Crospay%40369@aws-0-ap-south-1.pooler.supabase.com:5432/postgres";

// Supabase project details for REST API access
export const supabaseUrl = 'https://zhfpcuefguddxtagnzoh.supabase.co';
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoZnBjdWVmZ3VkZHh0YWduem9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwMTAzODgsImV4cCI6MjA1OTU4NjM4OH0.ZTp94JLNS5oYIRBr6TGrnVYJDnWd8LMc8FaxfBjqkec';
