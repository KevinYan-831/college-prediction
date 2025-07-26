# University Admission Fortune Prediction App

## Overview

This is a full-stack web application that combines traditional Chinese fortune-telling (Ba Zi) with university admission predictions. The app analyzes users' birth information along with academic credentials to provide personalized fortune analysis and university admission probability predictions.

**Latest Update (2025-07-26)**: Successfully integrated WeChat payment functionality with a freemium model - users get free fortune analysis and first university recommendation, with full 15-university report available for ¥68.8.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a modern full-stack architecture with a clear separation between frontend and backend concerns:

- **Frontend**: React-based SPA using Vite as the build tool
- **Backend**: Express.js REST API server
- **Database**: PostgreSQL with Drizzle ORM (configured but not yet implemented)
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation

## Key Components

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom configuration for development and production
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Forms**: React Hook Form with Zod schema validation
- **HTTP Client**: Axios with TanStack Query for data fetching

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle with PostgreSQL dialect
- **Storage**: In-memory storage with support for predictions and payment tracking
- **Validation**: Zod schemas shared between frontend and backend
- **Development**: Hot reload with tsx and custom Vite integration
- **Payment Processing**: WeChat payment simulation with order creation and callback handling
- **API Integration**: GuguData (fortune telling) + DeepSeek (university predictions)

### Data Models
The application centers around fortune prediction with the following key schemas:
- **PredictionRequest**: User input including birth details, gender, major, test scores, and material quality
- **FortuneAnalysis**: AI-generated fortune analysis with five elements and academic recommendations
- **UniversityPrediction**: University recommendations with admission probabilities and reasoning
- **Payment/PaymentResult**: Payment processing schemas for WeChat payment integration
- **PredictionResult**: Extended with `isPaid` status and `sessionId` for payment tracking

## Data Flow

1. **User Input**: Forms collect birth information, academic background, and test scores
2. **Validation**: Client-side validation using shared Zod schemas
3. **API Request**: POST to `/api/predict` endpoint with validated data
4. **Processing**: Backend processes fortune analysis and university predictions via GuguData + DeepSeek APIs
5. **Response**: Structured prediction results returned with payment status and session ID
6. **Display**: Fortune analysis and first university shown for free
7. **Payment Flow**: Users can unlock complete 15-university report via WeChat payment (¥68.8)
8. **Unlock**: Payment success updates `isPaid` status and reveals full recommendations

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI components
- **react-hook-form**: Form state management
- **zod**: Runtime type validation

### Development Tools
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Type safety across the stack
- **ESBuild**: Fast JavaScript bundler for production builds

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite compiles React app to static assets in `dist/public`
2. **Backend Build**: ESBuild bundles server code to `dist/index.js`
3. **Database**: Drizzle migrations managed via `drizzle-kit push`

### Environment Configuration
- **Development**: Uses tsx for hot reloading with Vite middleware
- **Production**: Serves static files from Express with built frontend
- **Database**: Configured for PostgreSQL via `DATABASE_URL` environment variable

### File Structure
```
├── client/          # Frontend React application
├── server/          # Backend Express server
├── shared/          # Shared types and schemas
├── migrations/      # Database migration files
└── dist/           # Production build output
```

### Hosting Considerations
- Static assets served from `/dist/public`
- API routes prefixed with `/api`
- Single production server handles both frontend and backend
- Database migrations run via npm scripts
- Environment variables required: `DATABASE_URL`, `NODE_ENV`

The application is designed for easy deployment on platforms like Replit, Vercel, or traditional hosting with PostgreSQL database support.

## Recent Changes (2025-07-26)

### Major UI Overhaul & Feature Changes
- ✓ **Payment System Removed**: Completely eliminated payment functionality for fully free experience
- ✓ **New Color Scheme**: Updated from dark glassmorphism to bright blue-themed design
- ✓ **OFFERSTUDIO Integration**: Added promotional content during loading with official website link and WeChat contact
- ✓ **Complete Free Access**: All 15 university recommendations now shown without payment
- ✓ **Enhanced Loading Experience**: Added OFFERSTUDIO branding and website promotion during AI analysis
- ✓ **Fixed Fortune Analysis**: Eliminated repetitive "computer science" recommendations, now dynamically matches user's major
- ✓ **Improved University Recommendations**: More realistic admission predictions based on actual student qualifications
- ✓ **Added WeChat Contact**: Display founder WeChat "TauPsc-0317" during loading for user consultation

### UI/UX Updates (最新：橙色主题)
- ✓ **全新橙色主题**：采用OFFERSTUDIO网站的橙色、黄色、白色、黑色配色方案
- ✓ **背景渐变**：从蓝色系改为温暖的橙色/黄色/琥珀色渐变
- ✓ **卡片设计**：所有卡片改为白色半透明背景配橙色边框
- ✓ **表单元素**：输入框、选择器等采用橙色焦点色和边框
- ✓ **按钮颜色**：主按钮为橙色到黄色渐变，符合OFFERSTUDIO风格
- ✓ **加载状态**：进度条和指示器改为橙色系
- ✓ **结果展示**：命理分析和大学推荐卡片采用橙色主题

### Technical Changes
- ✓ Removed payment-related schemas and API endpoints
- ✓ Eliminated isPaid status tracking from prediction results
- ✓ Updated frontend to display all universities without payment checks
- ✓ Maintained real API integration with GuguData and DeepSeek
- ✓ Added html-to-image library for saving results as pictures
- ✓ Implemented image save functionality with OFFERSTUDIO advertising
- ✓ Fixed input bugs (TOEFL score auto-decrease issue)
- ✓ Optimized university recommendation algorithm for better results
- ✓ Updated footer copyright to "© 2025 AI美本录取算命大师"