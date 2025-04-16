# CropsayAI System Analysis and Design Diagrams

## 3.1.1 Use-Case Modeling

### Use-Case Diagram

The following use-case diagram illustrates the main actors and use cases in the CropsayAI system:

```mermaid
actor Farmer
actor "Agricultural Expert" as Expert
actor Administrator

rectangle "CropsayAI System" {
  usecase "Register/Login" as UC1
  usecase "Chat with Expert" as UC2
  usecase "View Recommendations" as UC3
  usecase "Add Products to Cart" as UC4
  usecase "Manage Profile" as UC5
  usecase "Provide Expert Advice" as UC6
  usecase "Schedule Consultation" as UC7
  usecase "Manage Product Catalog" as UC8
  usecase "Monitor System" as UC9
}

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

Administrator --> UC1
Administrator --> UC8
Administrator --> UC9
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
    class User {
        +id: string
        +email: string
        +password: string
        +role: string
        +register(): void
        +login(): void
        +logout(): void
    }
    
    class Farmer {
        +profile: Profile
        +viewRecommendations(): void
        +addToCart(product: Product): void
        +scheduleConsultation(expert: Expert): void
    }
    
    class Expert {
        +specialization: string
        +rating: number
        +availability: boolean
        +provideAdvice(chat: ChatSession): void
        +updateAvailability(): void
    }
    
    class Administrator {
        +manageProducts(): void
        +monitorSystem(): void
        +generateReports(): void
    }
    
    class Product {
        +id: number
        +name: string
        +description: string
        +category: string
        +subcategory: string
        +price: number
        +rating: number
        +image: string
        +getDetails(): ProductDetails
    }
    
    class AgriculturalKnowledgeGraph {
        +crops: Crop[]
        +problems: Problem[]
        +activities: Activity[]
        +findRelatedProducts(entity: string): Product[]
        +getEntityRelationships(entityId: string): Relationship[]
    }
    
    class ChatSession {
        +id: string
        +userId: string
        +expertId: string
        +timestamp: Date
        +messages: ChatMessage[]
        +addMessage(message: ChatMessage): void
        +getHistory(): ChatMessage[]
    }
    
    class ChatMessage {
        +id: string
        +sessionId: string
        +content: string
        +role: string
        +timestamp: Date
    }
    
    class RecommendationService {
        +getRecommendationsFromChat(userId: string): Product[]
        +analyzeIntent(text: string): Intent
        +extractEntities(text: string): Entity[]
        +rankProducts(entities: Entity[], intent: Intent): Product[]
    }
    
    class CartContext {
        +items: CartItem[]
        +addItem(product: Product): void
        +removeItem(productId: number): void
        +updateQuantity(productId: number, quantity: number): void
        +getTotal(): number
    }
    
    class CartItem {
        +id: string
        +productId: number
        +quantity: number
        +price: number
        +getSubtotal(): number
    }
    
    User <|-- Farmer
    User <|-- Expert
    User <|-- Administrator
    
    Farmer --> ChatSession: participates in
    Expert --> ChatSession: participates in
    
    ChatSession "1" *-- "many" ChatMessage: contains
    
    Farmer --> CartContext: has
    CartContext "1" *-- "many" CartItem: contains
    CartItem --> Product: references
    
    RecommendationService --> AgriculturalKnowledgeGraph: uses
    RecommendationService --> ChatSession: analyzes
    RecommendationService --> Product: recommends
```

## 3.1.4 Dynamic Modeling: State & Sequence Diagrams

### State Diagram

The state diagram illustrates the states of the recommendation system:

```mermaid
stateDiagram-v2
    [*] --> Idle
    
    Idle --> ProcessingQuery: User sends message
    
    ProcessingQuery --> AnalyzingIntent: Extract query
    AnalyzingIntent --> ExtractingEntities: Determine intent
    ExtractingEntities --> SelectingStrategy: Identify entities
    
    SelectingStrategy --> UsingNLPService: NLP available
    SelectingStrategy --> UsingAIService: NLP unavailable
    
    UsingNLPService --> RankingProducts: Get embeddings
    UsingAIService --> RankingProducts: Get AI analysis
    
    RankingProducts --> DisplayingRecommendations: Products found
    RankingProducts --> DisplayingDefaults: No matches
    
    DisplayingRecommendations --> Idle: User continues
    DisplayingDefaults --> Idle: User continues
    
    Idle --> [*]: Session ends
```

