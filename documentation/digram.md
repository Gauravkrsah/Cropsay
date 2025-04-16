# CropsayAI System Analysis and Design Diagrams

## 3.1.3 Object Modeling: Object & Class Diagram

The class diagram illustrates the key classes and their relationships in the CropsayAI system:

```mermaid
classDiagram
    class Product {
        +id: number
        +name: string
        +description: string
        +category: string
        +subcategory: string
        +price: number
        +rating: number
        +image: string
    }
    
    class AgriculturalKnowledgeGraph {
        +crops: Crop[]
        +problems: Problem[]
        +activities: Activity[]
    }
    
    class Crop {
        +id: string
        +name: string
        +scientificName: string
        +growingSeason: string[]
        +commonProblems: string[]
        +relatedProducts: string[]
    }
    
    class Problem {
        +id: string
        +name: string
        +description: string
        +affectedCrops: string[]
        +solutions: string[]
        +relatedProducts: string[]
    }
    
    class Activity {
        +id: string
        +name: string
        +description: string
        +relatedCrops: string[]
        +relatedProducts: string[]
        +season: string[]
    }
    
    class RecommendationService {
        +getRecommendationsFromChat(userId: string, limit: number): Promise<Product[]>
        -extractKeywords(text: string): string[]
        -getCategoriesFromKeywords(keywords: string[]): string[]
        -calculateTfIdf(document: string, allDocuments: string[]): Map<string, number>
        -cosineSimilarity(vector1: Map<string, number>, vector2: Map<string, number>): number
        -getRecommendationsUsingKNN(chatText: string, limit: number): Product[]
        -getRecommendationsUsingNLP(chatText: string, limit: number): Product[]
        -getRecommendationsUsingKnowledgeGraph(chatText: string, limit: number): Product[]
    }
    
    class DynamicRecommendationService {
        +getDynamicRecommendations(query: string, limit: number): Promise<Product[]>
        -getDefaultRecommendations(limit: number): Product[]
    }
    
    class NLPBridgeService {
        +getNLPRecommendations(query: string, limit: number): Promise<Product[]>
        -callNLPService(query: string, limit: number): Promise<RecommendationResponse>
    }
    
    class ChatService {
        +getChatSessions(userId: string): Promise<ChatSession[]>
        +createChatSession(userId: string): Promise<ChatSession>
        +addMessage(sessionId: string, message: ChatMessage): Promise<void>
    }
    
    class CartContext {
        +items: CartItem[]
        +addItem(product: Product): void
        +removeItem(productId: number): void
        +updateQuantity(productId: number, quantity: number): void
        +clearCart(): void
    }
    
    class ExpertPanel {
        +isOpen: boolean
        +title: string
        +onClose(): void
        -handleChatNow(expert: Expert): void
        -handleSchedule(expert: Expert): void
        -handleAddToCart(product: Product): void
        -loadRecommendations(): void
    }
    
    class Expert {
        +id: string
        +name: string
        +role: string
        +experience: string
        +languages: string[]
        +rating: number
        +image: string
    }
    
    class ChatSession {
        +id: string
        +userId: string
        +timestamp: Date
        +messages: ChatMessage[]
    }
    
    class ChatMessage {
        +id: string
        +sessionId: string
        +content: string
        +role: string
        +timestamp: Date
    }
    
    AgriculturalKnowledgeGraph "1" -- "many" Crop: contains
    AgriculturalKnowledgeGraph "1" -- "many" Problem: contains
    AgriculturalKnowledgeGraph "1" -- "many" Activity: contains
    
    RecommendationService --> Product: recommends
    RecommendationService --> AgriculturalKnowledgeGraph: uses
    DynamicRecommendationService --> Product: recommends
    NLPBridgeService --> Product: recommends
    
    ExpertPanel --> Expert: displays
    ExpertPanel --> CartContext: uses
    ExpertPanel --> DynamicRecommendationService: uses
    ExpertPanel --> NLPBridgeService: uses
    
    ChatService --> ChatSession: manages
    ChatSession --> ChatMessage: contains
    
    CartContext --> Product: contains
```

## 3.1.4 Dynamic Modeling: State & Sequence Diagrams

### State Diagram

The following state diagram illustrates the states of the recommendation system:

```mermaid
stateDiagram-v2
    [*] --> Idle
    
    Idle --> ProcessingQuery: User sends message
    ProcessingQuery --> AttemptingNLP: Extract query from chat
    
    AttemptingNLP --> UsingNLPService: NLP service available
    AttemptingNLP --> UsingAIService: NLP service unavailable
    
    UsingNLPService --> GeneratingRecommendations: Get embeddings
    UsingAIService --> GeneratingRecommendations: Call Gemini API
    
    GeneratingRecommendations --> DisplayingRecommendations: Recommendations generated
    GeneratingRecommendations --> DisplayingDefaults: Generation failed
    
    DisplayingRecommendations --> Idle: User continues chat
    DisplayingDefaults --> Idle: User continues chat
    
    Idle --> [*]: Application closed
```

### Sequence Diagram

The following sequence diagram illustrates the process of generating product recommendations based on user chat:

```mermaid
sequenceDiagram
    actor User
    participant UI as ExpertPanel
    participant ChatSvc as ChatService
    participant RecSvc as RecommendationService
    participant DynamicSvc as DynamicRecommendationService
    participant NLPBridge as NLPBridgeService
    participant NLPSvc as NLP Service (Python)
    participant Gemini as Google Gemini API
    
    User->>UI: View Recommendations
    activate UI
    
    UI->>ChatSvc: getChatSessions(userId)
    activate ChatSvc
    ChatSvc-->>UI: chatSessions
    deactivate ChatSvc
    
    Note over UI,ChatSvc: Extract recent messages
    
    UI->>DynamicSvc: getDynamicRecommendations(query, limit)
    activate DynamicSvc
    
    alt NLP Service Available
        DynamicSvc->>NLPBridge: getNLPRecommendations(query, limit)
        activate NLPBridge
        NLPBridge->>NLPSvc: POST /recommendations
        activate NLPSvc
        NLPSvc->>NLPSvc: analyze_intent(query)
        NLPSvc->>NLPSvc: get_embedding(query)
        NLPSvc->>NLPSvc: calculate similarities
        NLPSvc-->>NLPBridge: recommendations
        deactivate NLPSvc
        NLPBridge-->>DynamicSvc: nlpRecommendations
        deactivate NLPBridge
    else NLP Service Unavailable
        DynamicSvc->>Gemini: generateContent(prompt)
        activate Gemini
        Gemini-->>DynamicSvc: analysis
        deactivate Gemini
        DynamicSvc->>DynamicSvc: Parse categories and features
        DynamicSvc->>DynamicSvc: Match products
    end
    
    DynamicSvc-->>UI: recommendations
    deactivate DynamicSvc
    
    UI->>UI: Display recommendations
    UI-->>User: Show recommended products
    
    User->>UI: Add product to cart
    UI->>CartContext: addItem(product)
    
    deactivate UI
```

## 3.1.5 Process Modeling: Activity Diagram

The following activity diagram illustrates the process of generating and displaying recommendations:

```mermaid
graph TD
    A[Start] --> B{Has chat history?}
    B -->|No| C[Show empty recommendations]
    B -->|Yes| D[Load existing chat]
    D --> E[Create query from messages]
    E --> F{Try NLP Service}
    
    F -->|Available| G[Call NLP Service API]
    F -->|Unavailable| H[Use Gemini API]
    
    G --> I[Process NLP response]
    H --> J[Process Gemini response]
    
    I --> K[Map to product objects]
    J --> K
    
    K --> L[Filter by selected category]
    L --> M[Display recommendations]
    C --> N[Prompt user to create chat]
    M --> O[User views recommendations]
    
    O --> P{User action?}
    P -->|Add to cart| Q[Add product to cart]
    P -->|Filter| R[Apply category filter]
    P -->|Close panel| S[Close recommendations panel]
    
    Q --> O
    R --> M
    S --> T[End]
    N --> T
```

## 3.2.1 Refinement of Classes and Objects

The CropsayAI system refines the classes and objects identified in the object modeling phase to ensure they meet the system requirements. Key refinements include:

