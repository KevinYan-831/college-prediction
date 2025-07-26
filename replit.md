# University Admission Fortune Prediction App

## Overview

This is a full-stack web application that combines traditional Chinese fortune-telling (Ba Zi) with university admission predictions. The app analyzes users' birth information along with academic credentials to provide personalized fortune analysis and university admission probability predictions.

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
- **Storage**: Currently using in-memory storage with interface for future database integration
- **Validation**: Zod schemas shared between frontend and backend
- **Development**: Hot reload with tsx and custom Vite integration

### Data Models
The application centers around fortune prediction with the following key schemas:
- **PredictionRequest**: User input including birth details, gender, major, test scores, and material quality
- **FortuneAnalysis**: AI-generated fortune analysis with five elements and academic recommendations
- **UniversityPrediction**: University recommendations with admission probabilities and reasoning

## Data Flow

1. **User Input**: Forms collect birth information, academic background, and test scores
2. **Validation**: Client-side validation using shared Zod schemas
3. **API Request**: POST to `/api/predict` endpoint with validated data
4. **Processing**: Backend processes fortune analysis and university predictions
5. **Response**: Structured prediction results returned to frontend
6. **Display**: Results presented in organized cards with detailed breakdowns

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