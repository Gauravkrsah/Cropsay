/**
 * Comprehensive product data for the shop and recommendation system
 */

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  rating: number;
  category: string;
  subcategory: string;
  brand: string;
  inStock: boolean;
  // Additional fields for database products
  quantity?: number;
  images?: string[];
  sellerId?: string;
  createdAt?: string;
  // New filtering fields
  tags?: string[]; // e.g., ["Organic", "New", "Popular"]
  isOrganic?: boolean;
  plantType?: string; // For plants section only
  originalPrice?: number; // For discount calculations
}

// Expanded product catalog based on the provided data
export const products: Product[] = [
  // Seeds - Vegetable Seeds
  {
    id: 1,
    name: "Chili Seeds",
    description: "The Chili Seeds Pack",
    price: 429.99,
    rating: 4.8,
    category: "Seeds",
    subcategory: "Vegetable Seeds",
    brand: "GrowBrand",
    inStock: true,
    tags: ["Popular", "New"],
    isOrganic: false,
    originalPrice: 499.99,
  },
  {
    id: 2,
    name: "Tomato Seed",
    description: "The Tomato Seed Pack",
    price: 350.0,
    rating: 4.7,
    category: "Seeds",
    subcategory: "Vegetable Seeds",
    brand: "GrowBrand",
    inStock: true,
    tags: ["Best Seller", "Organic"],
    isOrganic: true,
  },
  {
    id: 3,
    name: "Cucumber Seed",
    description: "The Cucumber Seed",
    price: 330.4,
    rating: 4.6,
    category: "Seeds",
    subcategory: "Vegetable Seeds",
    brand: "GrowBrand",
    inStock: true,
    tags: ["Popular"],
    isOrganic: false,
  },
  {
    id: 4,
    name: "Pumpkin Seed",
    description: "The Pumpkin Seed",
    price: 540.0,
    rating: 4.5,
    category: "Seeds",
    subcategory: "Vegetable Seeds",
    brand: "GrowBrand",
    inStock: true,
    tags: ["Premium"],
    isOrganic: false,
    originalPrice: 600.0,
  },
  {
    id: 5,
    name: "Bean Seed",
    description: "The Bean Seed Pack",
    price: 387.7,
    rating: 4.7,
    category: "Seeds",
    subcategory: "Vegetable Seeds",
    brand: "GrowBrand",
    inStock: true,
    tags: ["Organic", "Popular"],
    isOrganic: true,
  },
  {
    id: 6,
    name: "Carrot Seed",
    description: "The Carrot Seed Pack",
    price: 320.0,
    rating: 4.8,
    category: "Seeds",
    subcategory: "Vegetable Seeds",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 7,
    name: "Radish Seed",
    description: "The Radish Seed Pack",
    price: 240.5,
    rating: 4.5,
    category: "Seeds",
    subcategory: "Vegetable Seeds",
    brand: "GrowBrand",
    inStock: true,
  },
  
  // Seeds - Fruit Seeds
  {
    id: 8,
    name: "Watermelon Seed",
    description: "The Watermelon Seed",
    price: 476.99,
    rating: 4.7,
    category: "Seeds",
    subcategory: "Fruit Seeds",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 9,
    name: "Melon Seed",
    description: "The Melon Seed Pack",
    price: 598.0,
    rating: 4.6,
    category: "Seeds",
    subcategory: "Fruit Seeds",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 10,
    name: "Mango Seed",
    description: "The Mango Seed Pack",
    price: 944.25,
    rating: 4.8,
    category: "Seeds",
    subcategory: "Fruit Seeds",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 11,
    name: "Banana Seed",
    description: "The Banana Seed Pack",
    price: 897.5,
    rating: 4.5,
    category: "Seeds",
    subcategory: "Fruit Seeds",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 12,
    name: "Strawberry Seed",
    description: "The Strawberry Seed",
    price: 470.99,
    rating: 4.7,
    category: "Seeds",
    subcategory: "Fruit Seeds",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 13,
    name: "Papaya Seed",
    description: "The Papaya Seed Pack",
    price: 320.5,
    rating: 4.6,
    category: "Seeds",
    subcategory: "Fruit Seeds",
    brand: "GrowBrand",
    inStock: true,
  },
  
  // Seeds - Flower Seeds
  {
    id: 14,
    name: "Sunflower Seed",
    description: "The Sunflower Seed",
    price: 340.0,
    rating: 4.8,
    category: "Seeds",
    subcategory: "Flower Seeds",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 15,
    name: "Chrysanthemum Seed",
    description: "The Chrysanthemum Seed",
    price: 763.01,
    rating: 4.7,
    category: "Seeds",
    subcategory: "Flower Seeds",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 16,
    name: "Petunia Seed",
    description: "The Petunia Seed",
    price: 450.44,
    rating: 4.6,
    category: "Seeds",
    subcategory: "Flower Seeds",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 17,
    name: "Cosmos Seed",
    description: "The Cosmos Seed",
    price: 354.3,
    rating: 4.5,
    category: "Seeds",
    subcategory: "Flower Seeds",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 18,
    name: "Rose Seed",
    description: "The Rose Seed Pack",
    price: 876.8,
    rating: 4.8,
    category: "Seeds",
    subcategory: "Flower Seeds",
    brand: "GrowBrand",
    inStock: true,
  },
  
  // Seeds - Paddy
  {
    id: 19,
    name: "IR-64 Paddy Seed",
    description: "The IR-64 Paddy Seed",
    price: 987.2,
    rating: 4.7,
    category: "Seeds",
    subcategory: "Paddy",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 20,
    name: "Red Paddy Seed",
    description: "The Red Paddy Seed",
    price: 877.45,
    rating: 4.6,
    category: "Seeds",
    subcategory: "Paddy",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 21,
    name: "IRRI-140 Paddy Seed",
    description: "The IRRI-140 Paddy Seed",
    price: 795.98,
    rating: 4.7,
    category: "Seeds",
    subcategory: "Paddy",
    brand: "GrowBrand",
    inStock: true,
  },
  
  // Seeds - Maize/Corn
  {
    id: 22,
    name: "Early Maize Seed",
    description: "The Early Maize Seed",
    price: 548.01,
    rating: 4.6,
    category: "Seeds",
    subcategory: "Maize/Corn",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 23,
    name: "Deuti Maize Seed",
    description: "The Deuti Maize Seed",
    price: 578.75,
    rating: 4.7,
    category: "Seeds",
    subcategory: "Maize/Corn",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 24,
    name: "Manakamana-3 Maize Seed",
    description: "The Manakamana-3 Maize Seed",
    price: 743.76,
    rating: 4.8,
    category: "Seeds",
    subcategory: "Maize/Corn",
    brand: "GrowBrand",
    inStock: true,
  },
  
  // Seeds - Mustard
  {
    id: 25,
    name: "Bev-10 | Mustard Seed",
    description: "The Bev-10 | Mustard Seed",
    price: 612.67,
    rating: 4.7,
    category: "Seeds",
    subcategory: "Mustard",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 26,
    name: "Yellow Mustard Seed",
    description: "The Yellow Mustard Seed",
    price: 387.99,
    rating: 4.6,
    category: "Seeds",
    subcategory: "Mustard",
    brand: "GrowBrand",
    inStock: true,
  },
  
  // Seeds - Forage Seeds
  {
    id: 27,
    name: "Berseem Seed",
    description: "The Berseem Seed",
    price: 382.36,
    rating: 4.5,
    category: "Seeds",
    subcategory: "Forage Seeds",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 28,
    name: "Stylosanthes Sp | Stylo Seed",
    description: "The Stylosanthes Sp | Stylo Seed",
    price: 465.77,
    rating: 4.7,
    category: "Seeds",
    subcategory: "Forage Seeds",
    brand: "GrowBrand",
    inStock: true,
  },
  
  // Fertilizers - Macronutrients
  {
    id: 29,
    name: "NPK 12-12-17",
    description: "The NPK 12-12-17",
    price: 368.42,
    rating: 4.8,
    category: "Fertilizers",
    subcategory: "Macronutrients (NPK)",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 30,
    name: "NPK 19-19-19",
    description: "The NPK 19-19-19",
    price: 414.22,
    rating: 4.7,
    category: "Fertilizers",
    subcategory: "Macronutrients (NPK)",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 31,
    name: "NPK 15-09-20",
    description: "The NPK 15-09-20",
    price: 411.1,
    rating: 4.6,
    category: "Fertilizers",
    subcategory: "Macronutrients (NPK)",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 32,
    name: "NPK 0-00-50",
    description: "The NPK 0-00-50",
    price: 742.56,
    rating: 4.7,
    category: "Fertilizers",
    subcategory: "Macronutrients (NPK)",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 33,
    name: "NPK 0-0-50 DAP",
    description: "The NPK 0-0-50 DAP",
    price: 745.67,
    rating: 4.8,
    category: "Fertilizers",
    subcategory: "Macronutrients (NPK)",
    brand: "GrowBrand",
    inStock: true,
  },
  
  // Fertilizers - Micronutrients
  {
    id: 34,
    name: "Boron",
    description: "The Boron by Novel",
    price: 457.81,
    rating: 4.6,
    category: "Fertilizers",
    subcategory: "Micronutrients",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 35,
    name: "Iron",
    description: "The Iron by Novel",
    price: 543.21,
    rating: 4.7,
    category: "Fertilizers",
    subcategory: "Micronutrients",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 36,
    name: "Manganese Sulphate",
    description: "The Manganese by Novel",
    price: 498.16,
    rating: 4.6,
    category: "Fertilizers",
    subcategory: "Micronutrients",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 37,
    name: "Magnesium Sulphate",
    description: "The Magnesium Sulphate",
    price: 357.96,
    rating: 4.7,
    category: "Fertilizers",
    subcategory: "Micronutrients",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 38,
    name: "Zinc",
    description: "The Zinc for Plants",
    price: 258.8,
    rating: 4.5,
    category: "Fertilizers",
    subcategory: "Micronutrients",
    brand: "GrowBrand",
    inStock: true,
  },
  
  // Fertilizers - Organic Fertilizers
  {
    id: 39,
    name: "Vermicompost",
    description: "The Vermicompost",
    price: 967.54,
    rating: 4.8,
    category: "Fertilizers",
    subcategory: "Organic Fertilizers",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 40,
    name: "Bio-Fert",
    description: "The Bio-Fert by Novel",
    price: 873.96,
    rating: 4.7,
    category: "Fertilizers",
    subcategory: "Organic Fertilizers",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 41,
    name: "Compost",
    description: "The Compost by Eco",
    price: 320.21,
    rating: 4.6,
    category: "Fertilizers",
    subcategory: "Organic Fertilizers",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 42,
    name: "Bone-Meal",
    description: "The Bone-Meal by OrganiGrow",
    price: 643.71,
    rating: 4.5,
    category: "Fertilizers",
    subcategory: "Organic Fertilizers",
    brand: "GrowBrand",
    inStock: true,
  },
  
  // Fertilizers - Biofertilizers
  {
    id: 43,
    name: "Rhizobium Culture",
    description: "The Rhizobium Culture",
    price: 356.25,
    rating: 4.7,
    category: "Fertilizers",
    subcategory: "Biofertilizers",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 44,
    name: "Azotobacter",
    description: "The Azotobacter by Bio",
    price: 759.99,
    rating: 4.8,
    category: "Fertilizers",
    subcategory: "Biofertilizers",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 45,
    name: "PSB",
    description: "The PSB by Novel Eco",
    price: 356.85,
    rating: 4.6,
    category: "Fertilizers",
    subcategory: "Biofertilizers",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 46,
    name: "VAM",
    description: "The VAM by GreenTech",
    price: 642.76,
    rating: 4.7,
    category: "Fertilizers",
    subcategory: "Biofertilizers",
    brand: "GrowBrand",
    inStock: true,
  },
  
  // Fertilizers - Growth Promoters
  {
    id: 47,
    name: "Humic Acid",
    description: "The Humic Acid by Green",
    price: 345.5,
    rating: 4.6,
    category: "Fertilizers",
    subcategory: "Growth Promoters",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 48,
    name: "Amino Acid",
    description: "The Amino Acid by Novel",
    price: 434.99,
    rating: 4.7,
    category: "Fertilizers",
    subcategory: "Growth Promoters",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 49,
    name: "Mycorrhizal",
    description: "The Mycorrhizal by Bio",
    price: 405.75,
    rating: 4.8,
    category: "Fertilizers",
    subcategory: "Growth Promoters",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 50,
    name: "Fulvic Acid",
    description: "The Fulvic Acid by Green",
    price: 358.54,
    rating: 4.6,
    category: "Fertilizers",
    subcategory: "Growth Promoters",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 51,
    name: "GA3",
    description: "The GA3 by NovelTech",
    price: 498.25,
    rating: 4.7,
    category: "Fertilizers",
    subcategory: "Growth Promoters",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 52,
    name: "Auxin",
    description: "The Auxin by Novel",
    price: 354.01,
    rating: 4.5,
    category: "Fertilizers",
    subcategory: "Growth Promoters",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 53,
    name: "Brassinosteroid",
    description: "The Brassinosteroid by Bio",
    price: 641.99,
    rating: 4.7,
    category: "Fertilizers",
    subcategory: "Growth Promoters",
    brand: "GrowBrand",
    inStock: true,
  },
  
  // Pesticides - Insecticides
  {
    id: 54,
    name: "Chlorpyrifos",
    description: "The Chlorpyrifos by Eco",
    price: 175.99,
    rating: 4.6,
    category: "Pesticides",
    subcategory: "Insecticides",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 55,
    name: "Lambda cyhalothrin",
    description: "The Lambda cyhalothrin",
    price: 256.43,
    rating: 4.7,
    category: "Pesticides",
    subcategory: "Insecticides",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 56,
    name: "Thiamethoxam",
    description: "The Thiamethoxam",
    price: 384.37,
    rating: 4.8,
    category: "Pesticides",
    subcategory: "Insecticides",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 57,
    name: "Emamectin",
    description: "The Emamectin",
    price: 357.8,
    rating: 4.6,
    category: "Pesticides",
    subcategory: "Insecticides",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 58,
    name: "Imidacloprid",
    description: "The Imidacloprid by Novel",
    price: 264.44,
    rating: 4.7,
    category: "Pesticides",
    subcategory: "Fungicides",
    brand: "GrowBrand",
    inStock: true,
  },
  
  // Pesticides - Fungicides
  {
    id: 59,
    name: "Mancozeb",
    description: "The Mancozeb by Eco",
    price: 234.44,
    rating: 4.6,
    category: "Pesticides",
    subcategory: "Fungicides",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 60,
    name: "Copper Oxychloride",
    description: "The Copper OxyChloride",
    price: 333.99,
    rating: 4.7,
    category: "Pesticides",
    subcategory: "Fungicides",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 61,
    name: "Carbendazim",
    description: "The Carbendazim",
    price: 248.71,
    rating: 4.5,
    category: "Pesticides",
    subcategory: "Fungicides",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 62,
    name: "Metalaxyl",
    description: "The Metalaxyl by Eco",
    price: 354.75,
    rating: 4.7,
    category: "Pesticides",
    subcategory: "Fungicides",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 63,
    name: "Propiconazole",
    description: "The Propiconazole",
    price: 195.35,
    rating: 4.6,
    category: "Pesticides",
    subcategory: "Fungicides",
    brand: "GrowBrand",
    inStock: true,
  },
  
  // Pesticides - Herbicides
  {
    id: 64,
    name: "Glyphosate",
    description: "The Glyphosate by Eco",
    price: 414.54,
    rating: 4.5,
    category: "Pesticides",
    subcategory: "Herbicides",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 65,
    name: "2,4-D Amine Salt",
    description: "The 2,4-D Amine Salt",
    price: 142.33,
    rating: 4.6,
    category: "Pesticides",
    subcategory: "Herbicides",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 66,
    name: "Atrazine",
    description: "The Atrazine by Novel",
    price: 276.5,
    rating: 4.7,
    category: "Pesticides",
    subcategory: "Herbicides",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 67,
    name: "Pendimethalin",
    description: "The Pendimethalin by Eco",
    price: 354.99,
    rating: 4.6,
    category: "Pesticides",
    subcategory: "Herbicides",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 68,
    name: "Paraquat",
    description: "The Paraquat by Eco",
    price: 262.99,
    rating: 4.5,
    category: "Pesticides",
    subcategory: "Herbicides",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 69,
    name: "Pretilachlor",
    description: "The Pretilachlor by Novel",
    price: 242.86,
    rating: 4.7,
    category: "Pesticides",
    subcategory: "Herbicides",
    brand: "GrowBrand",
    inStock: true,
  },
  
  // Pesticides - Bactericides
  {
    id: 70,
    name: "Copper Sulphate",
    description: "The Copper Sulphate",
    price: 209.33,
    rating: 4.6,
    category: "Pesticides",
    subcategory: "Bactericides",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 71,
    name: "Streptomycin",
    description: "The Streptomycin by Bio",
    price: 786.99,
    rating: 4.8,
    category: "Pesticides",
    subcategory: "Bactericides",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 72,
    name: "Tetracycline",
    description: "The Tetracycline by EcoLab",
    price: 695.5,
    rating: 4.7,
    category: "Pesticides",
    subcategory: "Bactericides",
    brand: "GrowBrand",
    inStock: true,
  },
  
  // Pesticides - Acaricides/Miticides
  {
    id: 73,
    name: "Propargite",
    description: "The Propargite by Novel",
    price: 342.33,
    rating: 4.6,
    category: "Pesticides",
    subcategory: "Acaricides/Miticides",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 74,
    name: "Diafenthiuron",
    description: "The Diafenthiuron by Eco",
    price: 78.37,
    rating: 4.5,
    category: "Pesticides",
    subcategory: "Acaricides/Miticides",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 75,
    name: "Dicofol",
    description: "The Dicofol by Novel",
    price: 115.51,
    rating: 4.4,
    category: "Pesticides",
    subcategory: "Acaricides/Miticides",
    brand: "GrowBrand",
    inStock: true,
  },
  
  // Pesticides - Nematicides
  {
    id: 76,
    name: "Fosthiazate",
    description: "The Fosthiazate by Eco",
    price: 176.99,
    rating: 4.5,
    category: "Pesticides",
    subcategory: "Nematicides",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 77,
    name: "Carbofuran",
    description: "The Carbofuran by Novel",
    price: 244.85,
    rating: 4.6,
    category: "Pesticides",
    subcategory: "Nematicides",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 78,
    name: "Fluensulfone",
    description: "The Fluensulfone by Bio",
    price: 567.8,
    rating: 4.7,
    category: "Pesticides",
    subcategory: "Nematicides",
    brand: "GrowBrand",
    inStock: true,
  },
  
  // Pesticides - Rodenticides
  {
    id: 79,
    name: "Bromadiolone",
    description: "The Bromadiolone by Eco",
    price: 145.99,
    rating: 4.6,
    category: "Pesticides",
    subcategory: "Rodenticides",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 80,
    name: "Zinc Phosphide",
    description: "The Zinc Phosphide",
    price: 135.57,
    rating: 4.5,
    category: "Pesticides",
    subcategory: "Rodenticides",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 81,
    name: "Warfarin",
    description: "The Warfarin by ProLife",
    price: 148.99,
    rating: 4.4,
    category: "Pesticides",
    subcategory: "Rodenticides",
    brand: "GrowBrand",
    inStock: true,
  },
  
  // Tools & Equipment - Harvesters
  {
    id: 82,
    name: "Reaper",
    description: "The Reaper by Novel",
    price: 8701.94,
    rating: 4.8,
    category: "Tools & Equipment",
    subcategory: "Harvesters",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 83,
    name: "Thresher",
    description: "The Thresher by Agri",
    price: 12750.0,
    rating: 4.7,
    category: "Tools & Equipment",
    subcategory: "Harvesters",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 84,
    name: "Rice Harvester",
    description: "The Rice Harvester by Agri",
    price: 18456.99,
    rating: 4.9,
    category: "Tools & Equipment",
    subcategory: "Harvesters",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 85,
    name: "Potato Harvester",
    description: "The Potato Harvester",
    price: 54017.67,
    rating: 4.8,
    category: "Tools & Equipment",
    subcategory: "Harvesters",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 86,
    name: "Power Reaper Mini",
    description: "The Power Reaper by Agri",
    price: 48517.77,
    rating: 4.7,
    category: "Tools & Equipment",
    subcategory: "Harvesters",
    brand: "GrowBrand",
    inStock: true,
  },
  
  // Tools & Equipment - Sprayers
  {
    id: 87,
    name: "Battery Sprayer-2iN1",
    description: "The Battery Sprayer by Agritech",
    price: 17422.37,
    rating: 4.7,
    category: "Tools & Equipment",
    subcategory: "Sprayers",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 88,
    name: "Nano Sprayer-XR",
    description: "The Nano Sprayer by Eco",
    price: 2977.75,
    rating: 4.6,
    category: "Tools & Equipment",
    subcategory: "Sprayers",
    brand: "GrowBrand",
    inStock: true,
  },
  
  // Tools & Equipment - Seeders & Transplanters
  {
    id: 89,
    name: "Manual Transplanter",
    description: "The Manual Transplanter",
    price: 26387.75,
    rating: 4.8,
    category: "Tools & Equipment",
    subcategory: "Seeders & Transplanters",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 90,
    name: "Rice Transplanter",
    description: "The Rice Transplanter",
    price: 18595.65,
    rating: 4.7,
    category: "Tools & Equipment",
    subcategory: "Seeders & Transplanters",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 91,
    name: "Seed Drill",
    description: "The Seed Drill by Novel",
    price: 12426.55,
    rating: 4.6,
    category: "Tools & Equipment",
    subcategory: "Seeders & Transplanters",
    brand: "GrowBrand",
    inStock: true,
  },
  
  // Tools & Equipment - Hand Tools
  {
    id: 92,
    name: "Hoe",
    description: "The Hoe by Novel",
    price: 2622.35,
    rating: 4.5,
    category: "Tools & Equipment",
    subcategory: "Hand Tools",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 93,
    name: "Sickle",
    description: "The Sickle by Agritech",
    price: 1950.31,
    rating: 4.6,
    category: "Tools & Equipment",
    subcategory: "Hand Tools",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 94,
    name: "Spade",
    description: "The Spade by Novel",
    price: 13432.11,
    rating: 4.7,
    category: "Tools & Equipment",
    subcategory: "Hand Tools",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 95,
    name: "Hand Trowel",
    description: "The Hand Trowel by Agri",
    price: 47371.54,
    rating: 4.8,
    category: "Tools & Equipment",
    subcategory: "Hand Tools",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 96,
    name: "Garden Shears",
    description: "The Garden Shears by Novel",
    price: 28222.79,
    rating: 4.7,
    category: "Tools & Equipment",
    subcategory: "Hand Tools",
    brand: "GrowBrand",
    inStock: true,
  },
  
  // Tools & Equipment - Testing & Measurement
  {
    id: 97,
    name: "Moisture Meter",
    description: "The Moisture Meter",
    price: 22222.3,
    rating: 4.6,
    category: "Tools & Equipment",
    subcategory: "Testing & Measurement",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 98,
    name: "Soil pH Meter",
    description: "The Soil pH Meter by Agri",
    price: 3566.89,
    rating: 4.7,
    category: "Tools & Equipment",
    subcategory: "Testing & Measurement",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 99,
    name: "Light Meter",
    description: "The Light Meter by Agri",
    price: 20999.35,
    rating: 4.8,
    category: "Tools & Equipment",
    subcategory: "Testing & Measurement",
    brand: "GrowBrand",
    inStock: true,
  },
  
  // Tools & Equipment - Protective Gear
  {
    id: 100,
    name: "Safety Gloves",
    description: "The Safety Gloves by EcoSafe",
    price: 20992.76,
    rating: 4.7,
    category: "Tools & Equipment",
    subcategory: "Protective Gear",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 101,
    name: "Helmet",
    description: "The Helmet by SafeAgri",
    price: 21423.18,
    rating: 4.6,
    category: "Tools & Equipment",
    subcategory: "Protective Gear",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 102,
    name: "Goggles",
    description: "The Goggles by EcoSafe",
    price: 42625.95,
    rating: 4.5,
    category: "Tools & Equipment",
    subcategory: "Protective Gear",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 103,
    name: "Coverall",
    description: "The Coverall by SafeTech",
    price: 32869.16,
    rating: 4.6,
    category: "Tools & Equipment",
    subcategory: "Protective Gear",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 104,
    name: "Masks",
    description: "The Masks by GreenProtect",
    price: 42645.32,
    rating: 4.7,
    category: "Tools & Equipment",
    subcategory: "Protective Gear",
    brand: "GrowBrand",
    inStock: true,
  },
  
  // Irrigation - Drip Irrigation Kits
  {
    id: 105,
    name: "Flex Sprinkler Kit 25",
    description: "The Flex Sprinkler Kit 25",
    price: 671.99,
    rating: 4.8,
    category: "Irrigation",
    subcategory: "Drip Irrigation Kits",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 106,
    name: "Flex Sprinkler Kit 50",
    description: "The Flex Sprinkler Kit 50",
    price: 989.15,
    rating: 4.7,
    category: "Irrigation",
    subcategory: "Drip Irrigation Kits",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 107,
    name: "Home Drip Kit 100",
    description: "The Home Drip Kit 100",
    price: 532.17,
    rating: 4.6,
    category: "Irrigation",
    subcategory: "Drip Irrigation Kits",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 108,
    name: "Family Drip Kit 250",
    description: "The Family Drip Kit 250",
    price: 742.35,
    rating: 4.7,
    category: "Irrigation",
    subcategory: "Drip Irrigation Kits",
    brand: "GrowBrand",
    inStock: true,
  },
  
  // Irrigation - Sprinkler Kits
  {
    id: 109,
    name: "Micro Sprinkler 100",
    description: "The Micro Sprinkler 100",
    price: 215.35,
    rating: 4.6,
    category: "Irrigation",
    subcategory: "Sprinkler Kits",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 110,
    name: "Overhead Sprinkler",
    description: "The Overhead Sprinkler",
    price: 345.99,
    rating: 4.7,
    category: "Irrigation",
    subcategory: "Sprinkler Kits",
    brand: "GrowBrand",
    inStock: true,
  },
  
  // Irrigation - Portable Drip Kits
  {
    id: 111,
    name: "Drip Kit with Filter",
    description: "The Drip Kit with Filter",
    price: 573.65,
    rating: 4.8,
    category: "Irrigation",
    subcategory: "Portable Drip Kits",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 112,
    name: "EasyDrip Kit Pro",
    description: "The EasyDrip Pro Kit",
    price: 235.76,
    rating: 4.6,
    category: "Irrigation",
    subcategory: "Portable Drip Kits",
    brand: "GrowBrand",
    inStock: true,
  },
  
  // Irrigation - Drip Pipes & Fittings
  {
    id: 113,
    name: "Drip Tape 16mm",
    description: "The Drip Tape 16mm",
    price: 345.65,
    rating: 4.7,
    category: "Irrigation",
    subcategory: "Drip Pipes & Fittings",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 114,
    name: "Sprinkler Pipe",
    description: "The Sprinkler Pipe",
    price: 678.32,
    rating: 4.6,
    category: "Irrigation",
    subcategory: "Drip Pipes & Fittings",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 115,
    name: "High Pressure Spray",
    description: "The High Pressure Spray",
    price: 565.35,
    rating: 4.8,
    category: "Irrigation",
    subcategory: "Sprinkler Kits",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 116,
    name: "Fogger Kit for Plants",
    description: "The Fogger Kit for Plants",
    price: 434.99,
    rating: 4.7,
    category: "Irrigation",
    subcategory: "Sprinkler Kits",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 117,
    name: "Lateral Flow Kit",
    description: "The Lateral Flow Kit",
    price: 315.78,
    rating: 4.6,
    category: "Irrigation",
    subcategory: "Sprinkler Kits",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 118,
    name: "Overhead Sprinkler",
    description: "The Overhead Sprinkler System",
    price: 865.32,
    rating: 4.5,
    category: "Irrigation",
    subcategory: "Sprinkler Kits",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 119,
    name: "Mist Sprayer",
    description: "The Mist Sprayer Kit",
    price: 486.37,
    rating: 4.7,
    category: "Irrigation",
    subcategory: "Sprinkler Kits",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 120,
    name: "Rain Bird Kit",
    description: "The Rain Bird Kit",
    price: 720.5,
    rating: 4.8,
    category: "Irrigation",
    subcategory: "Sprinkler Kits",
    brand: "GrowBrand",
    inStock: true,
  },
  
  // Irrigation - Filters & Valves
  {
    id: 121,
    name: "Portable Kit 50-100 Pts",
    description: "The Portable Kit 50-100 Plants",
    price: 432.99,
    rating: 4.6,
    category: "Irrigation",
    subcategory: "Portable Drip Kits",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 122,
    name: "Portable Kit 100-200 Pts",
    description: "The Portable Kit 100-200 Plants",
    price: 56.45,
    rating: 4.7,
    category: "Irrigation",
    subcategory: "Portable Drip Kits",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 123,
    name: "Portable Kit for Tree",
    description: "The Portable Kit for Trees",
    price: 257.35,
    rating: 4.5,
    category: "Irrigation",
    subcategory: "Portable Drip Kits",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 124,
    name: "Portable Kit for Bush",
    description: "The Portable Kit for Bushes",
    price: 405.99,
    rating: 4.6,
    category: "Irrigation",
    subcategory: "Portable Drip Kits",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 125,
    name: "Portable Kit for Lawn",
    description: "The Portable Kit for Lawns",
    price: 525.32,
    rating: 4.7,
    category: "Irrigation",
    subcategory: "Portable Drip Kits",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 126,
    name: "Portable Kit for Patio",
    description: "The Portable Kit for Patio Plants",
    price: 372.94,
    rating: 4.8,
    category: "Irrigation",
    subcategory: "Portable Drip Kits",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 127,
    name: "Drip Pipe 16mm-100m",
    description: "The Drip Pipe 16mm-100m",
    price: 572.94,
    rating: 4.6,
    category: "Irrigation",
    subcategory: "Drip Pipes & Fittings",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 128,
    name: "Drip Pipe 20mm-50m",
    description: "The Drip Pipe 20mm-50m",
    price: 472.35,
    rating: 4.7,
    category: "Irrigation",
    subcategory: "Drip Pipes & Fittings",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 129,
    name: "Mainline Pipe",
    description: "The Mainline Pipe 32mm",
    price: 672.96,
    rating: 4.5,
    category: "Irrigation",
    subcategory: "Drip Pipes & Fittings",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 130,
    name: "Grommet",
    description: "The Grommet 8mm Pack",
    price: 75.99,
    rating: 4.4,
    category: "Irrigation",
    subcategory: "Drip Pipes & Fittings",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 131,
    name: "Screen Filter",
    description: "The Screen Filter by Agri",
    price: 474.99,
    rating: 4.6,
    category: "Irrigation",
    subcategory: "Filters & Valves",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 132,
    name: "Disc Filter",
    description: "The Disc Filter by Aqua",
    price: 574.99,
    rating: 4.7,
    category: "Irrigation",
    subcategory: "Filters & Valves",
    brand: "GrowBrand",
    inStock: true,
  },
  {
    id: 133,
    name: "Pressure Relief",
    description: "The Pressure Relief Valve",
    price: 345.23,
    rating: 4.5,
    category: "Irrigation",
    subcategory: "Filters & Valves",
    brand: "GrowBrand",
    inStock: true,
  },
];

