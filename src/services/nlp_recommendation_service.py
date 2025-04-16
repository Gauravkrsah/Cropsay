"""
NLP Recommendation Service for CropsayAI (Compatible with PyTorch 2.6.0+)

This script provides advanced NLP capabilities using transformers and other ML techniques
to enhance the recommendation system. It can be run as a standalone service that the
JavaScript frontend can call via API.

Requirements:
- transformers
- torch>=2.6.0
- numpy
- scikit-learn
- fastapi
- uvicorn
"""

import json
import os
import re
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
import torch
from transformers import AutoTokenizer, AutoModel
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import logging

# Initialize FastAPI app
app = FastAPI(title="CropsayAI NLP Recommendation Service")

# Load transformer model for embeddings
# Using a smaller model for efficiency, but can be replaced with larger models for better quality
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModel.from_pretrained(MODEL_NAME)

# Path to product data
PRODUCT_DATA_PATH = "src/data/productData.ts"

# Sample products to use as fallback
SAMPLE_PRODUCTS = [
    {"id": 1, "name": "Chili Seeds", "description": "The Chili Seeds Pack", "category": "Seeds", "rating": 4.8, "price": 429.99},
    {"id": 87, "name": "Battery Sprayer-2iN1", "description": "The Battery Sprayer by Agritech", "category": "Tools & Equipment", "subcategory": "Sprayers", "rating": 4.7, "price": 17422.37},
    {"id": 88, "name": "Nano Sprayer-XR", "description": "The Nano Sprayer by Eco", "category": "Tools & Equipment", "subcategory": "Sprayers", "rating": 4.6, "price": 2977.75},
    {"id": 2, "name": "Tomato Seed", "description": "The Tomato Seed Pack", "category": "Seeds", "rating": 4.7, "price": 350.00},
    {"id": 29, "name": "NPK 12-12-17", "description": "The NPK 12-12-17", "category": "Fertilizers", "rating": 4.8, "price": 368.42},
    {"id": 54, "name": "Chlorpyrifos", "description": "The Chlorpyrifos by Eco", "category": "Pesticides", "rating": 4.5, "price": 450.00}
]

# Initialize variables
product_embeddings = None
products = []

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatSession(BaseModel):
    id: str
    messages: List[ChatMessage]
    timestamp: str

class RecommendationRequest(BaseModel):
    query: str
    chat_history: Optional[List[ChatMessage]] = None
    limit: int = 10  # Increased default limit to show more recommendations

class ProductRecommendation(BaseModel):
    id: int
    name: str
    score: float
    reasoning: str

class RecommendationResponse(BaseModel):
    recommendations: List[ProductRecommendation]
    query_embedding: List[float]
    intent_analysis: Dict[str, Any]

