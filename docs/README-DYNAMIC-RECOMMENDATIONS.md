# Dynamic Product Recommendations

This document explains the dynamic product recommendation system implemented in the CropsayAI application.

## Overview

The dynamic recommendation system uses Gemini AI to analyze user queries and chat history, then matches them with products in the catalog based on categories, subcategories, and product features. This approach provides more relevant and contextual recommendations compared to predefined or static recommendation systems.

## How It Works

1. **Query Analysis**: When a user asks a question or has a conversation in the chat, the system extracts the most recent messages and sends them to Gemini AI for analysis.

2. **Category and Subcategory Matching**: Gemini identifies the most relevant product categories and subcategories based on the user's query.

3. **Feature Extraction**: The system extracts specific product features or requirements mentioned in the user's query.

4. **Product Matching**: The system matches these categories, subcategories, and features with products in the catalog.

5. **Ranking**: Products are ranked based on relevance to the query and secondary factors like ratings.

6. **Presentation**: The most relevant products are presented to the user in the recommendation panel.

## Benefits

- **Contextual Recommendations**: Recommendations are based on the actual content of the user's conversation, not predefined rules.
  
- **Dynamic Matching**: The system can adapt to any type of query, even if it's about a topic not explicitly coded in the system.
  
- **No Repeated Recommendations**: Each recommendation is freshly generated based on the current conversation, avoiding repetitive suggestions.
  
- **Comprehensive Product Coverage**: All products in the catalog have an equal chance of being recommended if they match the user's needs.

## Implementation

The implementation consists of:

1. **dynamicRecommendationService.ts**: The core service that handles the Gemini API interaction and product matching logic.

2. **ExpertPanel.tsx**: The UI component that displays recommendations and handles user interactions.

## Example

When a user asks: "How can I spray water in the plant?"

1. Gemini analyzes this query and identifies:
   - Relevant categories: "Tools & Equipment"
   - Relevant subcategories: "Sprayers"
   - Product features: "spray", "water", "plant"

2. The system matches these with products in the catalog, finding items like:
   - Battery Sprayer-2iN1
   - Nano Sprayer-XR

3. These products are presented to the user as recommendations, with explanations of why they're relevant.

## Future Improvements

- **Personalization**: Incorporate user preferences and purchase history for more personalized recommendations.
  
- **Seasonal Awareness**: Add awareness of growing seasons and regional agricultural practices.
  
- **Multi-modal Analysis**: Analyze images shared by users to identify crop issues and recommend relevant products.