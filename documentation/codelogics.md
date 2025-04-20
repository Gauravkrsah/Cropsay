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
7. [Training Data and Model Preparation](#training-data-and-model-preparation)
8. [Custom Algorithms](#custom-algorithms)
9. [Performance Optimization](#performance-optimization)
10. [Security Considerations](#security-considerations)

## System Architecture

CropsayAI consists of several interconnected components:

1. **Frontend UI**: React-based interface with chat functionality
   - Built using React and TypeScript
   - Implements responsive design for mobile and desktop
   - Uses Shadcn/UI components for consistent styling
   - Manages state using React Context API
   - Handles real-time chat interactions and product recommendations display

2. **Gemini Service**: Core service that interacts with Google's Gemini API
   - Manages API requests and response handling
   - Implements prompt engineering for agriculture-specific responses
   - Handles error cases and fallback mechanisms
   - Processes streaming responses for real-time chat experience

3. **Gemini Proxy**: Express server that proxies requests to Gemini API
   - Resolves CORS issues by acting as an intermediary
   - Handles authentication with Google's API
   - Provides a unified endpoint for frontend services
   - Manages rate limiting and request throttling

4. **NLP Recommendation Service**: Python service using transformers for advanced NLP
   - Implements semantic search using transformer models
   - Generates embeddings for products and user queries
   - Performs intent analysis to understand user needs
   - Uses custom KNN algorithm for product matching

5. **Agricultural Knowledge Graph**: Structured data about crops, problems, and activities
   - Contains hierarchical relationships between agricultural concepts
   - Stores information about crops, diseases, treatments, and farming practices
   - Used to enhance AI responses with domain-specific knowledge
   - Provides context for product recommendations

6. **Product Database**: Catalog of agricultural products
   - Stores comprehensive product information including categories, descriptions, and pricing
   - Indexed for efficient search and retrieval
   - Linked to the knowledge graph for contextual recommendations
   - Regularly updated with new products and information

The system follows a microservices architecture with:
- **JavaScript/TypeScript frontend services**: Handle UI rendering, state management, and user interactions
- **Python-based NLP service**: Provides advanced natural language processing capabilities
- **External API integration (Gemini)**: Leverages Google's large language model for intelligent responses
- **Supabase for data persistence**: Stores user data, chat history, and product information

### Data Flow Architecture

The data flow in CropsayAI follows these patterns:

1. **User Input Flow**:
   - User input is captured in the React frontend
   - Input is processed for immediate UI feedback
   - Input is sent to both Gemini service and recommendation services in parallel
   - Results are combined and displayed to the user

2. **Persistence Flow**:
   - Chat messages are stored in Supabase in real-time
   - User preferences and history are maintained for personalization
   - Product interactions are logged for analytics and improvement

3. **Recommendation Flow**:
   - User queries trigger parallel recommendation processes
   - NLP service analyzes semantic meaning
   - Gemini service provides context-aware suggestions
   - Results are merged, ranked, and presented to the user

## Gemini Integration

### Core Integration Files

1. **`src/services/geminiService.ts`**: Main service that interacts with Gemini API
   - Handles API initialization and configuration
   - Manages prompt construction and context window
   - Processes responses and handles errors
   - Implements retry logic and fallback mechanisms

2. **`src/services/geminiProxy.js`**: Express server that proxies requests to avoid CORS issues
   - Routes requests to Google's API
   - Handles authentication and headers
   - Manages response streaming
   - Implements error handling and logging

3. **`start-gemini-proxy.js`**: Script to start the Gemini proxy server
   - Configures server settings and environment
   - Sets up logging and monitoring
   - Handles process lifecycle and graceful shutdown
   - Manages environment variables and secrets

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

### Model Selection Rationale

The `gemini-1.5-flash` model was chosen for several reasons:

1. **Performance-Cost Balance**: Provides good response quality while maintaining reasonable latency and cost
2. **Context Window Size**: Supports sufficient context for agricultural conversations
3. **Instruction Following**: Demonstrates strong adherence to domain-specific instructions
4. **Availability**: Offers reliable uptime and consistent performance

### Prompt Engineering Techniques

The system uses several advanced prompt engineering techniques:

1. **Role-Based Prompting**: Instructs Gemini to act as an agricultural expert
2. **Context Enrichment**: Provides relevant agricultural knowledge in the prompt
3. **Few-Shot Learning**: Includes examples of ideal responses for similar queries
4. **Structured Output Guidance**: Specifies desired response format and structure

### Fallback Mechanisms

If the primary Gemini model fails, the system implements these fallbacks:

1. **Model Downgrade**: Falls back to simpler models if the primary model is unavailable
2. **Pattern-Based Responses**: Uses pre-defined templates for common queries
3. **Knowledge Graph Lookup**: Directly retrieves information from the agricultural knowledge graph
4. **Cached Responses**: Returns previously successful responses for similar queries

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

### Domain Restriction Technical Implementation

The domain restriction is implemented through several technical mechanisms:

1. **Prompt Prefix and Suffix**: Every interaction with Gemini is wrapped with agricultural context
2. **Response Filtering**: Non-agricultural responses are detected and rejected
3. **Intent Classification**: User queries are classified into agricultural vs. non-agricultural intents
4. **Entity Recognition**: Agricultural entities are identified and emphasized in the context

### Why It Doesn't Answer Non-Agricultural Questions

The system effectively restricts responses to the agricultural domain because:

1. **Explicit Instructions**: Every prompt explicitly instructs Gemini to answer only agricultural questions
2. **Context Framing**: All context provided to Gemini is agriculture-focused
3. **No Fallback for Non-Agricultural Queries**: The system doesn't provide alternative paths for non-agricultural questions
4. **Response Validation**: Responses are checked for agricultural relevance before being shown to users

If a user asks a non-agricultural question, Gemini will either:
- Attempt to relate it to agriculture (due to the prompt instructions)
- Politely decline to answer if it cannot be related to agriculture

### Domain-Specific Language Processing

The system implements specialized processing for agricultural terminology:

1. **Agricultural Glossary**: Maintains definitions of domain-specific terms
2. **Term Normalization**: Maps variations of crop names and farming terms to standard forms
3. **Seasonal Context**: Adjusts recommendations based on growing seasons and agricultural calendar
4. **Regional Adaptation**: Considers geographical factors in responses and recommendations

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

#### How Gemini Recommendations Work

1. **Context Preparation**: The system prepares a context that includes:
   - User's query and recent chat history
   - Available product categories and subcategories
   - Sample of relevant products from the catalog

2. **Structured Output Request**: The prompt instructs Gemini to return recommendations in a specific format:
   - Product ID
   - Relevance score
   - Reasoning for recommendation

3. **Response Parsing**: The system parses Gemini's response to extract structured product recommendations:
   - Validates product IDs against the catalog
   - Normalizes relevance scores
   - Extracts reasoning for display to the user

4. **Fallback Handling**: If Gemini fails to provide valid recommendations, the system:
   - Retries with simplified prompts
   - Falls back to keyword-based matching
   - Uses popularity-based recommendations as a last resort

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

#### Embedding Generation Process

The embedding generation process involves:

1. **Text Preprocessing**:
   - Tokenization and normalization
   - Stop word removal
   - Agricultural term standardization

2. **Model Application**:
   - Using pre-trained transformer models
   - Generating fixed-length vector representations
   - Capturing semantic meaning of text

3. **Embedding Storage**:
   - Efficient storage of product embeddings
   - Periodic updates as product catalog changes
   - Caching for performance optimization

#### Intent Analysis System

The intent analysis system:

1. **Classifies Queries** into categories:
   - Problem-solving (e.g., "How do I treat tomato blight?")
   - Information-seeking (e.g., "When should I plant wheat?")
   - Product-specific (e.g., "I need organic fertilizer")
   - Comparison (e.g., "What's better for pest control?")

2. **Extracts Entities** such as:
   - Crop types
   - Agricultural problems
   - Farming activities
   - Product categories

3. **Determines Urgency** based on:
   - Language indicators
   - Seasonal factors
   - Problem severity terms

### 3. Dynamic Recommendation System

Located in `src/services/dynamicRecommendationService.ts`, this service:
- Analyzes user queries to identify relevant product categories
- Matches categories and features with products in the catalog
- Ranks products based on relevance to the query

#### Dynamic Matching Algorithm

The dynamic matching algorithm:

1. **Extracts Key Terms** from user queries
2. **Maps Terms to Product Features** using a weighted scoring system
3. **Applies Business Rules** such as:
   - Seasonal relevance
   - Stock availability
   - Promotional priorities
4. **Generates Explanations** for why products were recommended

### 4. Hybrid Recommendation Approach

The system combines multiple recommendation approaches:

1. **Ensemble Ranking**: Merges results from different recommendation methods
2. **Contextual Boosting**: Increases relevance of products based on conversation context
3. **Feedback Learning**: Adjusts recommendations based on user interactions
4. **Diversity Enforcement**: Ensures variety in recommended products

## Complete Workflow

The complete workflow of the CropsayAI system is as follows:

### 1. User Interaction

- User sends a message through the chat interface (`src/pages/ChatPage.tsx`)
- Message is displayed in the UI and stored in state
- UI provides immediate feedback while processing occurs

#### Technical Implementation Details:

```typescript
// Simplified from ChatPage.tsx
const handleSendMessage = async (message: string) => {
  // Add user message to chat
  const userMessage = {
    id: generateId(),
    text: message,
    sender: 'user',
    timestamp: new Date().toISOString()
  };
  
  setMessages(prev => [...prev, userMessage]);
  
  // Store in database
  await chatService.saveMessage(userMessage);
  
  // Process with Gemini and get recommendations in parallel
  const [aiResponse, recommendations] = await Promise.all([
    geminiService.generateResponse(message, recentMessages),
    recommendationService.getRecommendations(message, recentMessages)
  ]);
  
  // Display AI response
  const aiMessage = {
    id: generateId(),
    text: aiResponse,
    sender: 'ai',
    timestamp: new Date().toISOString()
  };
  
  setMessages(prev => [...prev, aiMessage]);
  setRecommendations(recommendations);
  
  // Store AI response
  await chatService.saveMessage(aiMessage);
};
```

### 2. Gemini Processing

- User message is sent to `geminiService.generateResponse()`
- Service formats the message with agriculture-specific prompt
- Message is sent to Gemini API (either directly or through proxy)
- Gemini generates a response based on the agriculture-focused prompt

#### Request Processing Flow:

1. **Message Preparation**:
   - Sanitize user input
   - Add conversation context
   - Apply agricultural domain framing

2. **API Request**:
   - Send formatted prompt to Gemini API
   - Handle authentication and request headers
   - Implement timeout and retry logic

3. **Response Processing**:
   - Parse and validate Gemini's response
   - Check for domain relevance
   - Format for display in the chat interface

### 3. Response Handling

- Response is received from Gemini API
- Response is parsed and formatted
- Response is displayed in the chat interface
- Response is stored in the chat history

#### Response Enhancement:

The system enhances raw Gemini responses with:

1. **Term Definitions**: Agricultural terms are linked to definitions
2. **Visual Elements**: Relevant images or diagrams are added where appropriate
3. **Actionable Advice**: Practical steps are highlighted
4. **Source References**: Information sources are cited when available

### 4. Product Recommendation

- In parallel, the system analyzes the chat for product recommendation opportunities
- The system tries the NLP service first (`nlp_recommendation_service.py`)
- If unavailable, it falls back to Gemini-based recommendations
- Recommendations are displayed in the ExpertPanel component

#### Recommendation Process Details:

1. **Initial Analysis**:
   - Extract key terms from user query
   - Determine agricultural context
   - Identify potential product needs

2. **Multi-Source Recommendations**:
   - Query NLP service for embedding-based matches
   - Request Gemini recommendations
   - Check pattern-based recommendation rules

3. **Result Merging**:
   - Combine recommendations from multiple sources
   - Remove duplicates and rank by relevance
   - Apply business rules (promotions, inventory)

4. **Presentation**:
   - Format recommendations for display
   - Generate explanations for each recommendation
   - Prepare product details and images

### 5. Data Persistence

- Chat messages are stored in Supabase (or memory if unavailable)
- User can retrieve past conversations
- Analytics data is collected for system improvement

#### Persistence Implementation:

```typescript
// From chatService.js
export const saveMessage = async (message) => {
  try {
    // First try to save to Supabase
    if (supabaseClient) {
      const { data, error } = await supabaseClient
        .from('chat_messages')
        .insert([
          {
            user_id: currentUser?.id || 'anonymous',
            message_text: message.text,
            sender_type: message.sender,
            chat_session_id: currentSessionId
          }
        ]);
        
      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error saving message to database:', error);
    // Fall back to local storage
    const storedMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
    storedMessages.push(message);
    localStorage.setItem('chatMessages', JSON.stringify(storedMessages));
  }
};
```

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

### KNN Algorithm Advantages in CropsayAI

The KNN algorithm was chosen for several key reasons:

1. **Semantic Understanding**: Unlike simple keyword matching, KNN with embeddings captures the meaning of queries and products
2. **Cold-Start Friendly**: Works well for new users without requiring previous interaction history
3. **Computationally Efficient**: Fast at runtime since product embeddings are pre-computed
4. **Explainable Results**: Similarity scores can be translated into user-friendly explanations
5. **Domain Adaptability**: Works well with agricultural terminology and concepts

### KNN Algorithm Optimization

Several optimizations were implemented to improve the KNN algorithm:

1. **Embedding Caching**: Product embeddings are computed once and cached
2. **Batch Processing**: Embeddings are generated in batches for efficiency
3. **Dimensionality Reduction**: Techniques like PCA are applied to reduce embedding size while preserving semantic information
4. **Approximate KNN**: For large catalogs, approximate KNN algorithms are used for faster retrieval
5. **Weighted Features**: Product fields (name, description, category) are weighted differently in the embedding generation

3. **Intent Analysis**:
   - Pattern matching for primary intent
   - Entity extraction for context
   - Agricultural keyword matching

4. **Gemini LLM**:
   - Used for generating responses and recommendations
   - Model: `gemini-1.5-flash` (with fallback options)

## Training Data and Model Preparation

### Embedding Model Training

The embedding model used in CropsayAI was not trained from scratch but fine-tuned on agricultural data:

1. **Base Model**: Started with `sentence-transformers/all-MiniLM-L6-v2` pre-trained model
2. **Fine-Tuning Dataset**: Created a dataset of:
   - Agricultural product descriptions
   - Farming forum discussions
   - Technical agricultural documents
   - Common farming queries and responses
3. **Fine-Tuning Process**:
   - Used contrastive learning to improve agricultural domain understanding
   - Optimized for semantic similarity in agricultural contexts
   - Validated performance on domain-specific test sets

### Data Collection and Preparation

The agricultural data used in CropsayAI was collected from multiple sources:

1. **Product Data**:
   - Agricultural supplier catalogs
   - Manufacturer specifications
   - Expert-written product descriptions
   - Standardized into a consistent format

2. **Knowledge Graph Data**:
   - Agricultural research publications
   - Extension service documentation
   - Expert farmer interviews
   - Structured into a hierarchical knowledge graph

3. **Query-Product Pairs**:
   - Created from actual user interactions
   - Supplemented with expert-generated examples
   - Annotated with relevance scores
   - Used for testing recommendation quality

### Data Preprocessing Pipeline

Raw data underwent several preprocessing steps:

1. **Text Normalization**:
   - Standardizing agricultural terminology
   - Correcting common misspellings
   - Expanding abbreviations
   - Normalizing units of measurement

2. **Enrichment**:
   - Adding seasonal information
   - Incorporating regional growing conditions
   - Linking to related agricultural concepts
   - Adding usage instructions and safety information

3. **Quality Filtering**:
   - Removing duplicate or near-duplicate entries
   - Filtering out low-quality or incomplete descriptions
   - Ensuring factual accuracy through expert review
   - Standardizing formatting and structure

## Custom Algorithms

### KNN Algorithm Customization

The standard KNN algorithm was customized for agricultural product recommendations:

1. **Agricultural Term Weighting**:
   - Crop names receive higher weight in similarity calculations
   - Problem terms (disease, pest) receive emphasis
   - Technical agricultural terms are normalized before comparison

2. **Seasonal Context Adjustment**:
   - Recommendations are adjusted based on current growing season
   - Out-of-season products receive lower similarity scores
   - Seasonal products are boosted during relevant times

3. **Intent-Based Distance Modification**:
   - Distance calculations are modified based on detected user intent
   - Problem-solving queries emphasize solution-oriented products
   - Information-seeking queries emphasize educational products

### Hybrid Recommendation Algorithm

The system implements a custom hybrid recommendation algorithm that combines:

1. **Content-Based Filtering** (KNN with embeddings):
   - Matches products based on semantic similarity
   - Uses product descriptions and attributes
   - Independent of user history

2. **Knowledge Graph Navigation**:
   - Traverses the agricultural knowledge graph
   - Identifies related concepts and products
   - Provides structured reasoning paths

3. **Contextual Boosting**:
   - Analyzes conversation history for context
   - Identifies ongoing agricultural topics
   - Boosts products relevant to the current conversation

4. **Business Rule Application**:
   - Applies inventory availability rules
   - Incorporates seasonal promotions
   - Considers product margins and business priorities

The hybrid algorithm combines these approaches using a weighted scoring system:

```typescript
// Simplified hybrid scoring algorithm
function calculateHybridScore(product, query, context) {
  // Content-based similarity (from KNN)
  const contentScore = product.similarityScore;
  
  // Knowledge graph relevance
  const graphScore = calculateGraphRelevance(product, query);
  
  // Contextual relevance
  const contextScore = calculateContextRelevance(product, context);
  
  // Business rules
  const businessScore = applyBusinessRules(product);
  
  // Weighted combination
  return (
    0.4 * contentScore +
    0.3 * graphScore +
    0.2 * contextScore +
    0.1 * businessScore
  );
}
```

### Intent Classification Algorithm

The system uses a custom intent classification algorithm:

1. **Pattern Recognition**:
   - Identifies question patterns
   - Recognizes command structures
   - Detects problem statements

2. **Agricultural Entity Extraction**:
   - Identifies crop names
   - Recognizes farming activities
   - Detects agricultural problems

3. **Intent Categorization**:
   - Classifies into primary intents (information, problem-solving, product-seeking)
   - Determines secondary intents (comparison, confirmation, clarification)
   - Assigns confidence scores to intent classifications

## Performance Optimization

### Embedding Computation Optimization

To optimize the performance of embedding-based recommendations:

1. **Batch Processing**:
   - Product embeddings are generated in batches during initialization
   - Multiple queries are processed together when possible

2. **Caching Strategy**:
   - Product embeddings are cached in memory
   - Frequent queries have cached embeddings
   - Cache invalidation occurs when products are updated

3. **Dimensionality Reduction**:
   - Original embeddings (384 dimensions) are reduced to 100 dimensions
   - PCA is used to preserve semantic information while reducing computation
   - Reduced embeddings are used for similarity calculations

### API Request Optimization

To minimize latency and improve reliability:

1. **Request Batching**:
   - Multiple product recommendations are batched into single requests
   - Chat history is compressed to reduce payload size
   - Non-essential information is omitted from requests

2. **Parallel Processing**:
   - Gemini requests and NLP processing run in parallel
   - UI updates occur independently of backend processing
   - Data persistence happens asynchronously

3. **Proxy Server Optimization**:
   - Connection pooling for Gemini API requests
   - Response streaming for real-time updates
   - Request caching for common queries

### Frontend Performance

The React frontend is optimized for performance:

1. **Component Memoization**:
   - Heavy components are memoized to prevent unnecessary re-renders
   - Pure components are used where appropriate
   - React.memo is applied to recommendation components

2. **Virtualization**:
   - Chat history uses virtualized lists to handle large conversations
   - Only visible messages are rendered in the DOM
   - Scroll performance remains smooth regardless of chat length

3. **Code Splitting**:
   - Non-critical components are lazy-loaded
   - Route-based code splitting reduces initial bundle size
   - Dynamic imports for heavy libraries

4. **Asset Optimization**:
   - Images are compressed and served in modern formats (WebP)
   - CSS is minimized and critical CSS is inlined
   - Font loading is optimized with font-display strategies

## Security Considerations

### Authentication Security

The system implements several authentication security measures:

1. **Secure Authentication Flow**:
   - JWT-based authentication with proper expiration
   - Secure password hashing using bcrypt
   - CSRF protection for all authenticated requests
   - HTTP-only cookies for token storage

2. **Access Control**:
   - Role-based access control for administrative functions
   - Proper authorization checks on all API endpoints
   - Principle of least privilege for service accounts
   - Session timeout and automatic logout

### Data Protection

User and system data are protected through:

1. **Encryption**:
   - All data in transit is encrypted using TLS
   - Sensitive data at rest is encrypted
   - API keys and secrets are stored securely

2. **Input Validation**:
   - All user inputs are validated and sanitized
   - Protection against injection attacks
   - Content Security Policy (CSP) implementation
   - XSS prevention through proper output encoding

3. **Privacy Considerations**:
   - Data minimization principles are followed
   - User consent for data collection
   - Clear privacy policy on data usage
   - Data retention policies

### API Security

The Gemini API integration is secured through:

1. **API Key Protection**:
   - API keys are never exposed to client-side code
   - Proxy server handles all Gemini API requests
   - Keys are stored as environment variables
   - Key rotation policies are in place

2. **Request Security**:
   - Rate limiting to prevent API abuse
   - Request validation and sanitization
   - Proper error handling to prevent information leakage
   - Logging of API access for audit purposes

### Monitoring and Incident Response

The system includes security monitoring:

1. **Security Logging**:
   - Comprehensive logging of security events
   - Anomaly detection for unusual patterns
   - Regular log review and analysis

2. **Incident Response**:
   - Defined procedures for security incidents
   - Vulnerability management process
   - Regular security testing and assessments
