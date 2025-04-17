# CropsayAI System Architecture and Workflow Documentation

## Overview

CropsayAI is an agriculture-focused chat-commerce platform that uses Google's Gemini AI to provide domain-specific responses and product recommendations. This document explains the system architecture, workflow, and how Gemini is configured to provide agriculture-specific responses.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Gemini Integration](#gemini-integration)
3. [Agriculture Domain Restriction](#agriculture-domain-restriction)
4. [Product Recommendation System](#product-recommendation-system)
5. [Complete Workflow](#complete-workflow)
6. [Code Locations and Details](#code-locations-and-details)

## System Architecture

CropsayAI consists of several interconnected components:

1. **Frontend UI**: React-based interface with chat functionality
2. **Gemini Service**: Core service that interacts with Google's Gemini API
3. **Gemini Proxy**: Express server that proxies requests to Gemini API
4. **NLP Recommendation Service**: Python service using transformers for advanced NLP
5. **Agricultural Knowledge Graph**: Structured data about crops, problems, and activities
6. **Product Database**: Catalog of agricultural products

The system follows a microservices architecture with:
- JavaScript/TypeScript frontend services
- Python-based NLP service
- External API integration (Gemini)
- Supabase for data persistence

## Gemini Integration

### Core Integration Files

1. **`src/services/geminiService.ts`**: Main service that interacts with Gemini API
2. **`src/services/geminiProxy.js`**: Express server that proxies requests to avoid CORS issues
3. **`start-gemini-proxy.js`**: Script to start the Gemini proxy server

### Integration Method

The system integrates with Gemini using the official Google Generative AI SDK:

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

// API key
const GEMINI_API_KEY = '***REMOVED***';

// Initialize the Google Generative AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Use the correct model name as identified by Google
const MODEL_NAME = 'gemini-1.5-flash'; // Using the free Gemini 1.5 Flash model
```

The system primarily uses the `gemini-1.5-flash` model for generating responses, with fallback mechanisms in place.

## Agriculture Domain Restriction

### How Gemini is Restricted to Agriculture Domain

The system restricts Gemini's responses to the agriculture domain through **prompt engineering** rather than using a rule-based system. This is implemented in several ways:

1. **Domain-Specific Prompts**: All prompts to Gemini explicitly instruct it to act as an agricultural assistant:

```typescript
// From geminiService.ts
const prompt = `
You are an expert agricultural assistant for CropsayAI. Answer the following question about farming, agriculture, or plants:

${userQuestion}

${recentChatHistory ? `Recent conversation context: ${recentChatHistory}` : ''}

Provide a helpful, informative response with practical advice.
`;
```

2. **Agricultural Knowledge Graph**: The system uses a structured knowledge graph (`src/data/agriculturalKnowledgeGraph.ts`) that contains domain-specific information about:
   - Crops (wheat, rice, tomato, etc.)
   - Common problems (fungal diseases, pests, nutrient deficiency)
   - Agricultural activities (planting, fertilizing, harvesting)

3. **Product Context**: When generating recommendations, the system provides Gemini with agricultural product categories and subcategories:

```typescript
// From geminiRecommendationService.ts
const productCategories = [...new Set(products.map(p => p.category))];
const productSubcategories = [...new Set(products.map(p => p.subcategory))];

const prompt = `
You are an expert agricultural product recommendation system. Based on the user's chat message, recommend the most relevant agricultural products from our catalog.

User's chat message: "${chatText}"

Our product catalog has the following categories: ${productCategories.join(', ')}
And subcategories: ${productSubcategories.join(', ')}
`;
```

4. **Intent Analysis**: The NLP service analyzes user intent and extracts agricultural keywords:

```python
# From nlp_recommendation_service.py
agricultural_keywords = {
    "crops": ["wheat", "rice", "corn", "maize", "tomato", "potato", "garlic", "onion", "carrot", "plant", "plants"],
    "problems": ["disease", "pest", "weed", "fungus", "blight", "rot", "deficiency"],
    "activities": ["grow", "plant", "harvest", "water", "watering", "fertilize", "spray", "spraying", "irrigate", "irrigation"],
    "products": ["seed", "fertilizer", "pesticide", "tool", "equipment", "irrigation"]
}
```

### Why It Doesn't Answer Non-Agricultural Questions

The system effectively restricts responses to the agricultural domain because:

1. **Explicit Instructions**: Every prompt explicitly instructs Gemini to answer only agricultural questions
2. **Context Framing**: All context provided to Gemini is agriculture-focused
3. **No Fallback for Non-Agricultural Queries**: The system doesn't provide alternative paths for non-agricultural questions

If a user asks a non-agricultural question, Gemini will either:
- Attempt to relate it to agriculture (due to the prompt instructions)
- Politely decline to answer if it cannot be related to agriculture

## Product Recommendation System

The product recommendation system uses a multi-layered approach:

### 1. Gemini-Based Recommendations

Located in `src/services/geminiRecommendationService.ts`, this service:
- Sends the user's query and product catalog to Gemini
- Instructs Gemini to recommend relevant agricultural products
- Processes the structured response to extract product recommendations

```typescript
const prompt = `
You are an expert agricultural product recommendation system. Based on the user's chat message, recommend the most relevant agricultural products from our catalog.

User's chat message: "${chatText}"

Our product catalog has the following categories: ${productCategories.join(', ')}
And subcategories: ${productSubcategories.join(', ')}

Here's a simplified list of our products:
${JSON.stringify(simplifiedProducts.slice(0, 50), null, 2)}

Based on the user's message, recommend ${limit} most relevant products.
`;
```

### 2. NLP-Based Recommendations

Located in `src/services/nlp_recommendation_service.py`, this Python service:
- Uses transformer models to generate embeddings for products and queries
- Implements KNN algorithm to find similar products
- Analyzes user intent and extracts agricultural keywords
- Provides a FastAPI endpoint for the frontend to access

```python
def get_recommendations(
    query: str,
    chat_history: Optional[List[ChatMessage]] = None,
    limit: int = 3
) -> Tuple[List[Dict[str, Any]], np.ndarray, Dict[str, Any]]:
    # Analyze intent
    intent_analysis = analyze_intent(query, chat_history)
    
    # Get embedding for query
    query_embedding = get_embedding(query)
    
    # Calculate cosine similarity
    similarities = []
    for i, prod_emb in enumerate(product_embeddings):
        # Compute cosine similarity
        similarity = dot_product / (magnitude_a * magnitude_b)
        similarities.append((i, similarity))
    
    # Sort by similarity (highest first)
    similarities.sort(key=lambda x: x[1], reverse=True)
```

### 3. Dynamic Recommendation System

Located in `src/services/dynamicRecommendationService.ts`, this service:
- Analyzes user queries to identify relevant product categories
- Matches categories and features with products in the catalog
- Ranks products based on relevance to the query

## Complete Workflow

The complete workflow of the CropsayAI system is as follows:

1. **User Interaction**:
   - User sends a message through the chat interface (`src/pages/ChatPage.tsx`)
   - Message is displayed in the UI and stored in state

2. **Gemini Processing**:
   - User message is sent to `geminiService.generateResponse()`
   - Service formats the message with agriculture-specific prompt
   - Message is sent to Gemini API (either directly or through proxy)
   - Gemini generates a response based on the agriculture-focused prompt

3. **Response Handling**:
   - Response is received from Gemini API
   - Response is parsed and formatted
   - Response is displayed in the chat interface

4. **Product Recommendation**:
   - In parallel, the system analyzes the chat for product recommendation opportunities
   - The system tries the NLP service first (`nlp_recommendation_service.py`)
   - If unavailable, it falls back to Gemini-based recommendations
   - Recommendations are displayed in the ExpertPanel component

5. **Data Persistence**:
   - Chat messages are stored in Supabase (or memory if unavailable)
   - User can retrieve past conversations

## Code Locations and Details

### Core Files and Their Functions

1. **Gemini Integration**:
   - `src/services/geminiService.ts`: Core service for Gemini API interaction
   - `src/services/geminiProxy.js`: Express server for proxying Gemini requests
   - `start-gemini-proxy.js`: Script to start the proxy server

2. **Chat Interface**:
   - `src/pages/ChatPage.tsx`: Main chat interface component
   - `src/services/chatService.js`: Service for managing chat sessions and messages

3. **Recommendation System**:
   - `src/services/geminiRecommendationService.ts`: Gemini-based product recommendations
   - `src/services/nlp_recommendation_service.py`: Advanced NLP recommendations
   - `src/services/nlpBridgeService.ts`: Bridge between frontend and Python service
   - `start-nlp-service.js`: Script to start the NLP service

4. **Domain Knowledge**:
   - `src/data/agriculturalKnowledgeGraph.ts`: Structured agricultural knowledge
   - `src/data/productData.ts`: Product catalog

### Algorithms and Models Used

1. **Transformer Models**:
   - The NLP service uses `sentence-transformers/all-MiniLM-L6-v2` for generating embeddings
   - This model provides semantic understanding of text

2. **KNN Algorithm**:
   - Used for finding similar products based on embeddings
   - Implemented in the NLP recommendation service

#### KNN Algorithm Implementation Details

The K-Nearest Neighbors (KNN) algorithm is implemented in the NLP recommendation service (`src/services/nlp_recommendation_service.py`) to find products that are semantically similar to user queries. Here's a detailed analysis of how the KNN algorithm works in the project:

1. **Embedding Generation**:
   - The system uses the `sentence-transformers/all-MiniLM-L6-v2` model to generate embeddings for both products and user queries
   - Product embeddings are pre-computed during initialization and stored in memory:
   ```python
   # Compute embeddings for all products
   product_texts = [
       f"{p['name']} {p.get('description', '')} {p.get('category', '')} {p.get('subcategory', '')}"
       for p in products
   ]
   product_embeddings = np.array([get_embedding(text) for text in product_texts])
   ```
   - Query embeddings are generated on-the-fly when a recommendation is requested:
   ```python
   query_embedding = get_embedding(query)
   ```

   **Note**: The `query` parameter contains the user's original text input (not Gemini's response). This is either the direct message from the user or text extracted from the user's chat history. The system compares this user query against product descriptions to find semantically similar products.

2. **Similarity Calculation**:
   - The system implements cosine similarity manually rather than using a library function:
   ```python
   # Calculate cosine similarity manually
   similarities = []
   for i, prod_emb in enumerate(product_embeddings):
       # Compute dot product
       dot_product = np.dot(query_embedding, prod_emb)
       # Compute magnitudes
       magnitude_a = np.sqrt(np.dot(query_embedding, query_embedding))
       magnitude_b = np.sqrt(np.dot(prod_emb, prod_emb))
       # Compute cosine similarity
       similarity = dot_product / (magnitude_a * magnitude_b) if magnitude_a * magnitude_b > 0 else 0
       similarities.append((i, similarity))
   ```

3. **Nearest Neighbors Selection**:
   - The system sorts products by similarity score in descending order:
   ```python
   # Sort by similarity (highest first)
   similarities.sort(key=lambda x: x[1], reverse=True)
   ```
   - It then selects the top K products (where K is the `limit` parameter, defaulting to 3):
   ```python
   # Get top recommendations
   recommendations = []
   for i, score in similarities[:limit]:
       product = products[i]
       # Generate reasoning and add to recommendations
   ```

4. **Context-Aware Reasoning**:
   - The system enhances the KNN results by incorporating intent analysis:
   ```python
   # Generate reasoning based on intent and product
   if intent_analysis["intent"] == "problem-solving":
       if product.get("category") == "Pesticides":
           reasoning = "This pesticide can help solve crop problems mentioned in your query."
   ```
   - This adds domain-specific context to the similarity-based recommendations

This implementation is a classic example of content-based filtering using KNN with semantic embeddings. The system doesn't require explicit user ratings or purchase history, making it suitable for cold-start scenarios. The use of transformer-based embeddings allows the system to capture semantic relationships between queries and products, going beyond simple keyword matching.

3. **Intent Analysis**:
   - Pattern matching for primary intent
   - Entity extraction for context
   - Agricultural keyword matching

4. **Gemini LLM**:
   - Used for generating responses and recommendations
   - Model: `gemini-1.5-flash` (with fallback options)

## Conclusion

CropsayAI effectively restricts Gemini's responses to the agricultural domain through careful prompt engineering, domain-specific context, and a structured knowledge graph. The system uses a multi-layered approach to product recommendations, combining the power of Gemini LLM with traditional NLP techniques.

The architecture follows modern best practices with a microservices approach, separating concerns between different components while maintaining a cohesive user experience. The system is designed to be robust with fallback mechanisms at various levels.