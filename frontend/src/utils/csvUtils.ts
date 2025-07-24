import Papa from 'papaparse';

// Define the structure of a product row in the CSV
export interface ProductCSVRow {
  name: string;
  category: string;
  subcategory: string;
  brand: string;
  description: string;
  price: string;
  quantity: string;
  originalPrice: string;
  productType: string; // 'Regular' or 'Organic'
  tags: string; // Comma-separated tags
  imageUrls: string; // Comma-separated URLs
}

// CSV template headers
export const CSV_HEADERS = [
  'name',
  'category',
  'subcategory',
  'brand',
  'description',
  'price',
  'quantity',
  'originalPrice',
  'productType',
  'tags',
  'imageUrls'
];

// Generate a CSV template string
export const generateCSVTemplate = (): string => {
  const headers = CSV_HEADERS.join(',');
  const sampleRow = [
    'Organic Tomato Seeds',
    'Seeds',
    'Vegetable Seeds',
    'GreenThumb',
    'High-quality organic tomato seeds for your garden',
    '250',
    '100',
    '300',
    'Organic',
    'Organic,Premium,Best Seller',
    'https://example.com/image1.jpg,https://example.com/image2.jpg'
  ].join(',');
  
  return `${headers}\n${sampleRow}`;
};

// Parse CSV file
export const parseCSVFile = (file: File): Promise<{data: ProductCSVRow[], errors: any[]}> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve({
          data: results.data as ProductCSVRow[],
          errors: results.errors
        });
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

// Validate CSV data
export const validateCSVData = (data: ProductCSVRow[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check if data is empty
  if (data.length === 0) {
    errors.push('CSV file is empty');
    return { valid: false, errors };
  }
  
  // Validate each row
  data.forEach((row, index) => {
    const rowNum = index + 1;
    
    // Required fields
    if (!row.name) errors.push(`Row ${rowNum}: Product name is required`);
    if (!row.category) errors.push(`Row ${rowNum}: Category is required`);
    if (!row.brand) errors.push(`Row ${rowNum}: Brand is required`);
    if (!row.description) errors.push(`Row ${rowNum}: Description is required`);
    
    // Numeric fields
    if (isNaN(parseFloat(row.price)) || parseFloat(row.price) <= 0) {
      errors.push(`Row ${rowNum}: Price must be a positive number`);
    }
    
    if (isNaN(parseInt(row.quantity)) || parseInt(row.quantity) < 0) {
      errors.push(`Row ${rowNum}: Quantity must be a non-negative integer`);
    }
    
    if (row.originalPrice && (isNaN(parseFloat(row.originalPrice)) || parseFloat(row.originalPrice) <= 0)) {
      errors.push(`Row ${rowNum}: Original price must be a positive number`);
    }
    
    // Product type validation
    if (row.productType && !['Regular', 'Organic'].includes(row.productType)) {
      errors.push(`Row ${rowNum}: Product type must be either 'Regular' or 'Organic'`);
    }
  });
  
  return { valid: errors.length === 0, errors };
};

// Convert CSV row to product form data
export const convertCSVRowToProductForm = (row: ProductCSVRow) => {
  return {
    name: row.name,
    category: row.category,
    subcategory: row.subcategory || '',
    brand: row.brand,
    description: row.description,
    price: parseFloat(row.price) || 0,
    quantity: parseInt(row.quantity) || 0,
    originalPrice: row.originalPrice ? parseFloat(row.originalPrice) : undefined,
    isOrganic: row.productType === 'Organic',
    tags: row.tags ? row.tags.split(',').map(tag => tag.trim()) : [],
    images: row.imageUrls ? row.imageUrls.split(',').map(url => url.trim()) : [],
    plantType: ''
  };
};