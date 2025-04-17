# CropsayAI UML Diagrams

This document contains various UML diagrams that illustrate the architecture, structure, and behavior of the CropsayAI system.

## 1. Object & Class Diagram

```plantuml
@startuml Class Diagram
skinparam classAttributeIconSize 0
skinparam classFontStyle bold
skinparam classBackgroundColor #f0f8ff
skinparam classBorderColor #2c3e50

' Main domain classes
class Product {
  +id: number
  +name: string
  +description: string
  +price: number
  +rating: number
  +category: string
  +subcategory: string
  +brand: string
  +inStock: boolean
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

class AgriculturalKnowledgeGraph {
  +crops: Crop[]
  +problems: Problem[]
  +activities: Activity[]
}

' User and chat related classes
class User {
  +id: string
  +email: string
  +name: string
}

class Message {
  +id: string
  +role: string
  +content: string
  +timestamp: Date
}

class ChatSession {
  +id: string
  +title: string
  +lastMessage: string
  +timestamp: Date
  +messages: Message[]
  +isStarred: boolean
}

' Service classes
class GeminiService {
  +generateResponse(messages: Message[]): Promise<string>
  +generateChatTitle(message: string): Promise<string>
}

class RecommendationService {
  +getRecommendationsFromChat(userId: string, limit: number): Promise<Product[]>
}

class NLPService {
  +getEmbedding(text: string): vector
  +calculateSimilarity(query: vector, products: vector[]): number[]
  +getRecommendations(query: string, limit: number): Product[]
}

class ChatService {
  +getChatSessions(userId: string): Promise<ChatSession[]>
  +createChatSession(session: ChatSession, userId: string): Promise<ChatSession>
  +updateChatMessages(messages: Message[], chatId: string): Promise<boolean>
}

' Relationships
AgriculturalKnowledgeGraph "1" *-- "many" Crop
AgriculturalKnowledgeGraph "1" *-- "many" Problem
AgriculturalKnowledgeGraph "1" *-- "many" Activity

User "1" -- "many" ChatSession
ChatSession "1" *-- "many" Message

RecommendationService --> Product : recommends
RecommendationService --> AgriculturalKnowledgeGraph : uses
GeminiService --> Message : processes
NLPService --> Product : finds similar
ChatService --> ChatSession : manages
ChatService --> Message : stores

@enduml
```

**Description**: The class diagram shows the main domain entities and services in the CropsayAI system. It illustrates how the agricultural knowledge graph contains crops, problems, and activities, and how these relate to products. The diagram also shows the chat-related classes (User, ChatSession, Message) and the service classes that implement the core functionality (GeminiService, RecommendationService, NLPService, ChatService).

## 2. State Diagram

```plantuml
@startuml State Diagram
skinparam stateBorderColor #2c3e50
skinparam stateBackgroundColor #f0f8ff
skinparam stateFontStyle bold

[*] --> Idle : Application Start

state Idle {
  [*] --> WaitingForUserInput
  WaitingForUserInput --> ProcessingUserInput : User sends message
  ProcessingUserInput --> WaitingForUserInput : Display message
}

Idle --> ProcessingQuery : User sends query
ProcessingQuery --> AttemptingNLP : Extract query from chat

state "Recommendation Process" as RecProcess {
  AttemptingNLP --> UsingNLPService : NLP service available
  AttemptingNLP --> UsingGeminiService : NLP service unavailable
  
  UsingNLPService --> GeneratingRecommendations : Get embeddings
  UsingGeminiService --> GeneratingRecommendations : Call Gemini API
  
  GeneratingRecommendations --> DisplayingRecommendations : Recommendations generated
  GeneratingRecommendations --> DisplayingDefaults : Generation failed
}

DisplayingRecommendations --> Idle : User continues chat
DisplayingDefaults --> Idle : User continues chat

state "Shopping Process" as ShopProcess {
  DisplayingRecommendations --> AddingToCart : User selects product
  AddingToCart --> ViewingCart : User views cart
  ViewingCart --> Checkout : User proceeds to checkout
}

Checkout --> [*] : Order completed

@enduml
```

**Description**: The state diagram illustrates the different states of the CropsayAI system during user interaction. It shows the idle state where the system waits for user input, the recommendation process that involves either NLP or Gemini services, and the shopping process where users can add products to cart and checkout. The diagram highlights the fallback mechanisms when certain services are unavailable.

## 3. Sequence Diagram