// Generate additional products to reach ~500 products
// Function to create product variations
const createProductVariations = () => {
  const additionalProducts: Product[] = [];
  let nextId = products.length + 1;
  
  // Helper function to generate a random price
  const randomPrice = (min: number, max: number) => {
    return +(Math.random() * (max - min) + min).toFixed(2);
  };

  
  // Helper function to generate a random rating between 4.0 and 5.0
  const randomRating = () => {
    return +(Math.random() * (5.0 - 4.0) + 4.0).toFixed(1);
  };
  
  // Get unique categories and subcategories
  const uniqueCategories = [...new Set(products.map(p => p.category))];
  
  // Get all subcategories
  const uniqueSubcategories = [...new Set(products.map(p => p.subcategory))];

  // For each category, create additional products
  uniqueCategories.forEach(category => {
    const subcategories = [...new Set(products
      .filter(p => p.category === category)
      .map(p => p.subcategory))];
    
    subcategories.forEach(subcategory => {
      // Get existing products in this subcategory to use as templates
      const existingProducts = products.filter(
        p => p.category === category && p.subcategory === subcategory
      );
      
      if (existingProducts.length === 0) return;
      
      // Create variations for each existing product
      existingProducts.forEach(template => {
        // Create 2-4 variations of each product
        const variationsCount = Math.floor(Math.random() * 3) + 2;
        
        for (let i = 0; i < variationsCount; i++) {
          const variant = i + 1;
          
          additionalProducts.push({
            id: nextId++,
            name: `${template.name} Premium V${variant}`,
            description: `Enhanced version of ${template.description} with improved features`,
            price: randomPrice(template.price * 0.8, template.price * 1.5),
            rating: randomRating(),
            category: template.category,
            subcategory: template.subcategory,
            brand: template.brand,
            inStock: Math.random() > 0.1, // 90% chance of being in stock
          });
        }
      });
    });
  });
  
  return additionalProducts;
};