```mermaid
classDiagram
    class RecommendationStrategy {
        <<interface>>
        +getRecommendations(query: string, limit: number): Promise<Product[]>
    }
    
    class KNNRecommendationStrategy {
        +getRecommendations(query: string, limit: number): Promise<Product[]>
        -extractFeatures(text: string): number[]
        -calculateDistance(vector1: number[], vector2: number[]): number
    }
    
    class NLPRecommendationStrategy {
        +getRecommendations(query: string, limit: number): Promise<Product[]>
        -calculateTfIdf(document: string, allDocuments: string[]): Map<string, number>
        -cosineSimilarity(vector1: Map<string, number>, vector2: Map<string, number>): number
    }
    
    class KnowledgeGraphRecommendationStrategy {
        +getRecommendations(query: string, limit: number): Promise<Product[]>
        -extractEntities(text: string): Entity[]
        -scoreProducts(entities: Entity[], products: Product[]): ScoredProduct[]
    }
    
    class GeminiRecommendationStrategy {
        +getRecommendations(query: string, limit: number): Promise<Product[]>
        -generatePrompt(query: string, categories: string[], subcategories: string[]): string
        -parseResponse(response: string): AnalysisResult
    }
    
    class RecommendationService {
        -strategies: Map<string, RecommendationStrategy>
        +getRecommendationsFromChat(userId: string, limit: number): Promise<Product[]>
        +registerStrategy(name: string, strategy: RecommendationStrategy): void
        -selectStrategy(query: string): RecommendationStrategy
    }
    
    class ProductRepository {
        +getAll(): Product[]
        +getByCategory(category: string): Product[]
        +getBySubcategory(subcategory: string): Product[]
        +getById(id: number): Product
        +search(query: string): Product[]
    }
    
    class AgriculturalKnowledgeGraphService {
        +getCrops(): Crop[]
        +getProblems(): Problem[]
        +getActivities(): Activity[]
        +findRelatedProducts(entity: string, type: string): string[]
        +findRelatedEntities(entityId: string, type: string): Entity[]
    }
    
    RecommendationStrategy <|.. KNNRecommendationStrategy
    RecommendationStrategy <|.. NLPRecommendationStrategy
    RecommendationStrategy <|.. KnowledgeGraphRecommendationStrategy
    RecommendationStrategy <|.. GeminiRecommendationStrategy
    
    RecommendationService --> RecommendationStrategy: uses
    RecommendationService --> ProductRepository: uses
    RecommendationService --> AgriculturalKnowledgeGraphService: uses
    
    KnowledgeGraphRecommendationStrategy --> AgriculturalKnowledgeGraphService: uses
```

## 3.2.2 Component Diagram

The following component diagram illustrates the main components of the CropsayAI system and their interactions:

```mermaid
graph TD
    subgraph "Frontend Components"
        AppLayout[AppLayout]
        ExpertPanel[ExpertPanel]
        ShoppingCart[ShoppingCart]
        ChatPage[ChatPage]
        ShopPage[ShopPage]
    end
    
    subgraph "Service Components"
        RecService[RecommendationService]
        DynamicRecService[DynamicRecommendationService]
        NLPBridge[NLPBridgeService]
        ChatService[ChatService]
        AuthContext[AuthContext]
        CartContext[CartContext]
    end
    
    subgraph "Data Components"
        ProductData[ProductData]
        KnowledgeGraph[AgriculturalKnowledgeGraph]
    end
    
    subgraph "External Services"
        NLPService[Python NLP Service]
        GeminiAPI[Google Gemini API]
        Supabase[Supabase]
    end
    
    AppLayout --> ExpertPanel
    AppLayout --> ShoppingCart
    AppLayout --> ChatPage
    AppLayout --> ShopPage
    
    ExpertPanel --> NLPBridge
    ExpertPanel --> DynamicRecService
    ExpertPanel --> CartContext
    
    ChatPage --> ChatService
    ChatPage --> RecService
    
    ShopPage --> ProductData
    ShopPage --> CartContext
    
    RecService --> ProductData
    RecService --> ChatService
    RecService --> KnowledgeGraph
    
    DynamicRecService --> GeminiAPI
    DynamicRecService --> ProductData
    
    NLPBridge --> NLPService
    
    ChatService --> Supabase
    AuthContext --> Supabase
```

## 3.2.3 Deployment Diagram

The following deployment diagram illustrates how the CropsayAI system is deployed:

```mermaid
graph TD
    subgraph "Client Device"
        Browser[Web Browser]
    end
    
    subgraph "Web Server"
        Frontend[React Frontend]
        JSServices[JavaScript Services]
    end
    
    subgraph "NLP Server"
        PythonService[Python NLP Service]
        TransformerModels[Transformer Models]
    end
    
    subgraph "External Services"
        GeminiAPI[Google Gemini API]
        SupabaseDB[Supabase Database]
    end
    
    Browser <--> Frontend: HTTPS
    Frontend <--> JSServices: Internal
    JSServices <--> PythonService: HTTP
    JSServices <--> GeminiAPI: HTTPS
    JSServices <--> SupabaseDB: HTTPS
    PythonService <--> TransformerModels: Internal