```plantuml
@startuml Sequence Diagram
skinparam sequenceArrowColor #2c3e50
skinparam sequenceParticipantBorderColor #2c3e50
skinparam sequenceParticipantBackgroundColor #f0f8ff
skinparam sequenceLifeLineBorderColor #2c3e50

actor User
participant "ChatPage" as UI
participant "ChatService" as ChatSvc
participant "GeminiService" as GeminiSvc
participant "NLPService" as NLPSvc
participant "RecommendationService" as RecSvc
database "Supabase" as DB

User -> UI: Send message
activate UI

UI -> ChatSvc: addMessage(sessionId, message)
activate ChatSvc
ChatSvc -> DB: Store message
ChatSvc --> UI: Success
deactivate ChatSvc

UI -> GeminiSvc: generateResponse(messages)
activate GeminiSvc
GeminiSvc -> GeminiSvc: Extract user question
GeminiSvc -> GeminiSvc: Format prompt with agricultural context
GeminiSvc -> GeminiSvc: Call Gemini API
GeminiSvc --> UI: AI response
deactivate GeminiSvc

UI -> UI: Display AI response

UI -> NLPSvc: getRecommendations(query, limit)
activate NLPSvc
NLPSvc -> NLPSvc: Analyze intent
NLPSvc -> NLPSvc: Generate embeddings
NLPSvc -> NLPSvc: Calculate similarity
NLPSvc --> UI: Product recommendations
deactivate NLPSvc

alt NLP Service Unavailable
  UI -> RecSvc: getRecommendationsFromChat(userId, limit)
  activate RecSvc
  RecSvc -> GeminiSvc: Generate recommendations
  GeminiSvc --> RecSvc: Recommendations
  RecSvc --> UI: Product recommendations
  deactivate RecSvc
end

UI -> UI: Display recommendations
UI --> User: Show response and recommendations

User -> UI: Select product
UI -> UI: Add to cart
UI --> User: Product added to cart

deactivate UI

@enduml
```

**Description**: The sequence diagram shows the interaction between the user, UI components, and various services during a typical chat session. It illustrates how a user message flows through the system, triggering the Gemini service for generating responses and the NLP service for product recommendations. The diagram also shows the fallback to the recommendation service when the NLP service is unavailable.

## 4. Activity Diagram

```plantuml
@startuml Activity Diagram
skinparam activityBorderColor #2c3e50
skinparam activityBackgroundColor #f0f8ff
skinparam activityFontStyle bold

start

:User sends agricultural question;

fork
  :Process user query with Gemini;
  :Generate agricultural response;
  :Display response to user;
fork again
  :Extract query for recommendations;
  
  if (NLP Service available?) then (yes)
    :Generate embeddings for query;
    :Calculate similarity with products;
  else (no)
    :Use Gemini for recommendations;
  endif
  
  :Rank products by relevance;
  :Filter by category if needed;
  :Display recommendations to user;
end fork

:User views recommendations;

if (User selects product?) then (yes)
  :Add product to cart;
  if (User proceeds to checkout?) then (yes)
    :Complete purchase;
  else (no)
    :Continue shopping;
  endif
else (no)
  :Continue conversation;
endif

stop

@enduml
```

**Description**: The activity diagram illustrates the flow of activities in the CropsayAI system when a user interacts with it. It shows how user queries are processed in parallel for both generating responses and product recommendations. The diagram highlights decision points such as service availability and user actions, and shows the different paths the flow can take based on these decisions.

## 5. Refinement of Classes and Objects

```plantuml
@startuml Refined Class Diagram
skinparam classAttributeIconSize 0
skinparam classFontStyle bold
skinparam classBackgroundColor #f0f8ff
skinparam classBorderColor #2c3e50

' Abstract base classes
abstract class BaseService {
  #handleError(error: Error): void
  #logActivity(activity: string): void
}

abstract class RecommendationStrategy {
  +getRecommendations(query: string, limit: number): Promise<Product[]>
}

' Refined service classes
class GeminiService extends BaseService {
  -GEMINI_API_KEY: string
  -MODEL_NAME: string
  -RETRY_ATTEMPTS: number
  -genAI: GoogleGenerativeAI
  +generateResponse(messages: Message[]): Promise<string>
  +generateChatTitle(message: string): Promise<string>
  -generateGeminiResponse(userQuestion: string, chatHistory: string): Promise<string>
  -formatPrompt(userQuestion: string, chatHistory: string): string
  -parseResponse(text: string): GeminiResponse
}

class PatternRecommendationService extends RecommendationStrategy {
  -knowledgeGraph: AgriculturalKnowledgeGraph
  +getRecommendations(query: string, limit: number): Promise<Product[]>
  -extractKeywords(text: string): string[]
  -matchProductsToKeywords(keywords: string[]): Product[]
}

class NLPRecommendationService extends RecommendationStrategy {
  -MODEL_NAME: string
  -tokenizer: AutoTokenizer
  -model: AutoModel
  -productEmbeddings: number[][]
  +getRecommendations(query: string, limit: number): Promise<Product[]>
  -getEmbedding(text: string): number[]
  -calculateSimilarity(queryEmbedding: number[], productEmbedding: number[]): number
  -analyzeIntent(query: string): IntentAnalysis
}

class GeminiRecommendationService extends RecommendationStrategy {
  -geminiService: GeminiService
  +getRecommendations(query: string, limit: number): Promise<Product[]>
  -formatRecommendationPrompt(query: string, products: Product[]): string
}

class EnhancedRecommendationService extends BaseService {
  -strategies: RecommendationStrategy[]
  +getRecommendationsFromChat(userId: string, limit: number): Promise<Product[]>
  -selectStrategy(query: string): RecommendationStrategy
  -combineRecommendations(recommendations: Product[][]): Product[]
}

class ChatService extends BaseService {
  -supabase: SupabaseClient
  -useMemoryFallback: boolean
  -initialized: boolean
  +init(): Promise<boolean>
  +getChatSessions(userId: string): Promise<ChatSession[]>
  +createChatSession(session: ChatSession, userId: string): Promise<ChatSession>
  +updateChatSession(session: ChatSession): Promise<ChatSession>
  +deleteChatSession(sessionId: string): Promise<boolean>
  +updateChatMessages(messages: Message[], chatId: string): Promise<boolean>
  +toggleStarChatSession(sessionId: string, isStarred: boolean): Promise<boolean>
}

' Relationships
RecommendationStrategy <|-- PatternRecommendationService
RecommendationStrategy <|-- NLPRecommendationService
RecommendationStrategy <|-- GeminiRecommendationService

EnhancedRecommendationService o-- RecommendationStrategy
EnhancedRecommendationService --> PatternRecommendationService : uses
EnhancedRecommendationService --> NLPRecommendationService : uses
EnhancedRecommendationService --> GeminiRecommendationService : uses

GeminiRecommendationService --> GeminiService : uses

@enduml
```

