/*
 * Supabase configuration file
 * Contains connection strings for various connection types
 */

// Note: The password 'Cropsay@369' is URL encoded as 'Cropsay%40369' to avoid issues with special characters

const directConnection = "postgresql://postgres:Cropsay%40369@db.zhfpcuefguddxtagnzoh.supabase.co:5432/postgres";
const transactionPooler = "postgresql://postgres.zhfpcuefguddxtagnzoh:Cropsay%40369@aws-0-ap-south-1.pooler.supabase.com:6543/postgres";
const sessionPooler = "postgresql://postgres.zhfpcuefguddxtagnzoh:Cropsay%40369@aws-0-ap-south-1.pooler.supabase.com:5432/postgres";

module.exports = { directConnection, transactionPooler, sessionPooler };
