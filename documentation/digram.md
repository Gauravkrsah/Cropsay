# CropsayAI Product Recommendation System Analysis and Design Diagrams

## 3.1.1 Use-Case Modeling

### Use-Case Diagram

```mermaid
graph LR
    %% Actors
    Farmer([👨‍🌾 Farmer])
    Admin([👨‍💼 Administrator])
    
    %% Use Cases in the middle
    subgraph CropsayAI System
        UC1((Chat for Recommendations))
        UC2((View Recommendations))
        UC3((Add to Cart))
        UC4((Manage Products))
        UC5((Configure Algorithms))
    end
    
    %% Relationships with straight lines
    Farmer --- UC1
    Farmer --- UC2
    Farmer --- UC3
    
    Admin --- UC4
    Admin --- UC5
```

### Use-Case Descriptions

#### UC1: Chat for Recommendations
**Actor:** Farmer  
**Description:** Farmers can chat about their agricultural needs to receive personalized recommendations.  
**Main Flow:**
1. Farmer describes their agricultural situation or needs
2. System analyzes the chat content
3. System generates personalized product recommendations
4. Farmer views recommended products

#### UC2: View Recommendations
**Actor:** Farmer  
**Description:** Farmers can view and filter personalized product recommendations.  
**Main Flow:**
1. System displays personalized product recommendations
2. Farmer can filter recommendations by category or price
3. Farmer can view detailed product information

#### UC3: Add to Cart
**Actor:** Farmer  
**Description:** Farmers can add recommended products to their shopping cart.  
**Main Flow:**
1. Farmer selects a recommended product
2. Farmer adds product to cart
3. System updates cart count and total

#### UC4: Manage Products
**Actor:** Administrator  
**Description:** Administrators can manage the product catalog.  
**Main Flow:**
1. Administrator can add, update, or remove products
2. Administrator can categorize products
3. Administrator can view product statistics

#### UC5: Configure Algorithms
**Actor:** Administrator  
**Description:** Administrators can configure recommendation algorithms.  
**Main Flow:**
1. Administrator selects algorithm parameters
2. Administrator adjusts weights and thresholds
3. System applies new configuration

## 3.1.3 Object Modeling: Object & Class Diagram

```mermaid
classDiagram
    class User {
        +id: string
        +role: string
    }
    
    class Farmer {
        +sendChatMessage()
        +viewRecommendations()
        +addToCart()
    }
    
    class Administrator {
        +manageProducts()
        +configureAlgorithms()
    }
    
    class Product {
        +id: number
        +name: string
        +category: string
        +price: number
    }
    
    class ChatSession {
        +messages: ChatMessage[]
        +addMessage()
    }
    
    class RecommendationService {
        +getRecommendationsFromChat()
    }
    
    class CartContext {
        +items: CartItem[]
        +addItem()
        +getTotal()
    }
    
    User <|-- Farmer
    User <|-- Administrator
    
    Farmer --> ChatSession
    Farmer --> CartContext
    CartContext --> Product
    
    RecommendationService --> ChatSession
    RecommendationService --> Product
```

## 3.1.4 Dynamic Modeling: State & Sequence Diagrams

### State Diagram

```mermaid
stateDiagram-v2
    [*] --> Idle
    
    Idle --> ChatActive: Start chat
    
    ChatActive --> AnalyzingChat: Request recommendations
    
    AnalyzingChat --> ProcessingQuery: Extract entities
    
    ProcessingQuery --> FindingProducts: Select strategy
    
    FindingProducts --> DisplayingRecommendations: Products found
    FindingProducts --> DisplayingDefaults: No matches
    
    DisplayingRecommendations --> Idle: Continue
    DisplayingDefaults --> Idle: Continue
    
    ChatActive --> Idle: End chat
    
    Idle --> [*]: End session
```

### Sequence Diagram

```mermaid
sequenceDiagram
    actor Farmer
    participant UI
    participant ChatService
    participant RecService
    participant ProductDB
    
    Farmer->>UI: Send message about needs
    UI->>ChatService: addMessage()
    ChatService-->>UI: Confirmation
    
    Farmer->>UI: Request recommendations
    UI->>RecService: getRecommendations()
    RecService->>ChatService: getChatHistory()
    ChatService-->>RecService: chatHistory
    
    RecService->>RecService: analyzeChat()
    RecService->>ProductDB: findMatchingProducts()
    ProductDB-->>RecService: productList
    
    RecService-->>UI: recommendations
    UI-->>Farmer: Display recommendations
    
    Farmer->>UI: Add to cart
    UI->>UI: updateCart()
```

## 3.1.5 Process Modeling: Activity Diagram

```mermaid
flowchart TD
    Start([Start]) --> Chat[Chat about needs]
    
    Chat --> Analyze[System analyzes chat]
    Analyze --> FindProducts[Find matching products]
    
    FindProducts --> ProductsFound{Products found?}
    
    ProductsFound -->|Yes| ShowRecs[Show recommendations]
    ProductsFound -->|No| ShowDefaults[Show default products]
    
    ShowRecs --> UserAction{User action?}
    ShowDefaults --> UserAction
    
    UserAction -->|Add to cart| UpdateCart[Update cart]
    UserAction -->|Filter| ApplyFilter[Apply filter]
    UserAction -->|Continue chat| Chat
    UserAction -->|End| End([End])
    
    UpdateCart --> UserAction
    ApplyFilter --> ShowRecs
```

## 3.2.1 Refinement of Classes and Objects

```mermaid
classDiagram
    class RecommendationStrategy {
        <<interface>>
        +getRecommendations()
    }
    
    class NLPStrategy {
        +getRecommendations()
    }
    
    class KnowledgeGraphStrategy {
        +getRecommendations()
    }
    
    class GeminiStrategy {
        +getRecommendations()
    }
    
    class RecommendationService {
        -strategies
        +registerStrategy()
        +getRecommendationsFromChat()
        -selectStrategy()
    }
    
    RecommendationStrategy <|.. NLPStrategy
    RecommendationStrategy <|.. KnowledgeGraphStrategy
    RecommendationStrategy <|.. GeminiStrategy
    
    RecommendationService --> RecommendationStrategy
```

## 3.2.2 Component Diagram

```mermaid
flowchart TD
    subgraph UI["User Interface"]
        Chat["Chat UI"]
        Recs["Recommendation UI"]
        Cart["Cart UI"]
    end

    subgraph Services["Core Services"]
        ChatSvc["Chat Service"]
        RecSvc["Recommendation Service"]
        ProductSvc["Product Service"]
    end

    subgraph Data["Data Layer"]
        DB["Database"]
        NLP["NLP Service"]
    end

    UI --> Services
    Services --> Data
    
    Chat --> ChatSvc
    Recs --> RecSvc
    Cart --> ProductSvc
    
    ChatSvc --> RecSvc
    RecSvc --> ProductSvc
    RecSvc --> NLP
    
    ChatSvc --> DB
    ProductSvc --> DB
```

## 3.2.3 Deployment Diagram

```mermaid
flowchart TD
    Client["Client Browser"]
    
    subgraph Server["Application Server"]
        WebApp["Web Application"]
        API["API Services"]
    end
    
    subgraph Services["External Services"]
        NLP["NLP Service"]
        Database["Database"]
        AI["AI Service"]
    end
    
    Client <--> WebApp
    WebApp --> API
    API <--> Services