**Description**: This refined class diagram focuses on the service layer of the CropsayAI system, showing how the recommendation system is implemented using the Strategy pattern. It illustrates the base classes and their specialized implementations, such as different recommendation strategies (Pattern-based, NLP-based, Gemini-based). The diagram also shows how the EnhancedRecommendationService combines these strategies to provide robust recommendations.

## 6. Component Diagram

```plantuml
@startuml Component Diagram
skinparam componentBorderColor #2c3e50
skinparam componentBackgroundColor #f0f8ff
skinparam componentFontStyle bold
skinparam interfaceBackgroundColor #f0f8ff

package "Frontend" {
  [React UI Components] as UI
  [React Router] as Router
  [React Query] as Query
  [Context Providers] as Context
}

package "Services" {
  [Chat Service] as ChatSvc
  [Gemini Service] as GeminiSvc
  [Recommendation Service] as RecSvc
  [NLP Bridge Service] as NLPBridge
}

package "External Services" {
  [Gemini API] as GeminiAPI
  [Supabase] as Supabase
  [NLP Service (Python)] as NLPSvc
}

package "Data" {
  [Product Data] as ProductData
  [Agricultural Knowledge Graph] as KnowledgeGraph
}

' Interfaces
interface "HTTP/REST" as HTTP
interface "WebSockets" as WS
interface "Database API" as DBAPI

' Connections
UI -- Router
UI -- Query
UI -- Context

UI ..> ChatSvc
UI ..> RecSvc
UI ..> GeminiSvc

ChatSvc ..> Supabase
RecSvc ..> ProductData
RecSvc ..> KnowledgeGraph
RecSvc ..> GeminiSvc
RecSvc ..> NLPBridge

GeminiSvc ..> GeminiAPI : HTTP
NLPBridge ..> NLPSvc : HTTP
ChatSvc ..> Supabase : DBAPI

@enduml
```

**Description**: The component diagram shows the high-level components of the CropsayAI system and their interactions. It illustrates how the frontend components (React UI, Router, Query, Context) interact with the service layer (Chat Service, Gemini Service, Recommendation Service, NLP Bridge). The diagram also shows the external services (Gemini API, Supabase, NLP Service) and data components (Product Data, Agricultural Knowledge Graph) that the system depends on.

## 7. Deployment Diagram

```plantuml
@startuml Deployment Diagram
skinparam nodeBorderColor #2c3e50
skinparam nodeBackgroundColor #f0f8ff
skinparam databaseBackgroundColor #f0f8ff
skinparam cloudBackgroundColor #f0f8ff

node "Client Device" as Client {
  [Web Browser] as Browser
}

node "Web Server" as WebServer {
  [React Frontend] as Frontend
  [JavaScript Services] as JSServices
}

node "NLP Server" as NLPServer {
  [Python FastAPI] as FastAPI
  [Transformer Models] as Models
}

cloud "Google Cloud" as GoogleCloud {
  [Gemini API] as GeminiAPI
}

cloud "Supabase Cloud" as SupabaseCloud {
  database "PostgreSQL" as PostgreSQL
  [Authentication] as Auth
  [Storage] as Storage
}

' Connections
Client -- WebServer : HTTPS
WebServer -- NLPServer : HTTP/REST
WebServer -- GoogleCloud : HTTPS
WebServer -- SupabaseCloud : HTTPS

Browser -- Frontend : renders
Frontend -- JSServices : uses
JSServices -- FastAPI : calls
FastAPI -- Models : uses
JSServices -- GeminiAPI : calls
JSServices -- PostgreSQL : queries
JSServices -- Auth : authenticates
JSServices -- Storage : stores files

@enduml
```

**Description**: The deployment diagram illustrates how the CropsayAI system is deployed across different physical or virtual nodes. It shows the client device running a web browser, the web server hosting the React frontend and JavaScript services, the NLP server running Python FastAPI and transformer models, and cloud services like Google Cloud (for Gemini API) and Supabase Cloud (for database, authentication, and storage). The diagram also shows the communication protocols between these nodes.