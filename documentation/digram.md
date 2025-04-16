# CropsayAI System Analysis and Design Diagrams

## 3.1.1 Use-Case Modeling

### Use-Case Diagram

The following use-case diagram illustrates the main actors and use cases in the CropsayAI system:

```mermaid
graph TD
    subgraph Actors
        Farmer[Farmer]
        Expert[Agricultural Expert]
    end
    
    subgraph Use Cases
        UC1[Register/Login]
        UC2[Chat with Expert]
        UC3[View Recommendations]
        UC4[Add Products to Cart]
        UC5[Manage Profile]
    end
    
    Farmer --> UC1
    Farmer --> UC2
    Farmer --> UC3
    Farmer --> UC4
    Farmer --> UC5
    
    Expert --> UC1
    Expert --> UC2
```

### Use-Case Descriptions

#### UC1: Register/Login
**Actor:** Farmer, Expert  
**Description:** Users can create an account or log in to an existing account.  
**Main Flow:**
1. User opens the application
2. User selects "Register" or "Login"
3. System authenticates the user
4. System grants access to the application

#### UC2: Chat with Expert
**Actor:** Farmer, Expert  
**Description:** Farmers can chat with agricultural experts to get advice on farming issues.  
**Main Flow:**
1. Farmer selects an expert
2. Farmer sends messages describing their agricultural situation
3. Expert responds with advice
4. System analyzes chat content for product recommendations

#### UC3: View Recommendations
**Actor:** Farmer  
**Description:** Farmers can view personalized product recommendations based on their chat history.  
**Main Flow:**
1. System analyzes farmer's chat history
2. System generates personalized product recommendations
3. Farmer views recommended products
4. Farmer can filter recommendations by category

#### UC4: Add Products to Cart
**Actor:** Farmer  
**Description:** Farmers can add recommended products to their shopping cart.  
**Main Flow:**
1. Farmer selects a recommended product
2. Farmer adds product to cart
3. System updates cart count and total

#### UC5: Manage Profile
**Actor:** Farmer  
**Description:** Farmers can view and update their profile information.  
**Main Flow:**
1. Farmer navigates to profile section
2. Farmer edits information as needed
3. System saves changes

## 3.1.3 Object Modeling: Object & Class Diagram

The simplified class diagram shows the core classes and their relationships:

```mermaid
classDiagram
    class Product {
        +id: number
        +name: string
        +description: string
        +category: string
        +price: number
        +rating: number
    }
    
    class AgriculturalKnowledgeGraph {
        +crops: Crop[]
        +problems: Problem[]
        +activities: Activity[]
    }
    
    class RecommendationService {
        +getRecommendations(userId: string): Product[]
    }
    
    class ChatService {
        +getChatSessions(userId: string): ChatSession[]
        +addMessage(message: ChatMessage): void
    }
    
    class ExpertPanel {
        +displayRecommendations(products: Product[]): void
    }
    
    class CartContext {
        +addItem(product: Product): void
    }
    
    RecommendationService --> Product: recommends
    RecommendationService --> AgriculturalKnowledgeGraph: uses
    ExpertPanel --> CartContext: uses
    ChatService --> RecommendationService: triggers
```

## 3.1.4 Dynamic Modeling: State & Sequence Diagrams

### State Diagram

The simplified state diagram for the recommendation system:

```mermaid
stateDiagram-v2
    [*] --> Idle
    
    Idle --> Processing: User sends message
    Processing --> Recommending: Analyze message
    
    Recommending --> Success: Recommendations found
    Recommending --> Fallback: No matches found
    
    Success --> Idle: Display recommendations
    Fallback --> Idle: Display defaults
```

### Sequence Diagram

The simplified sequence diagram for generating recommendations:

```mermaid
sequenceDiagram
    actor User
    participant UI
    participant ChatService
    participant RecommendationService
    
    User->>UI: Send message
    UI->>ChatService: addMessage()
    ChatService->>RecommendationService: getRecommendations()
    RecommendationService-->>UI: recommendations
    UI-->>User: Display recommendations
    User->>UI: Add to cart
```

## 3.1.5 Process Modeling: Activity Diagram

The simplified activity diagram for the recommendation process:

```mermaid
graph TD
    A[Start] --> B{Has chat history?}
    B -->|No| C[Show defaults]
    B -->|Yes| D[Analyze chat]
    D --> E[Generate recommendations]
    E --> F[Display to user]
    C --> F
    F --> G{User action?}
    G -->|Add to cart| H[Update cart]
    G -->|Continue chat| A
    H --> G
```

## 3.2.1 Refinement of Classes and Objects

The simplified strategy pattern implementation:

```mermaid
classDiagram
    class RecommendationStrategy {
        <<interface>>
        +getRecommendations(query: string): Product[]
    }
    
    class KNNStrategy {
        +getRecommendations(query: string): Product[]
    }
    
    class NLPStrategy {
        +getRecommendations(query: string): Product[]
    }
    
    class AIStrategy {
        +getRecommendations(query: string): Product[]
    }
    
    class RecommendationService {
        -strategies: Map<string, RecommendationStrategy>
        +getRecommendations(query: string): Product[]
    }
    
    RecommendationStrategy <|.. KNNStrategy
    RecommendationStrategy <|.. NLPStrategy
    RecommendationStrategy <|.. AIStrategy
    
    RecommendationService --> RecommendationStrategy: uses
```

## 3.2.2 Component Diagram

The simplified component diagram:

```mermaid
graph TD
    subgraph "Frontend"
        UI[User Interface]
    end
    
    subgraph "Services"
        RecService[Recommendation Service]
        ChatService[Chat Service]
        AuthService[Authentication]
    end
    
    subgraph "Data"
        DB[Database]
        KG[Knowledge Graph]
    end
    
    subgraph "External"
        AI[AI Service]
    end
    
    UI --> RecService
    UI --> ChatService
    UI --> AuthService
    
    RecService --> KG
    RecService --> AI
    ChatService --> DB
    AuthService --> DB
```

## 3.2.3 Deployment Diagram

The simplified deployment diagram:

```mermaid
graph TD
    Client[Client Browser]
    WebServer[Web Server]
    NLPServer[NLP Server]
    Database[Database]
    
    Client <--> WebServer: HTTPS
    WebServer <--> NLPServer: HTTP
    WebServer <--> Database: HTTPS