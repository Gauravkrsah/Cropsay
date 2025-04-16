# CropsayAI System Analysis and Design Diagrams

## 3.1.1 Use-Case Modeling

### Use-Case Diagram

The following use-case diagram illustrates the main actors and use cases in the CropsayAI system:

```mermaid
graph TD
    subgraph Actors
        Farmer[Farmer]
        Expert[Agricultural Expert]
        Admin[System Administrator]
    end
    
    subgraph Use Cases
        UC1[UC1: Register/Login]
        UC2[UC2: Chat with Expert]
        UC3[UC3: View Recommendations]
        UC4[UC4: Add Products to Cart]
        UC5[UC5: Manage Profile]
        UC6[UC6: Provide Expert Advice]
        UC7[UC7: Schedule Consultation]
        UC8[UC8: Manage Product Catalog]
        UC9[UC9: Monitor System]
    end
    
    Farmer --> UC1
    Farmer --> UC2
    Farmer --> UC3
    Farmer --> UC4
    Farmer --> UC5
    Farmer --> UC7
    
    Expert --> UC1
    Expert --> UC2
    Expert --> UC6
    Expert --> UC7
    
    Admin --> UC1
    Admin --> UC8
    Admin --> UC9
```

### Use-Case Descriptions

#### UC1: Register/Login
**Actor:** Farmer, Expert, Administrator  
**Description:** Users can create an account or log in to an existing account.  
**Preconditions:** User has internet access and has downloaded the application.  
**Main Flow:**
1. User opens the application
2. User selects "Register" or "Login"
3. For registration:
   - User provides email, password, and profile information
   - System validates the information
   - System creates a new account
4. For login:
   - User provides email and password
   - System validates credentials
   - System grants access to the application
**Alternative Flows:**
- If validation fails, system displays appropriate error message
- User can request password reset if forgotten
**Postconditions:** User is authenticated and can access the system.

#### UC2: Chat with Expert
**Actor:** Farmer, Expert  
**Description:** Farmers can chat with agricultural experts to get advice on farming issues.  
**Preconditions:** User is logged in.  
**Main Flow:**
1. Farmer navigates to the chat section
2. Farmer selects an available expert
3. Farmer sends messages describing their agricultural situation
4. Expert receives messages and responds with advice
5. System analyzes chat content for product recommendations
**Alternative Flows:**
- If no experts are available, farmer can schedule a consultation for later
- If farmer prefers, they can chat with AI assistant instead of human expert
**Postconditions:** Farmer receives expert advice and system generates relevant product recommendations.

#### UC3: View Recommendations
**Actor:** Farmer  
**Description:** Farmers can view personalized product recommendations based on their chat history.  
**Preconditions:** User is logged in and has chat history.  
**Main Flow:**
1. Farmer navigates to recommendations panel
2. System analyzes farmer's chat history
3. System generates personalized product recommendations
4. Farmer views recommended products with details
5. Farmer can filter recommendations by category
**Alternative Flows:**
- If farmer has no chat history, system shows default recommendations
- Farmer can refresh recommendations after new chat interactions
**Postconditions:** Farmer sees relevant agricultural products that address their needs.

#### UC4: Add Products to Cart
**Actor:** Farmer  
**Description:** Farmers can add recommended products to their shopping cart.  
**Preconditions:** User is logged in and viewing product recommendations.  
**Main Flow:**
1. Farmer selects a recommended product
2. Farmer clicks "Add to Cart" button
3. System adds product to farmer's cart
4. System updates cart count and total
5. Farmer can continue shopping or proceed to checkout
**Alternative Flows:**
- Farmer can adjust quantity of products in cart
- Farmer can remove products from cart
**Postconditions:** Selected products are added to farmer's shopping cart.

#### UC5: Manage Profile
**Actor:** Farmer  
**Description:** Farmers can view and update their profile information.  
**Preconditions:** User is logged in.  
**Main Flow:**
1. Farmer navigates to profile section
2. Farmer views current profile information
3. Farmer edits information as needed
4. System validates and saves changes
**Alternative Flows:**
- If validation fails, system displays appropriate error message
**Postconditions:** Farmer's profile information is updated.

#### UC6: Provide Expert Advice
**Actor:** Expert  
**Description:** Agricultural experts can provide advice to farmers through the chat interface.  
**Preconditions:** Expert is logged in.  
**Main Flow:**
1. Expert views list of active chat requests
2. Expert selects a chat to respond to
3. Expert reads farmer's messages
4. Expert provides advice and recommendations
5. System records the interaction
**Alternative Flows:**
- Expert can schedule follow-up consultations if needed
- Expert can refer farmer to other experts for specialized advice
**Postconditions:** Farmer receives expert advice for their agricultural issues.

#### UC7: Schedule Consultation
**Actor:** Farmer, Expert  
**Description:** Users can schedule consultations for more in-depth discussions.  
**Preconditions:** User is logged in.  
**Main Flow:**
1. User navigates to scheduling section
2. User selects available time slot
3. User provides consultation topic and details
4. System confirms the appointment
5. System sends notifications to both parties
**Alternative Flows:**
- If selected time is no longer available, system suggests alternative times
- Users can reschedule or cancel appointments
**Postconditions:** Consultation is scheduled and both parties are notified.

#### UC8: Manage Product Catalog
**Actor:** Administrator  
**Description:** Administrators can add, update, or remove products from the catalog.  
**Preconditions:** Administrator is logged in.  
**Main Flow:**
1. Administrator navigates to product management section
2. Administrator can view existing products
3. Administrator can add new products with details
4. Administrator can update product information
5. Administrator can remove products from catalog
**Alternative Flows:**
- Administrator can import products in bulk
- Administrator can categorize products
**Postconditions:** Product catalog is updated with changes.

#### UC9: Monitor System
**Actor:** Administrator  
**Description:** Administrators can monitor system performance and usage.  
**Preconditions:** Administrator is logged in.  
**Main Flow:**
1. Administrator navigates to monitoring dashboard
2. Administrator views system metrics and statistics
3. Administrator can generate reports
4. Administrator can identify and address issues
**Alternative Flows:**
- Administrator can set up alerts for critical issues
- Administrator can optimize system performance
**Postconditions:** Administrator has insights into system performance and usage.

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