### Sequence Diagram

The sequence diagram illustrates the process of generating product recommendations based on user chat:

```mermaid
sequenceDiagram
    actor Farmer
    participant UI as User Interface
    participant ChatSvc as ChatService
    participant RecSvc as RecommendationService
    participant NLP as NLP Service
    participant KG as Knowledge Graph
    participant DB as Product Database
    
    Farmer->>UI: Send message
    activate UI
    
    UI->>ChatSvc: addMessage(sessionId, message)
    activate ChatSvc
    ChatSvc-->>UI: Confirmation
    deactivate ChatSvc
    
    UI->>RecSvc: getRecommendations(userId)
    activate RecSvc
    
    RecSvc->>ChatSvc: getChatHistory(userId)
    activate ChatSvc
    ChatSvc-->>RecSvc: chatHistory
    deactivate ChatSvc
    
    RecSvc->>RecSvc: analyzeIntent(chatHistory)
    RecSvc->>RecSvc: extractEntities(chatHistory)
    
    alt NLP Service Available
        RecSvc->>NLP: getSemanticAnalysis(query)
        activate NLP
        NLP-->>RecSvc: semanticAnalysis
        deactivate NLP
    else NLP Service Unavailable
        RecSvc->>KG: findRelatedProducts(entities)
        activate KG
        KG-->>RecSvc: relatedProducts
        deactivate KG
    end
    
    RecSvc->>DB: getProductDetails(productIds)
    activate DB
    DB-->>RecSvc: productDetails
    deactivate DB
    
    RecSvc->>RecSvc: rankProducts(products, intent)
    RecSvc-->>UI: rankedRecommendations
    deactivate RecSvc
    
    UI-->>Farmer: Display recommendations
    
    Farmer->>UI: Add to cart
    UI->>UI: updateCart(product)
    
    deactivate UI
```

## 3.1.5 Process Modeling: Activity Diagram

The activity diagram illustrates the process of generating and displaying recommendations:

```mermaid
graph TD
    Start([Start]) --> CheckHistory{Has chat history?}
    
    CheckHistory -->|No| ShowDefaults[Display default recommendations]
    CheckHistory -->|Yes| ExtractQuery[Extract query from chat history]
    
    ExtractQuery --> AnalyzeIntent[Analyze user intent]
    AnalyzeIntent --> ExtractEntities[Extract agricultural entities]
    
    ExtractEntities --> CheckNLP{NLP Service available?}
    
    CheckNLP -->|Yes| CallNLP[Process with NLP Service]
    CheckNLP -->|No| UseKG[Use Knowledge Graph]
    
    CallNLP --> GetProducts[Retrieve matching products]
    UseKG --> GetProducts
    
    GetProducts --> RankProducts[Rank products by relevance]
    ShowDefaults --> DisplayRecs[Display recommendations to user]
    RankProducts --> DisplayRecs
    
    DisplayRecs --> UserAction{User action?}
    
    UserAction -->|Add to cart| UpdateCart[Add product to cart]
    UserAction -->|Filter| ApplyFilter[Apply category filter]
    UserAction -->|Continue chat| NewMessage[Process new message]
    UserAction -->|Close| End([End])
    
    UpdateCart --> UserAction
    ApplyFilter --> DisplayRecs
    NewMessage --> ExtractQuery
```

## 3.2.1 Refinement of Classes and Objects

The refined class diagram shows the strategy pattern implementation for recommendation algorithms:

```mermaid
classDiagram
    class RecommendationStrategy {
        <<interface>>
        +getRecommendations(query: string, limit: number): Product[]
    }
    
    class KNNRecommendationStrategy {
        -extractFeatures(text: string): number[]
        -calculateDistance(vector1: number[], vector2: number[]): number
        +getRecommendations(query: string, limit: number): Product[]
    }
    
    class NLPRecommendationStrategy {
        -calculateTfIdf(document: string, allDocuments: string[]): Map<string, number>
        -cosineSimilarity(vector1: Map<string, number>, vector2: Map<string, number>): number
        +getRecommendations(query: string, limit: number): Product[]
    }
    
    class KnowledgeGraphRecommendationStrategy {
        -extractEntities(text: string): Entity[]
        -scoreProducts(entities: Entity[], products: Product[]): ScoredProduct[]
        +getRecommendations(query: string, limit: number): Product[]
    }
    
    class GeminiRecommendationStrategy {
        -generatePrompt(query: string, categories: string[]): string
        -parseResponse(response: string): AnalysisResult
        +getRecommendations(query: string, limit: number): Product[]
    }
    
    class RecommendationService {
        -strategies: Map<string, RecommendationStrategy>
        -productRepository: ProductRepository
        -knowledgeGraph: AgriculturalKnowledgeGraphService
        +registerStrategy(name: string, strategy: RecommendationStrategy): void
        +getRecommendationsFromChat(userId: string, limit: number): Product[]
        -selectStrategy(query: string): RecommendationStrategy
        -fallbackToDefault(limit: number): Product[]
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

The component diagram illustrates the main components of the CropsayAI system and their interactions:

```mermaid
component "User Interface Layer" as UI {
    component "React Components" as RC
    component "State Management" as SM
    component "Routing" as RT
}

component "Service Layer" as SL {
    component "Recommendation Services" as RS
    component "Chat Services" as CS
    component "Authentication Services" as AS
    component "Product Services" as PS
}

component "Data Access Layer" as DAL {
    component "API Clients" as AC
    component "Data Models" as DM
    component "Repository Interfaces" as RI
}

component "External Services" as ES {
    component "NLP Service" as NLP
    component "Gemini API" as GA
    component "Supabase" as SB
}

UI --> SL : uses
SL --> DAL : uses
DAL --> ES : integrates with

RC --> SM : updates
SM --> RC : notifies
RC --> RT : navigates

RS --> CS : analyzes
RS --> PS : retrieves
AS --> SB : authenticates
CS --> SB : stores

AC --> NLP : calls
AC --> GA : calls
AC --> SB : queries
RI --> DM : manipulates
```

## 3.2.3 Deployment Diagram

The deployment diagram illustrates how the CropsayAI system is deployed:

```mermaid
graph TD
    subgraph "Client Device"
        Browser["Web Browser
        (React Application)"]
    end
    
    subgraph "Web Server"
        WebApp["Web Application Server
        (Node.js)"]
        
        subgraph "Frontend"
            ReactApp["React Application"]
            StateManagement["State Management"]
        end
        
        subgraph "Backend Services"
            APIServices["API Services"]
            AuthService["Authentication Service"]
            RecommendationEngine["Recommendation Engine"]
        end
    end
    
    subgraph "NLP Server"
        PythonService["Python NLP Service
        (FastAPI)"]
        TransformerModels["Transformer Models"]
        Embeddings["Text Embeddings"]
    end
    
    subgraph "External Services"
        GeminiAPI["Google Gemini API"]
        SupabaseDB["Supabase Database"]
    end
    
    Browser <--> WebApp: "HTTPS"
    ReactApp --> StateManagement: "Internal"
    WebApp --> APIServices: "Internal"
    APIServices --> AuthService: "Internal"
    APIServices --> RecommendationEngine: "Internal"
    RecommendationEngine <--> PythonService: "HTTP/REST"
    PythonService --> TransformerModels: "Internal"
    PythonService --> Embeddings: "Internal"
    RecommendationEngine <--> GeminiAPI: "HTTPS/REST"
    AuthService <--> SupabaseDB: "HTTPS/REST"
    APIServices <--> SupabaseDB: "HTTPS/REST"