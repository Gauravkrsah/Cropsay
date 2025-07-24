/**
 * Shop Page Filtering Test Script
 * 
 * This script tests the product filtering functionality to ensure all products
 * are properly displayed with their exact quantities and types.
 */

import { filterProducts } from '../data/productData';
import { getProductsByCategory } from '../services/productService';

// Mock products for testing
const mockProducts = [
  {
    id: 1,
    name: "Lucky Bamboo",
    category: "Plants & Gardening",
    subcategory: "Indoor Plants",
    price: 850,
    inStock: true
  },
  {
    id: 2,
    name: "King Palm",
    category: "Plants & Gardening",
    subcategory: "Indoor Plants",
    price: 1000,
    inStock: true
  },
  {
    id: 3,
    name: "Areca Palm",
    category: "Plants & Gardening",
    subcategory: "Outdoor Plants",
    price: 1000,
    inStock: true
  },
  {
    id: 4,
    name: "Sansevieria Superba",
    category: "Plants & gardening", // Note the lowercase 'g' to test case insensitivity
    subcategory: "Indoor plants", // Note the lowercase 'p' to test case insensitivity
    price: 500,
    inStock: true
  },
  {
    id: 5,
    name: "Rhapis Palm",
    category: "Plants & Gardening",
    subcategory: "Outdoor Plants",
    price: 3500,
    inStock: true
  }
];

// Test cases
const testCases = [
  {
    name: "All Products",
    filters: {},
    expectedCount: 5
  },
  {
    name: "Plants & Gardening category",
    filters: { category: "Plants & Gardening" },
    expectedCount: 5
  },
  {
    name: "Plants & Gardening with case-insensitive matching",
    filters: { 
      category: "Plants & Gardening", 
      useCaseInsensitiveMatch: true 
    },
    expectedCount: 5
  },
  {
    name: "Indoor Plants subcategory",
    filters: { 
      category: "Plants & Gardening", 
      subcategory: "Indoor Plants" 
    },
    expectedCount: 2
  },
  {
    name: "Indoor Plants with case-insensitive matching",
    filters: { 
      category: "Plants & Gardening", 
      subcategory: "Indoor Plants",
      useCaseInsensitiveMatch: true 
    },
    expectedCount: 3
  },
  {
    name: "Outdoor Plants subcategory",
    filters: { 
      category: "Plants & Gardening", 
      subcategory: "Outdoor Plants" 
    },
    expectedCount: 2
  },
  {
    name: "Partial category matching",
    filters: { 
      category: "Plants", 
      usePartialMatching: true 
    },
    expectedCount: 5
  },
  {
    name: "Partial subcategory matching",
    filters: { 
      category: "Plants & Gardening",
      subcategory: "Indoor", 
      usePartialMatching: true 
    },
    expectedCount: 3
  }
];

// Run tests
function runTests() {
  console.log("=== SHOP PAGE FILTERING TESTS ===");
  
  let passedTests = 0;
  
  testCases.forEach(testCase => {
    console.log(`\nTesting: ${testCase.name}`);
    console.log(`Filters: ${JSON.stringify(testCase.filters)}`);
    
    const filteredProducts = filterProducts(mockProducts, testCase.filters);
    const actualCount = filteredProducts.length;
    
    console.log(`Expected count: ${testCase.expectedCount}`);
    console.log(`Actual count: ${actualCount}`);
    
    if (actualCount === testCase.expectedCount) {
      console.log("✅ TEST PASSED");
      passedTests++;
    } else {
      console.log("❌ TEST FAILED");
      console.log("Filtered products:", filteredProducts);
    }
  });
  
  console.log(`\n=== TEST SUMMARY ===`);
  console.log(`${passedTests} of ${testCases.length} tests passed`);
  
  if (passedTests === testCases.length) {
    console.log("✅ ALL TESTS PASSED");
  } else {
    console.log("❌ SOME TESTS FAILED");
  }
}

// Instructions for manual testing in the browser
console.log(`
=== MANUAL TESTING INSTRUCTIONS ===

To test the shop page filtering in the browser:

1. Navigate to the Shop page
2. Test the following scenarios:
   - View all products (should show all 35 products)
   - Select "Plants & Gardening" category (should show all plants)
   - Select "Indoor Plants" subcategory (should show only indoor plants)
   - Select "Outdoor Plants" subcategory (should show only outdoor plants)
   - Select other categories and subcategories to verify correct filtering
   
3. Verify that:
   - The product count is accurate for each category/subcategory
   - All products are displayed with their correct types
   - The filtering system correctly handles case differences
   - Products are properly categorized
`);

// Export for use in Node.js environment
export default runTests;

// Auto-run if executed directly
if (typeof window !== 'undefined') {
  runTests();
}