// Add the additional products to the main products array
const additionalProducts = createProductVariations();
products.push(...additionalProducts);

// Organize products by category and subcategory for easy access
export const getProductsByCategory = (category: string): Product[] => {
  return products.filter(product => product.category === category);
};

export const getProductsBySubcategory = (subcategory: string): Product[] => {
  return products.filter(product => product.subcategory === subcategory);
};

// New comprehensive category structure based on BigHaat model
export const categoryStructure = {
  "Seeds": [
    "Vegetable Seeds",
    "Fruit Seeds",
    "Flower Seeds",
    "Cereal Seeds (e.g. Maize, Paddy)",
    "Oil-seed & Forage Seeds",
    "Exotic / Polyhouse Seeds"
  ],
  "Crop Protection": [
    "Insecticides",
    "Fungicides",
    "Herbicides",
    "Bactericides / Biologicals",
    "Seed Treatment Chemicals"
  ],
  "Crop Nutrition": [
    "Macro Nutrients (NPK Blends)",
    "Micro Nutrients (Zn, B, etc.)",
    "Growth Promoters / Biostimulants",
    "Soil Amendments (Humic Acid, Vermicompost)"
  ],
  "Equipments": [
    "Farm Tools (Hand tools, Weeders)",
    "Irrigation Equipment",
    "Power Tools & Machinery",
    "Nursery & Greenhouse Tools"
  ],
  "Animal Husbandry": [
    "Feed & Supplements",
    "Veterinary Medicines",
    "Animal Housing & Accessories",
    "Aquaculture"
  ],
  "Organic Farming Inputs": [
    "Organic Fertilizers (Compost, Vermicompost)",
    "Bio-Pesticides & Bio-Control",
    "Organic Growth Promoters"
  ],
  "Plants & Gardening": [
    "Indoor Plants",
    "Outdoor Plants",
    "Cacti & Succulents",
    "Hanging Plants",
    "Rare & Premium Plants",
    "Plant + Pot Combos",
    "Fertilizer Combos",
    "Seasonal Flowers"
  ],
  "Organic & Natural Products": [
    "Fresh Vegetables & Fruits",
    "Rice, Millets, and Flours",
    "Lentils & Beans",
    "Pure Honey",
    "Dairy Products (Ghee, Paneer)",
    "Organic Oils & Spices",
    "Frozen & Prepared Foods",
    "Superfoods (Moringa, Flaxseed, etc.)"
  ]
};

