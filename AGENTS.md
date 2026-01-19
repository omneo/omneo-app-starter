# Omneo App Starter - AI Agent Guidelines

## Table of Contents

1. [Repository Overview](#repository-overview)
2. [Setup Instructions](#setup-instructions)
3. [Architecture & Structure](#architecture--structure)
4. [React Best Practices](#react-best-practices)
5. [TypeScript Conventions](#typescript-conventions)
6. [Component Patterns](#component-patterns)
7. [State Management](#state-management)
8. [Routing & Navigation](#routing--navigation)
9. [API & Webhook Handling](#api--webhook-handling)
10. [Authentication & Security](#authentication--security)
11. [Styling Guidelines](#styling-guidelines)
12. [Testing & Validation](#testing--validation)
13. [Development Workflow](#development-workflow)
14. [Common Patterns & Examples](#common-patterns--examples)
15. [Do's and Don'ts](#dos-and-donts)

---

## Repository Overview

### Purpose
This is a production-ready React Router v7 template for building Omneo-powered clienteling applications with real-time webhook integration and customer profile management. It provides a foundation for creating embedded apps within the Omneo clienteling platform.

### Tech Stack
- **Framework**: React Router v7 (with SSR)
- **Runtime**: Node.js 20+
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS v4 with Radix UI
- **API Client**: @omneo/omneo-sdk
- **Build Tool**: Vite 7.x
- **Development**: Ngrok for local tunneling
- **Deployment**: Docker

### Key Features
- Server-side rendering (SSR) by default
- Hot Module Replacement (HMR)
- Omneo SDK integration
- Real-time webhook handling
- TypeScript with full type safety
- Radix UI component library
- Automated development environment setup
- Customer analytics dashboard

---

## Setup Instructions

### Prerequisites
```bash
# Required
- Node.js 18+ (20+ recommended)
- npm or yarn
- Omneo account with API access
```

### Initial Setup

1. **Clone and Install**
```bash
git clone <repository-url>
cd omneo-app-starter
npm install  # or yarn install
```

2. **Environment Variables**
Create `.env` in the root directory:
```bash
OMNEO_TENANT=your-tenant-name
OMNEO_API_TOKEN=your-api-token
OMNEO_SECRET=your-webhook-secret
```

3. **Run Setup Wizard**
```bash
npm run dev
```

The first-time setup wizard will:
- Configure tenant settings
- Set up webhook events
- Register clienteling app
- Create `omneo.config.json`
- Start ngrok tunnel

4. **Verify Setup**
After setup completes, check:
- ✅ `omneo.config.json` exists
- ✅ Ngrok tunnel running (shown in console)
- ✅ App registered in Omneo clienteling
- ✅ Webhooks configured

### Development Server
```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run typecheck # Run TypeScript type checking
```

### Docker Deployment
```bash
docker build -t omneo-app .
docker run -p 3000:3000 omneo-app
```

---

## Architecture & Structure

### Directory Structure

```
omneo-app-starter/
├── app/                          # Application source code
│   ├── components/               # Reusable UI components
│   │   ├── ui/                  # Radix UI component library
│   │   │   ├── button.tsx       # Button with CVA variants
│   │   │   ├── card.tsx         # Card components
│   │   │   ├── badge.tsx        # Badge component
│   │   │   ├── alert.tsx        # Alert component
│   │   │   └── separator.tsx    # Separator component
│   │   └── LoggingErrorBoundary.tsx
│   ├── contexts/                # React Context providers
│   │   ├── LoggingContext.tsx   # Logging context
│   │   └── auth/                # Authentication context
│   │       ├── authContext.tsx  # Main auth provider
│   │       └── utils/           # Auth utilities
│   ├── hooks/                   # Custom React hooks
│   │   └── useLogger.ts         # Logging hook
│   ├── lib/                     # Utility libraries
│   │   └── utils.ts             # cn() for className merging
│   ├── routes/                  # Route components
│   │   ├── clienteling/         # Clienteling routes
│   │   │   ├── index.tsx        # Main dashboard
│   │   │   └── block.tsx        # Embedded block view
│   │   └── api/                 # API routes
│   │       └── $tenant.webhooks.omneo/
│   │           ├── route.ts     # Webhook handler
│   │           └── events/      # Event handlers
│   ├── utils/                   # Helper utilities
│   │   └── omneo/
│   │       └── auth.ts          # Webhook authentication
│   ├── routes.ts                # Route configuration
│   ├── root.tsx                 # Root component
│   └── app.css                  # Global styles
├── plugins/                     # Vite plugins
│   ├── omneo-dev-environment.ts # Dev setup automation
│   └── utils/                   # Plugin utilities
├── public/                      # Static assets
├── build/                       # Build output
│   ├── client/                  # Client bundle
│   └── server/                  # Server bundle
├── components.json              # Shadcn/ui config
├── omneo.config.json           # Omneo configuration
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── vite.config.ts              # Vite config
├── react-router.config.ts      # React Router config
└── Dockerfile                  # Docker config
```

### Core Architecture Principles

1. **Server-Side Rendering (SSR)**: Default rendering mode for better performance and SEO
2. **File-Based Routing**: Routes defined in `app/routes.ts`
3. **Context-First Authentication**: Authentication handled globally via React Context
4. **Type Safety**: Full TypeScript coverage with strict mode
5. **Component Composition**: Radix UI primitives with Tailwind styling
6. **API Route Separation**: API routes separate from UI routes

---

## React Best Practices

### Component Structure

**Follow this standard pattern for all components:**

```tsx
// 1. Imports - group by category
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { SomeIcon } from 'lucide-react';
import { Card, CardContent } from '~/components/ui/card';
import { useClientelingContext } from '~/contexts/auth/authContext';

// 2. Type definitions
interface ComponentProps {
  title: string;
  children?: ReactNode;
  onAction?: () => void;
}

// 3. Component definition - use named function exports
export default function ComponentName({ title, children, onAction }: ComponentProps) {
  // 4. Hooks - declare at top, in consistent order
  const context = useClientelingContext();
  const [state, setState] = useState<string>('');

  // 5. Effects
  useEffect(() => {
    // Effect logic
  }, [/* dependencies */]);

  // 6. Event handlers
  const handleClick = () => {
    onAction?.();
  };

  // 7. Derived values
  const computedValue = state.toUpperCase();

  // 8. Early returns for loading/error states
  if (!context) {
    return <div>Loading...</div>;
  }

  // 9. Main render
  return (
    <Card>
      <CardContent>
        <h2>{title}</h2>
        {children}
      </CardContent>
    </Card>
  );
}
```

### Component Design Principles

1. **Single Responsibility**: Each component should do one thing well
2. **Prop Drilling Avoidance**: Use context for deeply nested data
3. **Composition Over Inheritance**: Build complex UIs from simple components
4. **Explicit Over Implicit**: Prefer explicit prop types and return types
5. **Named Exports for Components**: Use `export default function ComponentName()`

### Hooks Best Practices

**Standard Hook Patterns in This Codebase:**

```tsx
// ✅ Good: Custom hook for auth
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ✅ Good: Convenience hooks
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

// ✅ Good: Hooks with guaranteed non-null values
export function useClientelingContext(): ClientelingContext {
  const { context } = useAuth();
  if (!context) {
    throw new Error('useClientelingContext must be used within AuthGuard');
  }
  return context;
}

// ✅ Good: Effect with proper dependencies
useEffect(() => {
  if (!profile?.id) return;
  
  client.profiles.aggregations.list(profile.id).then((data) => {
    setAggregations(data);
  });
}, [client, profile?.id]);
```

### State Management

**State Organization:**

```tsx
// ✅ Good: Separate state by concern
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [data, setData] = useState<Data[]>([]);

// ✅ Good: Related state grouped together
const [authState, setAuthState] = useState<AuthState>({
  isAuthenticated: false,
  isLoading: true,
  context: null,
  validationResult: null,
  error: null,
  client: null,
});

// ❌ Avoid: Over-flattening related state
const [isAuthenticated, setIsAuthenticated] = useState(false);
const [isLoading, setIsLoading] = useState(true);
const [context, setContext] = useState(null);
// ... this becomes hard to manage
```

---

## TypeScript Conventions

### Type Definitions

**Always define explicit types for:**

1. Component Props
2. Function Parameters
3. Function Return Types
4. State Values
5. Context Values

```tsx
// ✅ Good: Explicit interface for props
interface ClientelingProps {
  profile: Profile | null;
  location: Location | null;
}

// ✅ Good: Type for function parameters
async function handleAuthentication(
  validationResult: TokenValidationResult, 
  context: ClientelingContext
): Promise<void> {
  // Implementation
}

// ✅ Good: Type for state
const [transactions, setTransactions] = useState<Transaction[]>([]);
```

### Type Imports

```tsx
// ✅ Good: Use type imports for types
import type { ReactNode } from 'react';
import type { Transaction, Profile } from '@omneo/omneo-sdk';
import type { Route } from './+types/root';

// ✅ Good: Regular imports for values
import { useState, useEffect } from 'react';
import { Omneo } from '@omneo/omneo-sdk';
```

### Interface vs Type

**Prefer `interface` for:**
- Object shapes
- Component props
- Context types

**Prefer `type` for:**
- Unions
- Intersections
- Mapped types
- Type aliases

```tsx
// ✅ Good: Interface for object shapes
interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  context: ClientelingContext | null;
}

// ✅ Good: Type for unions
type WebhookEvent = 'profile.created' | 'profile.updated' | 'profile.deleted';
```

### Null Handling

```tsx
// ✅ Good: Explicit null checks
if (!location?.id) return;

// ✅ Good: Optional chaining
const addressLine = location?.address?.address_line_1;

// ✅ Good: Nullish coalescing
const displayName = profile?.first_name ?? 'Guest';

// ❌ Avoid: Using ! (non-null assertion) without justification
const id = profile!.id; // Only if you're absolutely certain
```

### Type Narrowing

```tsx
// ✅ Good: Type guards
if (typeof error === 'string') {
  console.error(error);
}

// ✅ Good: Discriminated unions
if (result.isValid) {
  // TypeScript knows result has client property
  const client = result.client;
}
```

---

## Component Patterns

### UI Components (Radix + Tailwind)

**This project uses Radix UI primitives with custom Tailwind styling.**

#### Button Component Pattern

```tsx
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "~/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        outline: "border bg-background shadow-xs hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md gap-1.5 px-3",
        lg: "h-10 rounded-md px-6",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}
```

**Key Patterns:**
- Use `class-variance-authority` for variant management
- Use `cn()` utility for className merging
- Support `asChild` prop for composition with Radix Slot
- Spread remaining props to underlying element
- Use semantic variant names

#### Card Component Pattern

```tsx
export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
}

// Usage
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

### Context Pattern

**This repo uses React Context for global state management.**

```tsx
// 1. Define types
interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  context: ClientelingContext | null;
  client: Omneo | null;
}

interface AuthContextType extends AuthState {}

// 2. Create context with undefined default
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Create provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    context: null,
    client: null,
  });

  // Provider logic...

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
}

// 4. Create custom hook with error checking
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// 5. Create convenience hooks
export function useOmneoClient(): Omneo {
  const { client } = useAuth();
  if (!client) {
    throw new Error('Omneo client not initialized');
  }
  return client;
}
```

### Authentication Guard Pattern

```tsx
// Wrapper component that ensures authentication
export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, error } = useAuth();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (error) {
    return <AuthErrorScreen error={error} />;
  }

  if (!isAuthenticated) {
    return <UnauthorizedAccessScreen />;
  }

  return <>{children}</>;
}

// Usage in root.tsx
export default function App() {
  return (
    <AuthProvider>
      <AuthGuard>
        <Outlet />
      </AuthGuard>
    </AuthProvider>
  );
}
```

---

## State Management

### Context-Based State

**This repo uses React Context for global state, not Redux or Zustand.**

#### When to Use Context

✅ **Use Context for:**
- Authentication state
- User profile data
- Global UI state (theme, locale)
- Omneo client instance
- Location/tenant information

❌ **Don't Use Context for:**
- Frequently changing values (use local state)
- Simple prop drilling (pass props directly)
- Performance-critical frequent updates

### Local State

**Use `useState` for component-specific state:**

```tsx
export default function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Component logic...
}
```

### Async State Management

**Pattern for API calls:**

```tsx
useEffect(() => {
  if (!location?.id) return;
  
  setLoading(true);
  client.transactions.list({ 
    'filter[location_id]': location.id, 
    'page[size]': '20',
    'sort': '-transacted_at' 
  })
    .then(({ data }) => {
      setTransactions(data);
      setError(null);
    })
    .catch((err) => {
      console.error('Failed to fetch transactions:', err);
      setError(err.message);
    })
    .finally(() => {
      setLoading(false);
    });
}, [location?.id, client]);
```

---

## Routing & Navigation

### Route Configuration

**Routes are defined in `app/routes.ts`:**

```typescript
import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
  // UI routes - wrapped by AuthProvider and AuthGuard
  route("/clienteling", "routes/clienteling/index.tsx"),
  route("/clienteling/block", "routes/clienteling/block.tsx"),
  
  // API routes - handle their own authentication
  route("/api/:tenant/webhooks/omneo", "routes/api/$tenant.webhooks.omneo/route.ts"),
] satisfies RouteConfig;
```

### Route Types

**React Router v7 provides type-safe routes:**

```tsx
import type { Route } from "./+types/root";

export const links: Route.LinksFunction = () => [
  { rel: "stylesheet", href: "..." }
];

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  // Type-safe error handling
}
```

### Navigation

**Omneo clienteling uses postMessage for navigation:**

```tsx
// Navigate within Omneo platform
const handleBackClick = () => {
  window.parent.postMessage({
    type: 'NAVIGATE',
    path: '/search'
  }, '*');
};
```

### Loader Functions

**React Router v7 loaders (when needed):**

```tsx
export async function loader({ request, params }: Route.LoaderArgs) {
  // Server-side data loading
  const data = await fetchData(params.id);
  return { data };
}

export default function Component({ loaderData }: Route.ComponentProps) {
  // Access loaded data
  const { data } = loaderData;
}
```

### Action Functions

**Handle form submissions and mutations:**

```tsx
export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  const name = formData.get('name');
  
  // Process data
  await saveData(name);
  
  return redirect('/success');
}
```

---

## API & Webhook Handling

### Webhook Route Structure

**Webhooks follow a specific pattern:**

```
app/routes/api/$tenant.webhooks.omneo/
├── route.ts              # Main webhook handler
└── events/
    ├── index.ts          # Event registry
    ├── profile.created/
    │   └── index.ts      # Handler for profile.created
    └── profile.updated/
        └── index.ts      # Handler for profile.updated
```

### Webhook Handler Pattern

**Main webhook route (`route.ts`):**

```typescript
import type { ActionFunctionArgs } from "react-router";
import { authOmneoWebhook } from "~/utils/omneo/auth";
import events from "./events";

export const action = async (args: ActionFunctionArgs) => {
  const { request, params } = args;
  const topic = request.headers.get('x-omneo-event') as keyof typeof events;
  const tenant = params.tenant;
  
  if (!tenant) {
    return new Response("Missing tenant parameter", { status: 400 });
  }
  
  try {
    // Authenticate the webhook
    await authOmneoWebhook(args);
    console.log(`Received Omneo Webhook Event: ${topic}`);

    const webhook = events[topic];
    if (!webhook) {
      return new Response("Unknown Webhook Event", { status: 422 });
    }
    
    return webhook({ request, topic, tenant });
  } catch (error: any) {
    console.error(`Error in webhook ${topic}`, error);
    return new Response(
      error?.message || 'Internal Server Error', 
      { status: error?.status || 500 }
    );
  }
};
```

### Event Registry Pattern

**Event index (`events/index.ts`):**

```typescript
import profileCreated from './profile.created';
import profileUpdated from './profile.updated';

const events = {
  'profile.created': profileCreated,
  'profile.updated': profileUpdated,
};

export default events;
```

### Individual Event Handler

**Event handler (`events/profile.created/index.ts`):**

```typescript
import { Omneo } from '@omneo/omneo-sdk';

interface WebhookArgs {
  request: Request;
  topic: string;
  tenant: string;
}

const action = async ({ request, topic, tenant }: WebhookArgs) => {
  const token = process.env.OMNEO_API_TOKEN;
  if (!token) {
    return new Response('Missing OMNEO_API_TOKEN', { status: 500 });
  }

  const client = new Omneo({ token, tenant });
  const payload = await request.json();

  console.log('Profile Created:', payload);

  // Process the webhook
  // Example: Update profile, send notification, etc.

  return new Response('OK', { status: 200 });
};

export default action;
```

### Webhook Authentication

**HMAC validation (`app/utils/omneo/auth.ts`):**

```typescript
import { createHmac, timingSafeEqual } from "crypto";

export async function authOmneoWebhook({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return Promise.reject({ message: 'Invalid Method', status: 405 });
  }
  
  const signature = request.headers.get('x-omneo-hmac-sha256');
  const omneoSecret = process.env.OMNEO_SECRET;

  if (!signature || !omneoSecret) {
    return Promise.reject({ message: 'Invalid Omneo Webhook', status: 422 });
  }

  const rawBody = await request.clone().text();
  const expectedHash = createHmac('sha256', omneoSecret)
    .update(rawBody, 'utf8')
    .digest('hex');

  const signatureBuffer = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expectedHash, 'hex');

  if (signatureBuffer.length !== expectedBuffer.length || 
      !timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return Promise.reject({ message: 'Authentication failed', status: 401 });
  }

  return Promise.resolve();
}
```

### Adding New Webhook Events

1. **Update `omneo.config.json`:**
```json
{
  "webhooks": {
    "profile.created": true,
    "profile.updated": true,
    "order.created": true  // Add new event
  }
}
```

2. **Create event handler:**
```bash
mkdir -p app/routes/api/\$tenant.webhooks.omneo/events/order.created
touch app/routes/api/\$tenant.webhooks.omneo/events/order.created/index.ts
```

3. **Implement handler:**
```typescript
// app/routes/api/$tenant.webhooks.omneo/events/order.created/index.ts
import { Omneo } from '@omneo/omneo-sdk';

interface WebhookArgs {
  request: Request;
  topic: string;
  tenant: string;
}

const action = async ({ request, topic, tenant }: WebhookArgs) => {
  const payload = await request.json();
  console.log('Order Created:', payload);
  
  // Handle order creation
  
  return new Response('OK', { status: 200 });
};

export default action;
```

4. **Register in event index:**
```typescript
// app/routes/api/$tenant.webhooks.omneo/events/index.ts
import orderCreated from './order.created';

const events = {
  'profile.created': profileCreated,
  'profile.updated': profileUpdated,
  'order.created': orderCreated,  // Add to registry
};

export default events;
```

---

## Authentication & Security

### Omneo Authentication Flow

**This app uses postMessage for authentication with the Omneo platform:**

```typescript
// 1. Request context from parent (Omneo platform)
export function requestContextFromParent(): void {
  window.parent.postMessage({
    type: 'OMNEO_REQUEST_CLIENTELING_CONTEXT',
    timestamp: Date.now(),
  }, '*');
}

// 2. Listen for context response
export function setupClientelingContextListener(
  onValidation?: (result: TokenValidationResult, context: ClientelingContext) => void
): () => void {
  const messageHandler = async (event: MessageEvent) => {
    if (event.source !== window.parent) return;

    const message = event.data;
    if (message && message.type === 'OMNEO_CLIENTELING_CONTEXT') {
      const context: ClientelingContext = message;
      const { token } = context.authentication;
      const { tenant } = context.environment;

      if (token && tenant) {
        const client = new Omneo({ token, tenant });
        
        // Validate token
        const validationResult = await client.auth.verifyToken()
          .then((response) => ({
            isValid: response.status === 200,
            client: response.status === 200 ? client : undefined
          }));
        
        if (onValidation) {
          onValidation(validationResult, context);
        }
      }
    }
  };

  window.addEventListener('message', messageHandler);
  return () => window.removeEventListener('message', messageHandler);
}
```

### Security Best Practices

1. **Environment Variables**: Never commit secrets to version control
```bash
# .env (not committed)
OMNEO_TENANT=tenant-name
OMNEO_API_TOKEN=secret-token
OMNEO_SECRET=webhook-secret
```

2. **Webhook Authentication**: Always validate HMAC signatures
```typescript
// Use timing-safe comparison to prevent timing attacks
if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
  return Promise.reject({ message: 'Authentication failed', status: 401 });
}
```

3. **CORS Handling**: Ngrok tunnel handles CORS in development
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    allowedHosts: true  // Allow ngrok subdomain
  }
});
```

4. **Token Validation**: Always verify tokens before use
```typescript
const validationResult = await client.auth.verifyToken();
if (!validationResult.isValid) {
  // Handle invalid token
}
```

---

## Styling Guidelines

### Tailwind CSS

**This project uses Tailwind CSS v4 with custom design tokens.**

#### Utility-First Approach

```tsx
// ✅ Good: Compose with utilities
<div className="flex items-center gap-4 p-6 rounded-lg border shadow-sm">
  <Icon className="h-5 w-5 text-muted-foreground" />
  <span className="text-sm font-medium">Label</span>
</div>

// ❌ Avoid: Custom CSS classes for one-off styling
<div className="custom-container">
  ...
</div>
```

#### Responsive Design

```tsx
// ✅ Good: Mobile-first responsive design
<div className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4">
  Content
</div>

// Grid layouts
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id} />)}
</div>
```

#### Color System

**Use semantic color tokens:**

```tsx
// ✅ Good: Semantic colors
<Button className="bg-primary text-primary-foreground">
  Primary Action
</Button>

<p className="text-muted-foreground">
  Secondary text
</p>

<Alert className="border-destructive text-destructive">
  Error message
</Alert>

// Available tokens:
// - background / foreground
// - primary / primary-foreground
// - secondary / secondary-foreground
// - muted / muted-foreground
// - accent / accent-foreground
// - destructive / destructive-foreground
// - border
// - input
// - ring
```

#### Dark Mode Support

```tsx
// ✅ Good: Dark mode variants
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  Content
</div>

// UI components automatically handle dark mode
<Button variant="outline">Button</Button>
```

### Class Name Utility

**Use `cn()` for conditional and merged classes:**

```tsx
import { cn } from "~/lib/utils";

// ✅ Good: Merge and conditionally apply classes
<div className={cn(
  "base-class",
  isActive && "active-class",
  className  // Allow override from props
)}>
  Content
</div>

// ✅ Good: With CVA variants
<button className={cn(buttonVariants({ variant, size }), className)}>
  Click me
</button>
```

### Icon Usage

**This project uses Lucide React for icons:**

```tsx
import { MapPin, Calendar, DollarSign, AlertCircle } from 'lucide-react';

// ✅ Good: Consistent icon sizing
<MapPin className="h-5 w-5" />
<Calendar className="h-4 w-4" />

// ✅ Good: Icon with text
<div className="flex items-center gap-2">
  <AlertCircle className="h-5 w-5" />
  <span>Warning message</span>
</div>
```

### Layout Patterns

```tsx
// ✅ Good: Container with max width
<div className="w-full p-6">
  <div className="max-w-6xl mx-auto">
    {/* Content */}
  </div>
</div>

// ✅ Good: Card grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</div>

// ✅ Good: Flex layout
<div className="flex items-center justify-between">
  <h1 className="text-2xl font-bold">Title</h1>
  <Button>Action</Button>
</div>
```

---

## Testing & Validation

### TypeScript Type Checking

```bash
# Run type checking
npm run typecheck

# Type checking is automatic in development
npm run dev  # Includes type checking
```

### Manual Testing

**Test in Omneo Platform:**

1. Start development server: `npm run dev`
2. Note the ngrok URL from console
3. Open Omneo clienteling dashboard
4. Click your app button
5. Verify app loads correctly

**Test Webhooks:**

1. Configure webhooks in `omneo.config.json`
2. Start development server
3. Trigger events in Omneo (create/update profile)
4. Check console logs for webhook receipt
5. Verify webhook handler logic

### Error Handling

**Implement proper error boundaries:**

```tsx
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404
      ? "The requested page could not be found."
      : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
```

---

## Development Workflow

### Daily Development

```bash
# Start development (includes type checking and HMR)
npm run dev

# In another terminal: Watch for type errors
npm run typecheck -- --watch

# Build for production
npm run build

# Test production build locally
npm run start
```

### Adding New Features

**Standard workflow for adding features:**

1. **Create Component**
```bash
touch app/components/NewFeature.tsx
```

2. **Implement with Types**
```tsx
interface NewFeatureProps {
  data: string;
}

export default function NewFeature({ data }: NewFeatureProps) {
  return <div>{data}</div>;
}
```

3. **Add Route (if needed)**
```typescript
// app/routes.ts
route("/new-feature", "routes/new-feature.tsx"),
```

4. **Test in Browser**
- Verify functionality
- Check console for errors
- Test responsive design
- Verify TypeScript types

### Configuration Management

**Updating Omneo Configuration:**

```json
// omneo.config.json
{
  "tenant": "your-tenant",
  "namespace": "your-namespace",
  "webhooks": {
    "profile.created": true,
    "profile.updated": true
  },
  "clienteling": {
    "apps": [{
      "handle": "your-app",
      "title": "Your App",
      "button": { "label": "Your App" },
      "clienteling": { "url": "https://your-ngrok-url.ngrok.io/clienteling" }
    }]
  }
}
```

**After modifying config:**
1. Restart development server
2. Config changes auto-sync to Omneo
3. Refresh Omneo platform to see updates

### Plugin Development

**The Omneo dev environment plugin handles:**
- Ngrok tunnel creation
- Webhook registration
- Clienteling app registration
- Configuration syncing

**Plugin location:** `plugins/omneo-dev-environment.ts`

**When to modify:**
- Adding new webhook events
- Changing tunnel configuration
- Customizing setup wizard
- Adding new Omneo integrations

---

## Common Patterns & Examples

### Fetching Data from Omneo SDK

```tsx
export default function ProfileTransactions() {
  const { profile } = useClientelingContext();
  const client = useOmneoClient();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!profile?.id) return;
    
    setLoading(true);
    client.transactions.list({ 
      'filter[profile_id]': profile.id,
      'page[size]': '20',
      'sort': '-transacted_at'
    })
      .then(({ data }) => setTransactions(data))
      .catch((error) => console.error('Failed to fetch:', error))
      .finally(() => setLoading(false));
  }, [profile?.id, client]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {transactions.map(txn => (
        <TransactionCard key={txn.id} transaction={txn} />
      ))}
    </div>
  );
}
```

### Formatting Utilities

```tsx
// Currency formatting
const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount / 100); // Amount in cents
};

// Date formatting
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Usage
<span>{formatCurrency(transaction.total_price, 'USD')}</span>
<time>{formatDate(transaction.transacted_at)}</time>
```

### Loading States

```tsx
// ✅ Good: Explicit loading states
if (loading) {
  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground">Loading...</p>
    </div>
  );
}

// ✅ Good: Empty states
if (transactions.length === 0) {
  return (
    <div className="text-center py-8">
      <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <p className="text-muted-foreground">No transactions found</p>
    </div>
  );
}
```

### Navigation in Omneo Platform

```tsx
// Navigate back to search
const handleBackClick = () => {
  window.parent.postMessage({
    type: 'NAVIGATE',
    path: '/search'
  }, '*');
};

// Navigate to profile
const viewProfile = (profileId: string) => {
  window.parent.postMessage({
    type: 'NAVIGATE',
    path: `/profiles/${profileId}`
  }, '*');
};
```

### Dynamic Lists

```tsx
export default function TransactionList({ transactions }: { transactions: Transaction[] }) {
  return (
    <div className="space-y-2">
      {transactions.map((transaction) => (
        <div 
          key={transaction.id} 
          className="border rounded-lg p-3 hover:bg-accent/50 transition-colors"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">#{transaction.external_id}</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(transaction.transacted_at)}
              </p>
            </div>
            <span className="font-semibold">
              {formatCurrency(transaction.total_price)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Conditional Rendering

```tsx
// ✅ Good: Early return pattern
if (!profile) {
  return <div>No profile available</div>;
}

// ✅ Good: Ternary for simple conditions
<Badge variant={isActive ? "default" : "secondary"}>
  {isActive ? "Active" : "Inactive"}
</Badge>

// ✅ Good: Logical AND for optional rendering
{error && (
  <Alert variant="destructive">
    {error}
  </Alert>
)}

// ✅ Good: Optional chaining for nested properties
<p>{location?.address?.city ?? 'N/A'}</p>
```

---

## Do's and Don'ts

### Component Structure

**✅ DO:**
- Use named function exports: `export default function Component()`
- Define prop types with interfaces
- Group imports by category (React, third-party, local)
- Use early returns for loading/error states
- Keep components focused and single-purpose

**❌ DON'T:**
- Use arrow function exports: `const Component = () => {}`
- Use inline type definitions in parameters
- Mix import categories randomly
- Nest conditional rendering deeply
- Create god components with multiple responsibilities

### TypeScript

**✅ DO:**
- Use explicit type annotations for props and state
- Use `type` imports: `import type { Type } from 'module'`
- Use optional chaining: `data?.property?.nested`
- Use nullish coalescing: `value ?? defaultValue`
- Define interfaces for object shapes

**❌ DON'T:**
- Use `any` type (use `unknown` if needed)
- Use non-null assertion (`!`) without justification
- Ignore TypeScript errors
- Define types inline in component parameters
- Use `as` type assertions excessively

### State Management

**✅ DO:**
- Use Context for global state (auth, client, tenant)
- Use local state for component-specific data
- Group related state together
- Include loading and error states for async operations
- Clean up side effects in useEffect

**❌ DON'T:**
- Put everything in global context
- Mix related state across multiple useState calls
- Forget to handle loading states
- Ignore error handling in async operations
- Create memory leaks (forget cleanup)

### Styling

**✅ DO:**
- Use Tailwind utility classes
- Use semantic color tokens (`text-primary`, `bg-muted`)
- Use `cn()` for conditional classes
- Follow mobile-first responsive design
- Use consistent spacing scale

**❌ DON'T:**
- Write custom CSS unless absolutely necessary
- Use arbitrary color values (use design tokens)
- Apply styles with inline style objects
- Ignore responsive design
- Mix spacing scales inconsistently

### API & Webhooks

**✅ DO:**
- Authenticate all webhook requests with HMAC
- Return appropriate HTTP status codes
- Log webhook events for debugging
- Handle errors gracefully
- Use proper type definitions for webhook payloads

**❌ DON'T:**
- Skip webhook authentication
- Return generic error messages
- Ignore webhook errors silently
- Commit webhook secrets to git
- Process webhooks without validation

### Performance

**✅ DO:**
- Memoize expensive calculations with `useMemo`
- Memoize callbacks with `useCallback` when needed
- Use proper dependency arrays in useEffect
- Lazy load components when appropriate
- Optimize list rendering with keys

**❌ DON'T:**
- Overuse memoization for simple operations
- Forget dependency arrays in hooks
- Use index as key in dynamic lists
- Create unnecessary re-renders
- Fetch data in render functions

### Security

**✅ DO:**
- Validate all user inputs
- Use environment variables for secrets
- Implement CSRF protection for forms
- Sanitize data before display
- Use timing-safe comparisons for secrets

**❌ DON'T:**
- Commit secrets to version control
- Trust user input without validation
- Expose API keys in client code
- Use weak comparison for security checks
- Skip authentication on API routes

### Code Organization

**✅ DO:**
- Keep files focused and reasonably sized
- Use meaningful file and function names
- Group related functionality together
- Export only what's needed
- Document complex logic with comments

**❌ DON'T:**
- Create massive files with multiple responsibilities
- Use cryptic variable names
- Mix unrelated functionality
- Export everything from a module
- Write code without any comments

### Git & Version Control

**✅ DO:**
- Write descriptive commit messages
- Keep commits focused and atomic
- Use `.gitignore` for build artifacts and secrets
- Review changes before committing
- Keep branches up to date

**❌ DON'T:**
- Commit `node_modules/` or `build/`
- Commit `.env` files with secrets
- Make large unfocused commits
- Push broken code to main branch
- Ignore merge conflicts

---

## Summary Checklist for AI Agents

When working with this codebase, ensure you:

- [ ] Use TypeScript with explicit types for all props and state
- [ ] Follow the component structure pattern (imports → types → component → export)
- [ ] Use named function exports: `export default function Component()`
- [ ] Apply Tailwind utilities and semantic color tokens
- [ ] Use the `cn()` utility for className merging
- [ ] Implement proper loading, error, and empty states
- [ ] Use React Context for global state (auth, client, tenant)
- [ ] Follow the webhook handler pattern for API routes
- [ ] Authenticate webhooks with HMAC validation
- [ ] Use optional chaining and nullish coalescing
- [ ] Keep components focused and single-purpose
- [ ] Use Radix UI primitives with Tailwind styling
- [ ] Handle async operations with proper error handling
- [ ] Use the Omneo SDK client from context
- [ ] Follow the established file and folder structure
- [ ] Write responsive, mobile-first layouts
- [ ] Use Lucide React for icons
- [ ] Include proper TypeScript types from imports
- [ ] Test changes in both direct browser and Omneo platform
- [ ] Never commit secrets or environment variables

---

## Additional Resources

### Omneo SDK Documentation
- API Reference: https://docs.getomneo.com/api
- SDK Documentation: https://github.com/omneo/omneo-sdk

### React Router v7
- Documentation: https://reactrouter.com/
- Migration Guide: https://reactrouter.com/upgrading

### Tailwind CSS
- Documentation: https://tailwindcss.com/docs
- Customization: https://tailwindcss.com/docs/configuration

### Radix UI
- Documentation: https://www.radix-ui.com/
- Primitives: https://www.radix-ui.com/primitives

### TypeScript
- Documentation: https://www.typescriptlang.org/docs/
- React TypeScript Cheatsheet: https://react-typescript-cheatsheet.netlify.app/

---

*This document is maintained to help AI agents understand and work effectively with the Omneo App Starter codebase. Keep it updated as patterns and practices evolve.*
