# Next.js Migration Checklist
**Project:** Menu Maker SaaS  
**From:** React + Express → **To:** Next.js 14 (App Router)

---

## 📦 WHAT MOVES WHERE

### Frontend Migration Map

#### ✅ **Move As-Is (No Changes)**
```
SOURCE                                    → DESTINATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

client/src/components/ui/*                → components/ui/*
  - All shadcn components (48 files)      - ✅ Zero changes needed
  - badge.tsx, button.tsx, card.tsx, etc. - ✅ Already server-compatible

client/src/components/admin/*             → components/admin/*
  - AdminLayout.tsx                       - ✅ Just update imports
  - CafeSetup.tsx                         - ✅ Client component
  - CategoryManager.tsx                   - ✅ Client component
  - MenuItemManager.tsx                   - ✅ Client component
  - OfferManager.tsx                      - ✅ Client component
  - SubscriptionCard.tsx                  - ✅ Client component

client/src/components/PublicMenuItem.tsx  → components/PublicMenuItem.tsx
client/src/components/OfferDialog.tsx     → components/OfferDialog.tsx
client/src/components/QRPosterDialog.tsx  → components/QRPosterDialog.tsx

client/src/index.css                      → app/globals.css
client/tailwind.config.ts                 → tailwind.config.ts (merge)
client/postcss.config.js                  → postcss.config.js
```

#### ⚠️ **Adapt (Minor Changes)**
```
SOURCE                                    → DESTINATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

client/src/pages/Landing.tsx              → app/page.tsx
  CHANGES:
  - Remove Wouter imports
  - Export as default function
  - Add "use client" directive

client/src/pages/Auth.tsx                 → app/(auth)/login/page.tsx
  CHANGES:                                  app/(auth)/register/page.tsx
  - Split into login/register pages
  - Use Next.js Link instead of Wouter
  - Update form action to /api/auth/*

client/src/pages/Dashboard.tsx            → app/(admin)/dashboard/page.tsx
  CHANGES:
  - Add "use client" directive
  - Replace useRouter from wouter → next/navigation
  - TanStack Query stays the same ✅

client/src/pages/admin/MenuPage.tsx       → app/(admin)/menu/page.tsx
client/src/pages/admin/QrPage.tsx         → app/(admin)/qr/page.tsx  
client/src/pages/admin/SettingsPage.tsx   → app/(admin)/settings/page.tsx
  CHANGES (same for all):
  - Add "use client" directive
  - Update imports (wouter → next/navigation)

client/src/pages/PublicMenu.tsx           → Split into:
  MAJOR CHANGES:                            - app/menu/[slug]/page.tsx (Server Component)
  - Server component fetches data           - components/PublicMenuClient.tsx (Client)
  - ISR enabled (revalidate: 300)          
  - Client component handles interactivity
  - Keep Framer Motion on client side
```

#### 🔨 **Rewrite (Significant Changes)**
```
SOURCE                                    → DESTINATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

client/src/App.tsx                        → Delete (Next.js handles routing)
client/src/main.tsx                       → Delete (Next.js entry point)

client/src/hooks/use-cafes.ts             → lib/queries/cafes.ts
  CHANGES:
  - Keep TanStack Query hooks for client
  - Add server-side fetch functions
  - Example:
    // Client hook (for admin dashboard)
    export function useCafes() { ... }
    
    // Server function (for SSG/ISR)
    export async function getCafeBySlug(slug: string) {
      const cafe = await storage.getCafeBySlug(slug)
      return cafe
    }
```

---

### Backend Migration Map

#### ✅ **Move As-Is (Reusable)**
```
SOURCE                                    → DESTINATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

server/storage.ts                         → lib/storage/index.ts
  - IStorage interface                    - ✅ No changes
  - MongoDB implementation               - ✅ No changes
  - PostgreSQL implementation            - ✅ No changes
  - In-memory implementation             - ✅ No changes

server/models/*                           → lib/models/*
  - Category.ts                           - ✅ No changes
  - Item.ts                               - ✅ No changes
  - Tag.ts                                - ✅ No changes

shared/schema.ts                          → lib/schema.ts
  - All Drizzle schemas                   - ✅ No changes
  - Zod validation schemas               - ✅ No changes
  - TypeScript types                      - ✅ No changes

shared/routes.ts                          → lib/api-routes.ts
  - API route definitions                 - ✅ Keep for reference
```

