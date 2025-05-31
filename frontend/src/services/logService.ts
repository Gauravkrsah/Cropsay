// Simple logging service to help debug filtering issues

export function logProductCategories(products: any[], title: string = "Products") {
  // Extract unique categories and subcategories
  const categories = new Set<string>();
  const subcategories = new Set<string>();
  const categoryCounts: Record<string, number> = {};
  const subcategoryCounts: Record<string, number> = {};
  
  products.forEach(product => {
    // Handle categories
    if (product.category) {
      const category = String(product.category);
      categories.add(category);
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    }
    
    // Handle subcategories
    if (product.subcategory) {
      const subcategory = String(product.subcategory);
      subcategories.add(subcategory);
      subcategoryCounts[subcategory] = (subcategoryCounts[subcategory] || 0) + 1;
    }
  });
  
  console.group(`${title} - ${products.length} items`);
  console.log('Categories:', Array.from(categories));
  console.log('Category counts:', categoryCounts);
  console.log('Subcategories:', Array.from(subcategories));
  console.log('Subcategory counts:', subcategoryCounts);
  
  // Log normalized values to help catch case/whitespace issues
  console.log('Normalized categories:', Array.from(categories).map(c => c.toLowerCase().trim()));
  console.log('Normalized subcategories:', Array.from(subcategories).map(s => s.toLowerCase().trim()));
  console.groupEnd();
  
  return {
    categories: Array.from(categories),
    subcategories: Array.from(subcategories),
    categoryCounts,
    subcategoryCounts
  };
}
