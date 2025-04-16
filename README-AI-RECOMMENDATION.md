# AI-Based Recommendation System for CropsayAI

This document provides an overview of the AI-based recommendation system implemented for CropsayAI. The system uses a combination of advanced NLP techniques, transformers, and Google's Gemini LLM to provide intelligent product recommendations based on user chat history and queries.

## Architecture Overview

The recommendation system consists of several components:

1. **AI Recommendation Service** - Core JavaScript service that uses Gemini and intent analysis
2. **NLP Recommendation Service** - Python service using transformers and KNN for advanced NLP
3. **NLP Bridge Service** - Connects the frontend with the Python NLP service
4. **Integration with ExpertPanel** - UI component that displays recommendations

## Components

### AI Recommendation Service (`aiRecommendationService.ts`)

This service provides AI-powered recommendations using Google's Gemini LLM. It:

- Analyzes user intent from chat text
- Extracts entities (crops, problems, activities) from text
- Analyzes chat history for context
- Uses Gemini to generate personalized recommendations

Key features:
- Intent understanding (learning, recommendation, problem-solving, purchasing)
- Entity extraction using agricultural knowledge graph
- Chat history analysis for persistent interests
- Fallback mechanisms for robustness

### NLP Recommendation Service (`nlp_recommendation_service.py`)

This Python service provides advanced NLP capabilities using transformers:

- Uses transformer models for text embeddings
- Implements KNN for finding similar products
- Provides a FastAPI server for easy integration
- Analyzes intent and extracts keywords

Key features:
- Transformer-based embeddings for semantic understanding
- KNN algorithm for finding similar products
- Intent analysis for better recommendations
- REST API for easy integration with the frontend

### NLP Bridge Service (`nlpBridgeService.ts`)

This service connects the JavaScript frontend with the Python NLP service:

- Handles communication with the Python service
- Provides fallback mechanisms if the service is unavailable
- Maps NLP recommendations to actual products

### Integration with ExpertPanel

The ExpertPanel component has been updated to:

- Try using the NLP service first for recommendations
- Fall back to the AI recommendation service if needed
- Display an indicator when using advanced NLP recommendations

## How It Works

1. When a user interacts with the chat:
   - Their messages are analyzed for intent and entities
   - Chat history is analyzed for context
   - The system tries to use the NLP service first
   - If unavailable, it falls back to the Gemini-based service

2. The recommendation process:
   - Extract intent and entities from user query
   - Find products that match the user's needs
   - Rank products based on relevance
   - Return top recommendations with explanations

3. The UI displays:
   - Recommended products based on the analysis
   - An indicator when using advanced NLP
   - Filters for different product categories

## Setup and Running

### Installation

1. Install JavaScript dependencies:
   ```bash
   npm install
   ```

2. Install Python dependencies:
   ```bash
   # Note: Requires PyTorch 2.6.0 or higher
   pip install -r nlp-service-requirements.txt
   ```

### Starting the Services

1. Start all services at once:
   ```bash
   npm run start:all
   ```

2. Or start services individually:
   ```bash
   # Start the frontend
   npm run dev
   
   # Start the Gemini proxy
   npm run start:gemini
   
   # Start the NLP service
   npm run start:nlp
   ```

## Technical Details

### Transformer Models

The system uses the `sentence-transformers/all-MiniLM-L6-v2` model for generating embeddings. This model:
- Is lightweight but powerful
- Provides good semantic understanding
- Works well for product recommendation tasks

### KNN Algorithm

The K-Nearest Neighbors algorithm is used to find similar products:
- Computes embeddings for all products
- Finds products with similar embeddings to the query
- Ranks by similarity score

### Intent Analysis

The system analyzes user intent using:
- Pattern matching for primary intent
- Entity extraction for context
- Sentiment analysis
- Urgency detection

## Future Improvements

1. **Fine-tuned Models**: Train domain-specific models on agricultural data
2. **User Feedback Loop**: Incorporate user feedback to improve recommendations
3. **Seasonal Awareness**: Add awareness of growing seasons and regional factors
4. **Multi-modal Support**: Add support for image-based queries (e.g., disease identification)
5. **Personalization**: Improve personalization based on user history and preferences

## Conclusion

This AI-based recommendation system provides intelligent, context-aware product recommendations by combining the power of transformers, NLP, and Gemini LLM. It understands user intent, analyzes chat history, and provides relevant recommendations to help users find the right agricultural products for their needs.