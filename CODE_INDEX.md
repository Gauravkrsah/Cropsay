# CropsayAI Code Index

## 📋 Project Overview
CropsayAI is a chat-commerce platform for agriculture that connects farmers with experts, provides AI-powered recommendations, and offers seamless shopping for agricultural supplies.

## 🏗️ Architecture Overview
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Node.js services + Python NLP service
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: Google Gemini API
- **Payment**: Khalti integration

## 📁 Project Structure

### Root Level
```
cropsayai/
├── frontend/           # React frontend application
├── backend/           # Node.js and Python backend services
├── database/          # Supabase schema and configurations
├── docs/             # Documentation and data files
├── scripts/          # Build and deployment scripts
├── package.json      # Root package configuration
└── README.md         # Project documentation
```

### Frontend Structure (`/frontend/`)
```
frontend/
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/        # Route-based page components
│   ├── services/     # API and external service integrations
│   ├── contexts/     # React context providers
│   ├── hooks/        # Custom React hooks
│   ├── utils/        # Utility functions
│   ├── data/         # Static data and mock data
│   ├── lib/          # Library configurations
│   └── integrations/ # Third-party integrations
├── public/           # Static assets
└── dist/            # Production build output
```

## 🔧 Key Components

### Core Pages
- **HomePage** (`/pages/HomePage.tsx`) - Landing page with hero section
- **ChatPage** (`/pages/ChatPage.tsx`) - AI chat interface for farmer assistance
- **ShopPage** (`/pages/ShopPage.tsx`) - Product catalog with filtering
- **SellPage** (`/pages/SellPage.tsx`) - Product listing interface for sellers
- **LearnPage** (`/pages/LearnPage.tsx`) - Educational content
- **ExplorePage** (`/pages/ExplorePage.tsx`) - Discovery features
- **SearchPage** (`/pages/SearchPage.tsx`) - Product search functionality

### Core Services

#### AI & Recommendation Services
- **geminiService.ts** - Google Gemini API integration
- **aiRecommendationService.ts** - AI-powered product recommendations
- **dynamicRecommendationService.ts** - Dynamic recommendation engine
- **geminiRecommendationService.ts** - Gemini-specific recommendations
- **geminiProxy.js** - Proxy service for Gemini API

#### Business Logic Services
- **productService.ts** - Product management and CRUD operations
- **orderService.ts** - Order processing and management
- **reviewService.ts** - Product review system
- **testSupabase.ts** - Database connection testing

### Context Providers
- **AuthContext** - User authentication state management
- **CartContext** - Shopping cart state management
- **PurchaseContext** - Purchase flow state management

### UI Components
- **AppLayout.tsx** - Main application layout wrapper
- **AppSidebar.tsx** - Navigation sidebar
- **ProductCard.tsx** - Product display component
- **SearchProductCard.tsx** - Search-specific product card
- **BulkProductUpload.tsx** - Bulk product upload interface
- **UserProfilePopup.tsx** - User profile management

## 🔌 Backend Services

### Node.js Services (`/backend/`)
- **start-gemini-proxy.js** - Gemini API proxy server
- **start-khalti-server.js** - Khalti payment gateway server
- **start-nlp-service.js** - Python NLP service launcher
- **gemini-test.js** - Gemini API testing script
- **khalti.js** - Khalti payment integration

### Python Services
- **NLP Service** - Natural language processing for recommendations
- **Requirements**: `nlp-service-requirements.txt`

## 🗄️ Database Schema (`/database/`)
- **Supabase Configuration** - PostgreSQL database setup
- **Schema Files** - Database structure definitions
- **Bucket Configuration** - File storage setup

## 🔑 Environment Configuration

### Frontend Environment Variables
- **Development**: `.env`
- **Production**: `.env.production`
- **Example**: `.env.example`

### Backend Environment Variables
- **Configuration**: `backend/.env`
- **Example**: `backend/.env.example`

## 📊 Data Management

### Product Data
- **productData.ts** - Static product data
- **searchData.ts** - Search-related data
- **CSV Templates** - Product upload templates
- **Agricultural Data** - Seed and product catalogs

### Utilities
- **csvUtils.ts** - CSV file processing utilities
- **testSupabase.ts** - Database testing utilities

## 🧪 Testing
- **Test Files** - Located in `/frontend/src/tests/`
- **Shop Page Filtering Tests** - Product filtering functionality tests
- **Test Runner** - Custom test execution scripts

## 🚀 Build & Deployment

### Scripts
- **Development**: `npm run dev` - Start development server
- **Build**: `npm run build` - Production build
- **Services**: `npm run start:all` - Start all services concurrently
- **Individual Services**:
  - `npm run start:gemini` - Gemini proxy
  - `npm run start:nlp` - NLP service
  - `npm run start:khalti` - Payment service

### Production
- **Distribution**: `/dist/` folder
- **Server**: Production server configuration
- **Build Scripts**: Custom build automation

## 🔗 Key Integrations

### External APIs
- **Google Gemini** - AI chat and recommendations
- **Supabase** - Database and authentication
- **Khalti** - Payment processing

### UI Libraries
- **Radix UI** - Accessible component primitives
- **shadcn/ui** - Pre-built component library
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Icon library

## 🔄 Data Flow

### User Journey
1. **Authentication** - User login/signup via Supabase Auth
2. **Product Discovery** - Browse/search products with AI recommendations
3. **Chat Assistance** - Get farming advice via Gemini AI
4. **Shopping** - Add products to cart, manage orders
5. **Payment** - Process payments via Khalti
6. **Selling** - List products for sale (farmers/suppliers)

### AI Recommendation Flow
1. **User Input** - Chat messages or product interactions
2. **NLP Processing** - Python service analyzes intent
3. **Gemini Integration** - AI generates contextual responses
4. **Product Matching** - Dynamic recommendation engine
5. **Response Delivery** - Formatted recommendations to user

## 🛠️ Development Notes

### Current Issues/TODOs
- Mobile login button fixes (see `fix-mobile-login-button.md`)
- SellPage updates (`.new` file indicates work in progress)
- Environment configuration optimization

### Code Quality
- TypeScript for type safety
- ESLint for code quality
- Tailwind for consistent styling
- Component-based architecture
- Service layer separation

## 📈 Performance Considerations
- Vite for fast development builds
- React Query for efficient data fetching
- Lazy loading for route-based code splitting
- Optimized image assets
- CDN-ready static assets

## 🔐 Security Features
- Supabase Row Level Security (RLS)
- Environment variable protection
- API proxy for secure external calls
- Authentication state management
- Secure payment processing

---

*Last Updated: Generated automatically*
*Project Status: Active Development*