export const getCategories = (): string[] => {
  return Object.keys(categoryStructure);
};

export const getSubcategories = (category?: string): string[] => {
  if (category && categoryStructure[category as keyof typeof categoryStructure]) {
    return categoryStructure[category as keyof typeof categoryStructure];
  }
  return Object.values(categoryStructure).flat();
};

/**
 * Get recommended products based on a product or category
 * @param productId - Optional product ID to base recommendations on
 * @param category - Optional category to filter recommendations
 * @param limit - Maximum number of products to return (default: 4)
 * @returns Array of recommended products
 */
export const getRecommendedProducts = (
  productId?: number,
  category?: string,
  limit: number = 4
): Product[] => {
  let recommendations: Product[] = [];
  
  if (productId) {
    // Find the product
    const product = products.find(p => p.id === productId);
    
    if (product) {
      // Get products from the same subcategory
      recommendations = products.filter(
        p => p.id !== productId && p.subcategory === product.subcategory
      );
      
      // If we don't have enough, add products from the same category
      if (recommendations.length < limit) {
        const sameCategory = products.filter(
          p => p.id !== productId && 
             p.category === product.category && 
             p.subcategory !== product.subcategory
        );
        recommendations = [...recommendations, ...sameCategory];
      }
    }
  } else if (category) {
    // Get products from the specified category
    recommendations = products.filter(p => p.category === category);
  } else {
    // Get products with highest ratings
    recommendations = [...products].sort((a, b) => b.rating - a.rating);
  }
  
  // Shuffle the recommendations
  recommendations = recommendations

    .sort(() => Math.random() - 0.5)
    .slice(0, limit);
  
  return recommendations;
};
// Filter types and options
export interface ProductFilters {
  category?: string;
  subcategory?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  availability?: 'all' | 'in_stock' | 'out_of_stock';
  isOrganic?: boolean;
  plantType?: string;
  tags?: string[];
  rating?: number; // minimum rating
  useCaseInsensitiveMatch?: boolean; // Whether to use case-insensitive matching for category and subcategory
  usePartialMatching?: boolean; // Whether to use partial matching for category and subcategory
}

