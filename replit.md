# ScienceHeaven - Science Content Management System

## Overview

ScienceHeaven is a full-stack web application for managing and displaying scientific content including articles and videos. It's built as a modern single-page application with a React frontend and Express backend, featuring user authentication, content management, and a responsive design optimized for science education.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query (React Query) for server state
- **UI Components**: Shadcn/UI component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom theming (dark mode optimized)
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express framework
- **Language**: TypeScript with ES modules
- **Session Management**: Express session with PostgreSQL store
- **File Handling**: Multer for image uploads
- **Development**: TSX for TypeScript execution

### Authentication System
- **Provider**: Replit Authentication (OIDC)
- **Strategy**: Passport.js with OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions
- **Authorization**: Role-based access (admin/user)

## Key Components

### Database Layer
- **ORM**: Drizzle ORM with Neon serverless PostgreSQL
- **Schema**: Shared TypeScript schema definitions
- **Tables**:
  - `users` - User profiles and authentication
  - `sessions` - Session storage for Replit Auth
  - `content` - Articles and videos with metadata
- **Migrations**: Drizzle Kit for schema management

### Content Management
- **Types**: Support for articles and videos
- **Categories**: Physics, Chemistry, Biology, Astronomy, Technology
- **Features**: Rich text content, featured images, tagging, publishing status
- **Search**: Full-text search with category and type filtering
- **Sorting**: By date, popularity, and relevance

### File Upload System
- **Storage**: Local file system with configurable upload directory
- **Security**: File type validation (JPG, PNG, WebP only)
- **Limits**: 5MB maximum file size
- **Serving**: Static file serving via Express

### API Structure
- **Public Routes**: Content browsing and search
- **Protected Routes**: User profile, admin operations
- **Admin Routes**: Content CRUD operations
- **File Routes**: Image upload and serving

## Data Flow

1. **Authentication Flow**:
   - User initiates login via Replit OAuth
   - Backend validates with Replit OIDC provider
   - Session created and stored in PostgreSQL
   - User profile synchronized with local database

2. **Content Browsing**:
   - Frontend queries public API endpoints
   - Server retrieves content from PostgreSQL via Drizzle
   - Results filtered, sorted, and paginated
   - Cached on client using React Query

3. **Admin Operations**:
   - Authentication middleware verifies admin role
   - Form submissions validated using Zod schemas
   - File uploads processed through Multer
   - Database operations performed via Drizzle ORM

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React, React DOM, React Router (Wouter)
- **Backend**: Express, Node.js, TypeScript
- **Database**: PostgreSQL (Neon), Drizzle ORM
- **Authentication**: Passport.js, OpenID Connect Client

### UI and Styling
- **Component Library**: Radix UI primitives
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **Icons**: Lucide React
- **Utilities**: Class Variance Authority, clsx

### Development Tools
- **Build**: Vite, ESBuild
- **Type Checking**: TypeScript
- **Schema Validation**: Zod
- **Code Quality**: Various linting and formatting tools

## Deployment Strategy

### Development Environment
- **Runtime**: Replit with Node.js 20 module
- **Database**: PostgreSQL 16 module
- **Development Server**: Vite dev server with HMR
- **Port Configuration**: Local port 5000, external port 80

### Production Build
- **Frontend**: Vite build generating optimized static assets
- **Backend**: ESBuild bundling server code
- **Deployment**: Replit autoscale deployment target
- **Static Assets**: Served from Express with appropriate caching

### Environment Configuration
- **Database**: Environment variable based connection
- **Sessions**: Configurable session secret
- **File Storage**: Configurable upload directory
- **Authentication**: Replit OIDC configuration

## Changelog

```
Changelog:
- June 27, 2025. Initial setup and basic CMS structure
- June 27, 2025. Added sample content and integrated custom ScienceHeaven logo
- June 27, 2025. Removed Legal section from footer per user request
- June 27, 2025. Application ready for deployment with custom branding
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```