/**
 * Agricultural Knowledge Graph
 * Contains structured data about crops, problems, activities, and their relationships
 */

// Define types
export interface Crop {
  id: string;
  name: string;
  scientificName?: string;
  growingSeason?: string[];
  commonProblems?: string[];
  relatedProducts?: string[];
}

export interface Problem {
  id: string;
  name: string;
  description?: string;
  affectedCrops?: string[];
  solutions?: string[];
  relatedProducts?: string[];
}

export interface Activity {
  id: string;
  name: string;
  description?: string;
  relatedCrops?: string[];
  relatedProducts?: string[];
  season?: string[];
}

// Knowledge Graph
export const agriculturalKnowledgeGraph = {
  // Crops
  crops: [
    {
      id: 'c1',
      name: 'Garlic',
      scientificName: 'Allium sativum',
      growingSeason: ['Fall', 'Winter'],
      commonProblems: ['Fungal diseases', 'Pests', 'Root rot'],
      relatedProducts: ['Garlic seed', 'Organic fertilizer', 'Fungicide']
    },
    {
      id: 'c2',
      name: 'Wheat',
      scientificName: 'Triticum',
      growingSeason: ['Winter', 'Spring'],
      commonProblems: ['Rust', 'Powdery mildew', 'Aphids'],
      relatedProducts: ['Wheat seed', 'NPK fertilizer', 'Pesticide']
    },
    {
      id: 'c3',
      name: 'Rice',
      scientificName: 'Oryza sativa',
      growingSeason: ['Summer', 'Monsoon'],
      commonProblems: ['Blast', 'Stem borer', 'Bacterial leaf blight'],
      relatedProducts: ['Rice seed', 'Nitrogen fertilizer', 'Insecticide']
    },
    {
      id: 'c4',
      name: 'Tomato',
      scientificName: 'Solanum lycopersicum',
      growingSeason: ['Spring', 'Summer'],
      commonProblems: ['Blight', 'Fruit worms', 'Blossom end rot'],
      relatedProducts: ['Tomato seed', 'Calcium fertilizer', 'Fungicide']
    },
    {
      id: 'c5',
      name: 'Potato',
      scientificName: 'Solanum tuberosum',
      growingSeason: ['Spring', 'Fall'],
      commonProblems: ['Late blight', 'Colorado potato beetle', 'Scab'],
      relatedProducts: ['Seed potato', 'Balanced fertilizer', 'Insecticide']
    }
  ],

  // Problems
  problems: [
    {
      id: 'p1',
      name: 'Fungal diseases',
      description: 'Various fungal infections affecting plant health',
      affectedCrops: ['Garlic', 'Wheat', 'Tomato'],
      solutions: ['Apply fungicide', 'Improve air circulation', 'Crop rotation'],
      relatedProducts: ['Fungicide', 'Organic fungicide', 'Copper spray']
    },
    {
      id: 'p2',
      name: 'Pests',
      description: 'Insect infestations damaging crops',
      affectedCrops: ['Garlic', 'Wheat', 'Rice', 'Tomato', 'Potato'],
      solutions: ['Apply insecticide', 'Introduce beneficial insects', 'Use row covers'],
      relatedProducts: ['Insecticide', 'Organic insecticide', 'Neem oil']
    },
    {
      id: 'p3',
      name: 'Nutrient deficiency',
      description: 'Lack of essential nutrients for plant growth',
      affectedCrops: ['Garlic', 'Wheat', 'Rice', 'Tomato', 'Potato'],
      solutions: ['Apply appropriate fertilizer', 'Soil testing', 'Compost addition'],
      relatedProducts: ['NPK fertilizer', 'Micronutrient mix', 'Compost']
    }
  ],

  // Activities
  activities: [
    {
      id: 'a1',
      name: 'Planting',
      description: 'Placing seeds or seedlings in soil',
      relatedCrops: ['Garlic', 'Wheat', 'Rice', 'Tomato', 'Potato'],
      relatedProducts: ['Seeds', 'Seedlings', 'Planting tools'],
      season: ['Spring', 'Fall']
    },
    {
      id: 'a2',
      name: 'Fertilizing',
      description: 'Adding nutrients to soil for plant growth',
      relatedCrops: ['Garlic', 'Wheat', 'Rice', 'Tomato', 'Potato'],
      relatedProducts: ['Fertilizers', 'Compost', 'Manure'],
      season: ['Spring', 'Summer', 'Fall']
    },
    {
      id: 'a3',
      name: 'Harvesting',
      description: 'Collecting mature crops',
      relatedCrops: ['Garlic', 'Wheat', 'Rice', 'Tomato', 'Potato'],
      relatedProducts: ['Harvesting tools', 'Storage containers'],
      season: ['Summer', 'Fall']
    },
    {
      id: 'a4',
      name: 'Watering',
      description: 'Providing water to crops',
      relatedCrops: ['Garlic', 'Wheat', 'Rice', 'Tomato', 'Potato'],
      relatedProducts: ['Irrigation systems', 'Watering cans', 'Sprinklers'],
      season: ['Spring', 'Summer', 'Fall']
    },
    {
      id: 'a5',
      name: 'Pest control',
      description: 'Managing and preventing pest infestations',
      relatedCrops: ['Garlic', 'Wheat', 'Rice', 'Tomato', 'Potato'],
      relatedProducts: ['Pesticides', 'Organic pest control', 'Traps'],
      season: ['Spring', 'Summer', 'Fall']
    },
    {
      id: 'a6',
      name: 'Growing',
      description: 'The process of cultivating plants',
      relatedCrops: ['Garlic', 'Wheat', 'Rice', 'Tomato', 'Potato'],
      relatedProducts: ['Fertilizers', 'Seeds', 'Tools'],
      season: ['Spring', 'Summer', 'Fall']
    }
  ]
};

export default agriculturalKnowledgeGraph;