export const priceRanges = [
  { label: "Under ₹1,000", min: 0, max: 1000 },
  { label: "₹1,000 - ₹2,500", min: 1000, max: 2500 },
  { label: "₹2,500 - ₹5,000", min: 2500, max: 5000 },
  { label: "₹5,000 - ₹10,000", min: 5000, max: 10000 },
  { label: "Above ₹10,000", min: 10000, max: Infinity }
];

export const availableTags = ["Organic", "New", "Popular", "Premium", "Best Seller", "Limited Edition"];

export const plantTypes = ["Indoor", "Outdoor", "Hanging", "Succulent", "Flowering", "Foliage"];

// Filter products based on criteria
export const filterProducts = (products: Product[], filters: ProductFilters): Product[] => {
  // Log filtering operation for debugging
  console.log(`Filtering ${products.length} products with filters:`,
    JSON.stringify({
      category: filters.category,
      subcategory: filters.subcategory,
      useCaseInsensitive: filters.useCaseInsensitiveMatch,
      usePartialMatching: filters.usePartialMatching
    })
  );
  
  return products.filter(product => {
    // Category filter with optional case-insensitive and partial matching
    if (filters.category) {
      if (filters.usePartialMatching) {
        // Partial match (includes)
        const productCategory = filters.useCaseInsensitiveMatch
          ? product.category.toLowerCase()
          : product.category;
        
        const filterCategory = filters.useCaseInsensitiveMatch
          ? filters.category.toLowerCase()
          : filters.category;
        
        if (!productCategory.includes(filterCategory) && !filterCategory.includes(productCategory)) {
          return false;
        }
      } else if (filters.useCaseInsensitiveMatch) {
        // Case-insensitive exact match
        if (product.category.toLowerCase() !== filters.category.toLowerCase()) {
          return false;
        }
      } else {
        // Exact match
        if (product.category !== filters.category) {
          return false;
        }
      }
    }

    // Subcategory filter with optional case-insensitive and partial matching
    if (filters.subcategory) {
      if (filters.usePartialMatching) {
        // Partial match (includes)
        const productSubcategory = filters.useCaseInsensitiveMatch
          ? product.subcategory.toLowerCase()
          : product.subcategory;
        
        const filterSubcategory = filters.useCaseInsensitiveMatch
          ? filters.subcategory.toLowerCase()
          : filters.subcategory;
        
        if (!productSubcategory.includes(filterSubcategory) && !filterSubcategory.includes(productSubcategory)) {
          return false;
        }
      } else if (filters.useCaseInsensitiveMatch) {
        // Case-insensitive exact match
        if (product.subcategory.toLowerCase() !== filters.subcategory.toLowerCase()) {
          return false;
        }
      } else {
        // Exact match
        if (product.subcategory !== filters.subcategory) {
          return false;
        }
      }
    }

    // Price range filter
    if (filters.priceRange) {
      const { min, max } = filters.priceRange;
      if (product.price < min || product.price > max) {
        return false;
      }
    }

    // Availability filter
    if (filters.availability === 'in_stock' && !product.inStock) {
      return false;
    }
    if (filters.availability === 'out_of_stock' && product.inStock) {
      return false;
    }

    // Organic filter
    if (filters.isOrganic !== undefined && product.isOrganic !== filters.isOrganic) {
      return false;
    }

    // Plant type filter (for plants section only)
    if (filters.plantType) {
      if (filters.useCaseInsensitiveMatch) {
        // Case-insensitive match for plant type
        if (!product.plantType || product.plantType.toLowerCase() !== filters.plantType.toLowerCase()) {
          return false;
        }
      } else {
        // Exact match
        if (!product.plantType || product.plantType !== filters.plantType) {
          return false;
        }
      }
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      const productTags = product.tags || [];
      let hasMatchingTag = false;
      
      if (filters.useCaseInsensitiveMatch) {
        // Case-insensitive tag matching
        const lowerCaseTags = productTags.map(tag => tag.toLowerCase());
        hasMatchingTag = filters.tags.some(tag =>
          lowerCaseTags.includes(tag.toLowerCase())
        );
      } else {
        // Exact tag matching
        hasMatchingTag = filters.tags.some(tag => productTags.includes(tag));
      }
      
      if (!hasMatchingTag) {
        return false;
      }
    }

    // Rating filter
    if (filters.rating && product.rating < filters.rating) {
      return false;
    }

    return true;
  });
};

// Export categories and subcategories directly for easier imports
export const categories = getCategories();
export const subcategories = getSubcategories();