#### 🔨 **Rewrite as API Routes**
```
SOURCE                                    → DESTINATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

server/index.ts                           → Delete
server/vite.ts                            → Delete
server/static.ts                          → Delete

server/auth.ts                            → lib/auth.ts + API routes
  OLD: Passport.js setup
  NEW: NextAuth.js OR custom JWT auth
  
  Lines 64-112 (register/login/logout)   → Split into:
    - app/api/auth/register/route.ts
    - app/api/auth/login/route.ts
    - app/api/auth/logout/route.ts
    - app/api/auth/user/route.ts

server/routes.ts (483 lines)              → Split into multiple API routes:

  Lines 41-75: Cafe Create                → app/api/cafes/route.ts
    app.post('/api/cafes/create')           export async function POST(req: Request)

  Lines 77-81: Get My Cafes               → app/api/cafes/route.ts
    app.get('/api/cafes/mine')              export async function GET(req: Request)

  Lines 83-118: Get Cafe by Slug          → app/menu/[slug]/page.tsx
    app.get('/api/cafes/:slug')             Server Component (SSG/ISR)

  Lines 120-129: Update Cafe              → app/api/cafes/[id]/route.ts
    app.patch('/api/cafes/:id')             export async function PATCH(req: Request)

  Lines 132-135: Get Categories           → Server Component or API
    app.get('/api/categories/:cafeId')      

  Lines 137-148: Create Category          → app/api/categories/route.ts
    app.post('/api/categories/:cafeId')     export async function POST(req: Request)

  Lines 150-203: Update Category          → app/api/categories/[id]/route.ts
    app.patch('/api/categories/:id')        export async function PATCH(req: Request)

  Lines 205-209: Delete Category          → app/api/categories/[id]/route.ts
    app.delete('/api/categories/:id')       export async function DELETE(req: Request)

  Lines 212-241: Menu Items CRUD          → app/api/menu-items/
    Similar pattern to categories

  Lines 244-280: Offers CRUD              → app/api/offers/
    Similar pattern to categories

  Lines 283-287: Subscription Status      → app/api/subscription/status/route.ts
    app.get('/api/subscription/status')   

  Lines 290-304: Promo Code Validation    → app/api/subscription/promo/[code]/route.ts
    app.get('/api/subscription/promo/:code')

  Lines 307-324: Schedule Downgrade       → app/api/subscription/downgrade/route.ts
    app.post('/api/subscription/downgrade')

  Lines 326-386: Create Order             → app/api/subscription/order/route.ts
    app.post('/api/subscription/order')     Razorpay integration

  Lines 388-452: Verify Payment           → app/api/subscription/verify/route.ts
    app.post('/api/subscription/verify')    Webhook handler

  Lines 455-479: File Upload              → app/api/upload/route.ts
    app.post('/api/upload')                 Multer → Next.js FormData
```

---

## 🔄 WHAT CAN BE REUSED

### ✅ **100% Reusable (Copy-Paste)**

1. **UI Components (48 files)**
   - All shadcn/ui components
   - Already built for React Server Components
   - Just update import paths

2. **Database Layer**
   - `storage.ts` - Complete abstraction
   - MongoDB/Postgres/Memory implementations
   - Mongoose schemas
   - Drizzle schemas

3. **Business Logic**
   - Subscription calculations
   - Offer discount logic
   - QR code generation
   - Menu item sorting

4. **Type Definitions**
   - Zod schemas
   - TypeScript types
   - API DTOs

5. **Styling**
   - Tailwind config
   - CSS variables
   - Theme definitions

6. **Third-Party Integrations**
   - Cloudinary SDK
   - Razorpay SDK
   - QRCode library

### ⚠️ **Can Be Adapted (80% Reusable)**