def extract_products_from_ts_file(file_path: str) -> List[Dict[str, Any]]:
    """
    Extract product data from TypeScript file
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find the products array
        start_idx = content.find('export const products: Product[] = [')
        if start_idx == -1:
            raise ValueError("Products array not found in file")
        
        # Extract the array content
        content = content[start_idx:]
        bracket_count = 0
        end_idx = 0
        
        for i, char in enumerate(content):
            if char == '[':
                bracket_count += 1
            elif char == ']':
                bracket_count -= 1
                if bracket_count == 0:
                    end_idx = i + 1
                    break
        
        if end_idx == 0:
            raise ValueError("Could not find end of products array")
        
        products_ts = content[:end_idx]
        
        # Convert TypeScript to JSON-like format
        # First, remove the TypeScript declaration
        products_json = products_ts.replace('export const products: Product[] = ', '')
        
        # Remove multiline comments
        products_json = re.sub(r'/\*\*[\s\S]*?\*/', '', products_json)
        # Remove single line comments
        products_json = re.sub(r'//.*$', '', products_json, flags=re.MULTILINE)
        # Remove trailing commas
        products_json = re.sub(r',(\s*[\]}])', r'\1', products_json)
        
        # Parse the JSON
        products_data = json.loads(products_json)
        return products_data
    
    except Exception as e:
        print(f"Error extracting products from TypeScript file: {e}")
        # Return empty list on error
        return []

def get_embedding(text: str) -> np.ndarray:
    """
    Get embedding for text using transformer model
    Compatible with PyTorch 2.6.0+
    """
    # Tokenize and get model outputs
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512)
    
    # Remove token_type_ids if present (for compatibility with newer PyTorch versions)
    if 'token_type_ids' in inputs:
        del inputs['token_type_ids']
    
    with torch.no_grad():
        outputs = model(**inputs)
    
    # Mean pooling to get sentence embedding
    attention_mask = inputs["attention_mask"]
    token_embeddings = outputs.last_hidden_state
    input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
    sum_embeddings = torch.sum(token_embeddings * input_mask_expanded, 1)
    sum_mask = torch.clamp(input_mask_expanded.sum(1), min=1e-9)
    embedding = sum_embeddings / sum_mask
    
    return embedding.numpy()[0]

def load_products_and_embeddings():
    """
    Load products and compute embeddings
    """
    global products, product_embeddings
    
    # Load products
    products = extract_products_from_ts_file(PRODUCT_DATA_PATH)
    
    if not products:
        products = SAMPLE_PRODUCTS
    
    # Compute embeddings for all products
    product_texts = [
        f"{p['name']} {p.get('description', '')} {p.get('category', '')} {p.get('subcategory', '')}"
        for p in products
    ]
    
    try:
        product_embeddings = np.array([get_embedding(text) for text in product_texts])
    except Exception as e:
        print(f"Error computing embeddings: {e}")
        product_embeddings = np.zeros((len(products), 384))  # Default embedding size


def analyze_intent(query: str, chat_history: Optional[List[ChatMessage]] = None) -> Dict[str, Any]:
    """
    Analyze user intent from query and chat history
    """
    # Extract keywords
    keywords = set()
    
    # Common agricultural keywords
    agricultural_keywords = {
        "crops": ["wheat", "rice", "corn", "maize", "tomato", "potato", "garlic", "onion", "carrot", "plant", "plants"],
        "problems": ["disease", "pest", "weed", "fungus", "blight", "rot", "deficiency"],
        "activities": ["grow", "plant", "harvest", "water", "watering", "fertilize", "spray", "spraying", "irrigate", "irrigation"],
        "products": ["seed", "fertilizer", "pesticide", "tool", "equipment", "irrigation"]
    }
    
    # Check for keywords in query
    query_lower = query.lower()
    found_keywords = {
        category: [kw for kw in keywords_list if kw in query_lower]
        for category, keywords_list in agricultural_keywords.items()
    }
    
    # Determine primary intent
    intent = "browsing"
    if any(word in query_lower for word in ["how", "what is", "explain"]):
        intent = "learning"
    elif any(word in query_lower for word in ["recommend", "suggest", "best"]):
        intent = "recommendation"
    elif any(word in query_lower for word in ["problem", "issue", "disease", "pest"]):
        intent = "problem-solving"
    elif any(word in query_lower for word in ["buy", "purchase", "price"]):
        intent = "purchasing"
    elif any(word in query_lower for word in ["water", "spray", "spraying", "irrigate", "irrigation"]):
        intent = "watering"
    
    # Analyze chat history if available
    chat_context = {}
    if chat_history:
        user_messages = [msg.content for msg in chat_history if msg.role == "user"]
        if user_messages:
            # Extract topics from chat history
            all_history_text = " ".join(user_messages)
            chat_context["topics"] = [
                kw for category in agricultural_keywords.values()
                for kw in category if kw in all_history_text.lower()
            ]
    
    return {
        "intent": intent,
        "keywords": found_keywords,
        "chat_context": chat_context
    }

def get_recommendations(
    query: str,
    chat_history: Optional[List[ChatMessage]] = None,
    limit: int = 3
) -> Tuple[List[Dict[str, Any]], np.ndarray, Dict[str, Any]]:
    """
    Get product recommendations using transformer embeddings and KNN
    """
    global products, product_embeddings
    
    # Load products and embeddings if not already loaded
    if products is None or product_embeddings is None:
        load_products_and_embeddings()
    
    # Analyze intent
    intent_analysis = analyze_intent(query, chat_history)
    
    # Get embedding for query
    try:
        query_embedding = get_embedding(query)
    except Exception as e:
        print(f"Error getting query embedding: {e}")
        # Return default recommendations if embedding fails
        top_products = sorted(SAMPLE_PRODUCTS, key=lambda p: p.get('rating', 0), reverse=True)[:limit]
        recommendations = [
            {
                "id": p["id"],
                "name": p["name"],
                "score": 0.5,  # Default score
                "reasoning": "This is a popular product that might be relevant to your needs."
            }
            for p in top_products
        ]
        return recommendations, [0] * 384, intent_analysis
    
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
    
    # Sort by similarity (highest first)
    similarities.sort(key=lambda x: x[1], reverse=True)
    
    # Get top recommendations
    recommendations = []
    for i, score in similarities[:limit]:
        product = products[i]
        
        # Generate reasoning based on intent and product
        reasoning = f"This product matches your query with {score:.2f} similarity."
        
        if intent_analysis["intent"] == "problem-solving":
            if product.get("category") == "Pesticides":
                reasoning = "This pesticide can help solve crop problems mentioned in your query."
            elif product.get("category") == "Fertilizers":
                reasoning = "This fertilizer can address nutrient deficiencies that might be causing your crop issues."
        
        elif intent_analysis["intent"] == "watering":
            if product.get("subcategory") == "Sprayers" or "spray" in product.get("name", "").lower() or "spray" in product.get("description", "").lower():
                reasoning = "This sprayer is perfect for watering your plants efficiently and effectively."
        
        elif intent_analysis["intent"] == "recommendation":
            reasoning = f"This is a highly rated {product.get('category', 'product')} that matches your needs."
        
        recommendations.append({
            "id": product["id"],
            "name": product["name"],
            "score": float(score),
            "reasoning": reasoning
        })
    
    return recommendations, query_embedding.tolist(), intent_analysis

@app.post("/recommendations", response_model=RecommendationResponse)
async def get_recommendations_api(request: RecommendationRequest):
    """
    API endpoint to get recommendations
    """
    try:
        recommendations, query_embedding, intent_analysis = get_recommendations(
            request.query,
            request.chat_history,
            request.limit
        )
        
        return {
            "recommendations": recommendations,
            "query_embedding": query_embedding,
            "intent_analysis": intent_analysis
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")

@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy", "pytorch_version": torch.__version__}

if __name__ == "__main__":
    # Load products and embeddings on startup
    load_products_and_embeddings()
    
    # Start the server
    uvicorn.run(app, host="0.0.0.0", port=3001)