# QR Menu SaaS MVP

## Overview

A production-ready QR-Menu SaaS platform for cafes. Cafe owners can create digital menus or upload image-based menus, generate permanent QR codes for customer access, and manage subscriptions. The system prioritizes mobile-first public menu pages and cost-efficient serverless architecture.

**Core Features:**
- Admin authentication and cafe profile management
- Dual menu system: structured digital menu OR uploaded image menu
- Permanent QR code generation with downloadable PNG
- Public menu pages accessible without authentication
- Subscription management with trial period support via Razorpay

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework:** React with TypeScript, bundled via Vite
- **Routing:** Wouter (lightweight client-side routing)
- **State Management:** TanStack React Query for server state
- **UI Components:** shadcn/ui with Radix UI primitives
- **Styling:** Tailwind CSS with custom cafe-themed color palette
- **Forms:** React Hook Form with Zod validation
- **Animations:** Framer Motion for page transitions

### Backend Architecture
- **Runtime:** Express.js running on Node with TypeScript (tsx)
- **API Pattern:** RESTful routes defined in `server/routes.ts`
- **Authentication:** Passport.js with local strategy, session-based auth using express-session
- **Password Security:** scrypt hashing with timing-safe comparison
- **Session Storage:** Memory store (development), configurable for production

### Data Layer
- **ORM:** Drizzle ORM with PostgreSQL dialect
- **Schema Location:** `shared/schema.ts` - shared between client and server
- **Validation:** drizzle-zod for automatic schema-to-validator generation
- **Database Migrations:** Drizzle Kit (`db:push` command)

### Project Structure
```
/client          - React frontend application
  /src
    /components  - Reusable UI components
    /pages       - Route-level page components
    /hooks       - Custom React hooks for data fetching
    /lib         - Utilities and query client setup
/server          - Express backend
  /routes.ts     - API route definitions
  /storage.ts    - Data access layer abstraction
  /auth.ts       - Authentication setup
  /db.ts         - Database connection
/shared          - Code shared between client and server
  /schema.ts     - Drizzle database schema
  /routes.ts     - API contract definitions with Zod
```

### Key Design Decisions

1. **Shared Schema Pattern:** Database schema and API contracts live in `/shared` for type safety across the full stack. The routes file exports both path definitions and Zod schemas for request/response validation.

2. **Storage Abstraction:** All database operations go through `storage.ts`, making it easier to swap implementations or add caching.

3. **QR Code Generation:** Uses the `qrcode` npm package server-side to generate data URLs. QR codes point to permanent `/menu/:slug` URLs that never change.

4. **Menu Type Toggle:** Cafes choose between "digital" (structured categories/items) or "image" (single uploaded menu image). The public menu page renders accordingly.

5. **Build System:** Custom build script using esbuild for server bundling and Vite for client, outputting to `/dist`.

## External Dependencies

### Database
- **PostgreSQL** via `DATABASE_URL` environment variable
- Connection pooling through node-postgres (`pg` package)

### Authentication & Sessions
- `express-session` for session management
- `connect-pg-simple` available for PostgreSQL session storage (production)
- `memorystore` for development session storage

### Payment Processing
- **Razorpay** integration planned for subscription checkout and webhooks
- Subscription model with trial period tracking

### Image Handling
- **Cloudinary** or S3 intended for menu image uploads
- Currently uses direct URL storage in database

### QR Code Generation
- `qrcode` package for server-side QR generation
- `qrcode.react` for client-side QR rendering in dashboard

### Required Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key (defaults to dev value if not set)