1. **React Components with Routing**
   - Components are fine
   - Just replace `wouter` hooks with `next/navigation`
   ```typescript
   // BEFORE
   import { useRoute, useLocation } from 'wouter'
   const [, setLocation] = useLocation()
   
   // AFTER
   import { useRouter, usePathname } from 'next/navigation'
   const router = useRouter()
   router.push('/path')
   ```

2. **Data Fetching Hooks**
   - Keep TanStack Query for client components
   - Add server-side fetch functions for SSG/ISR
   ```typescript
   // Client hook (admin dashboard)
   'use client'
   export function useCafes() {
     return useQuery({
       queryKey: ['cafes'],
       queryFn: () => fetch('/api/cafes').then(r => r.json())
     })
   }
   
   // Server function (public pages)
   export async function getCafes(ownerId: number) {
     return await storage.getCafesByOwnerId(ownerId)
   }
   ```

3. **Form Components**
   - Keep React Hook Form
   - Update form actions to use API routes
   - Add loading states

---

## 🔨 WHAT MUST BE REWRITTEN

### 1. **Authentication System**

**Current:** Passport.js + Express Session  
**Options:**

#### Option A: NextAuth.js (Recommended)
```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { storage } from '@/lib/storage'
import { comparePasswords } from '@/lib/auth'

export const authOptions = {
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        const user = await storage.getUserByUsername(credentials.username)
        if (!user) return null
        
        const valid = await comparePasswords(
          credentials.password, 
          user.password
        )
        return valid ? user : null
      }
    })
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  }
}

export default NextAuth(authOptions)
```

**Pros:** Battle-tested, session management built-in  
**Cons:** New API to learn

#### Option B: Iron Session (Keep Passport-like)
```typescript
// lib/auth.ts
import { ironSession } from 'next-iron-session'

export const sessionOptions = {
  password: process.env.SESSION_SECRET,
  cookieName: 'menu_maker_session',
  ttl: 60 * 60 * 24 * 7, // 7 days
}

// app/api/auth/login/route.ts
export async function POST(request: Request) {
  const session = await getIronSession(cookies(), sessionOptions)
  const { username, password } = await request.json()
  
  const user = await storage.getUserByUsername(username)
  const valid = await comparePasswords(password, user.password)
  
  if (valid) {
    session.user = user
    await session.save()
    return Response.json(user)
  }
  
  return Response.json({ error: 'Invalid' }, { status: 401 })
}
```

**Pros:** Closer to current Passport setup  
**Cons:** Manual session management

### 2. **Routing System**

**Current:** Wouter (client-side)  
**New:** Next.js App Router (file-based)

```typescript
// BEFORE: client/src/App.tsx
<Switch>
  <Route path="/" component={Landing} />
  <Route path="/auth" component={AuthPage} />
  <Route path="/dashboard" component={Dashboard} />
  <Route path="/menu/:slug" component={PublicMenu} />
</Switch>

// AFTER: File structure
app/
├── page.tsx              # Landing page
├── (auth)/
│   └── login/page.tsx    # Auth page
├── (admin)/
│   └── dashboard/page.tsx
└── menu/[slug]/page.tsx  # Public menu
```

### 3. **File Upload Handler**

**Current:** Multer middleware  
**New:** Next.js FormData API

```typescript
// BEFORE: server/routes.ts
app.post('/api/upload', upload.single('file'), async (req, res) => {
  const file = req.file
  const b64 = Buffer.from(file.buffer).toString('base64')
  const dataURI = `data:${file.mimetype};base64,${b64}`
  const result = await cloudinary.uploader.upload(dataURI)
  res.json({ url: result.secure_url })
})

// AFTER: app/api/upload/route.ts
export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File
  
  if (!file) {
    return Response.json({ error: 'No file' }, { status: 400 })
  }
  
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const b64 = buffer.toString('base64')
  const dataURI = `data:${file.type};base64,${b64}`
  
  const result = await cloudinary.uploader.upload(dataURI, {
    folder: 'menu_images'
  })
  
  return Response.json({ url: result.secure_url })
}
```

### 4. **Public Menu Page (SSG/ISR)**

**Current:** Client-side fetch with loading state  
**New:** Server Component with ISR

```typescript
// BEFORE: client/src/pages/PublicMenu.tsx
export default function PublicMenu() {
  const [, params] = useRoute('/menu/:slug')
  const { data: cafe, isLoading } = useCafeBySlug(params.slug)
  
  if (isLoading) return <Skeleton />
  return <MenuDisplay cafe={cafe} />
}

// AFTER: app/menu/[slug]/page.tsx
export const revalidate = 300 // ISR: 5 minutes

export async function generateStaticParams() {
  // Pre-render popular cafes at build time
  const cafes = await storage.getAllCafes() // Add this method
  return cafes.slice(0, 100).map(cafe => ({
    slug: cafe.slug
  }))
}

export default async function MenuPage({ params }: { params: { slug: string } }) {
  const cafe = await storage.getCafeBySlug(params.slug)
  
  if (!cafe) {
    notFound()
  }
  
  const categories = await storage.getCategories(cafe.id)
  const items = await storage.getMenuItems(cafe.id)
  const offers = await storage.getOffers(cafe.id)
  
  // ... subscription logic ...
  
  return <PublicMenuClient cafe={cafeWithData} />
}

// components/PublicMenuClient.tsx
'use client'
export function PublicMenuClient({ cafe }) {
  // All interactive features (search, filters, animations)
  const [searchQuery, setSearchQuery] = useState('')
  // ... rest of client logic
}
```

---

## 📊 SUMMARY TABLE

| Component Type          | Count | Reuse % | Notes                          |
|------------------------|-------|---------|--------------------------------|
| UI Components          | 48    | 100%    | Copy-paste ✅                  |
| Admin Components       | 8     | 95%     | Update imports only            |
| Database Layer         | 1     | 100%    | Storage abstraction ✅         |
| API Endpoints          | 20    | 0%      | Rewrite as Next.js routes      |
| Auth System            | 1     | 30%     | Hash logic reusable            |
| Page Components        | 8     | 80%     | Add "use client" + route change|
| Hooks                  | 6     | 90%     | Add server alternatives        |
| Types/Schemas          | 1     | 100%    | Zod + TypeScript ✅            |
| **TOTAL**              | **93**| **82%** | **High reusability** 🎉        |

---

## ✅ PRE-MIGRATION CHECKLIST

- [ ] Backup MongoDB database
- [ ] Export all environment variables
- [ ] Document all API endpoints (use Postman/Thunder)
- [ ] Test current authentication flow
- [ ] List all Cloudinary images
- [ ] Screenshot all pages for UI reference
- [ ] Create Git branch: `feature/nextjs-migration`
- [ ] Install Next.js 14 in new folder

---

## 🎯 MIGRATION ORDER (Priority)

1. ✅ **Phase 1: Setup** (1 hour)
   - Create Next.js project
   - Copy shared code (types, schemas, utils)
   - Setup Tailwind + UI components

2. ✅ **Phase 2: Database** (1 hour)
   - Move storage layer
   - Test MongoDB connection
   - Verify queries work

3. ✅ **Phase 3: Auth** (4 hours)
   - Setup NextAuth.js OR Iron Session
   - Migrate register/login routes
   - Add middleware for protected routes

4. ✅ **Phase 4: API Routes** (6 hours)
   - Convert all Express routes to Next.js
   - Test with Postman
   - Maintain exact same responses

5. ✅ **Phase 5: Pages** (8 hours)
   - Landing page
   - Login/Register pages
   - Admin dashboard
   - Menu management pages
   - Settings page

6. ✅ **Phase 6: Public Menu** (4 hours)
   - Server Component with ISR
   - Client component for interactivity
   - Test QR code flow

7. ✅ **Phase 7: Testing** (4 hours)
   - E2E testing
   - Payment flow testing
   - Mobile responsiveness

8. ✅ **Phase 8: Deploy** (1 hour)
   - Push to Vercel
   - Configure env vars
   - Test production build

**Total:** ~29 hours

---

**Status:** Ready to Execute  
**Next Step:** Create Next.js project structure

---
