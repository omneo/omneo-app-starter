# Omneo Clienteling App Template

A production-ready React Router template for building Omneo-powered clienteling applications with real-time webhook integration and customer profile management.

## 🚀 Quick Start (5 Minutes)

Get your Omneo clienteling app running in just a few steps:

### Step 1: Clone and Install

```bash
git clone <your-repo>
cd omneo-app-starter
npm install
```

### Step 2: Set Up Your API Token

Create a `.env` file in the root directory:

```bash
# .env
OMNEO_TENANT=your-tenant-name
OMNEO_API_TOKEN=your-api-token
```

Get your API token from the Omneo admin dashboard at Settings → API Tokens.

### Step 3: Run the Setup Wizard

Start the development server - it will automatically run a first-time setup wizard:

```bash
npm run dev
```

The setup wizard will guide you through:

1. **Tenant Configuration** - Confirms your Omneo tenant settings
2. **Webhook Setup** - Asks which webhook events you want to enable (profile.created, profile.updated, etc.)
3. **Clienteling App Registration** - Interactive prompts:
   - "Would you like to install a clienteling embedded app?" → Enter `y`
   - "Enter button text" → e.g., `My App` (the label users will see)
   - "Enter app title" → e.g., `My Omneo App` (displayed in the interface)
   - "Enter app handle" → e.g., `my-demo-app` (unique identifier)

### Step 4: Configuration Created

After the wizard completes, you'll have:

✅ `omneo.config.json` - Your app configuration  
✅ Ngrok tunnel running (for local webhook testing)  
✅ App registered in Omneo clienteling  
✅ Webhooks configured and active

Your terminal will display:
```
✅ Tunnel ready: https://your-unique-id.ngrok.io
✅ Webhooks already configured
📊 Found X configured webhook events
✅ Clienteling app configured: My Omneo App
```

### Step 5: View Your App in Omneo

1. Open your Omneo admin dashboard
2. Navigate to Clienteling
3. Look for your app button (labeled with your `button.label`)
4. Click it to see your app embedded in the Omneo interface!

Your app is now running at:
- **Local Development:** `http://localhost:5173/clienteling` (for direct browser testing)
- **Public URL (via ngrok):** `https://your-id.ngrok.io/clienteling` (automatically set in Omneo)
- **In Omneo Platform:** Accessible at `/apps/your-app-handle`

> **⚠️ Important: CORS and Testing**
> 
> Due to browser CORS security policies, the Omneo clienteling platform **cannot load apps from localhost**. When you test your app within the Omneo interface at `https://sandbox.clienteling.getomneo.com`, the browser blocks requests to `http://localhost` for security reasons.
> 
> **The ngrok tunnel solves this automatically:**
> - Your code still runs locally on your machine
> - The ngrok URL provides a public HTTPS endpoint
> - The development server automatically updates your app configuration to use the ngrok URL
> - No manual configuration needed - just refresh the Omneo interface after starting `npm run dev`
> 
> **Testing options:**
> - ✅ **Within Omneo:** Use the app embedded in the clienteling interface (uses ngrok URL automatically)
> - ✅ **Direct browser:** Visit `http://localhost:5173/clienteling` for local testing outside Omneo
> - ✅ **Ngrok URL:** Visit `https://your-id.ngrok.io/clienteling` to test the public endpoint

### What Happens Automatically?

When you run `npm run dev` for the first time:

1. **Ngrok Tunnel** - Creates a public HTTPS URL for your local server (required for Omneo integration)
2. **App Registration** - Creates a custom field in Omneo with handle `app__your-handle`
3. **URL Configuration** - Automatically replaces localhost URLs with the ngrok URL in your app settings
4. **Webhook Registration** - Registers webhook endpoints with your tenant
5. **Config Sync** - Saves all settings to `omneo.config.json`

On subsequent runs, the dev server:
- Detects existing configuration
- Generates a new ngrok URL (URL changes each restart)
- **Automatically updates your app URL** in Omneo to the new ngrok address
- Syncs any configuration changes you've made
- Skips unchanged settings

> **💡 Tip:** The console output shows when localhost URLs are replaced:
> ```
> 🔄 Replacing localhost URL: http://localhost:5173/clienteling → https://abc123.ngrok.io/clienteling
> ```

### Next Steps

- Edit `app/routes/clienteling/index.tsx` to customize your app UI
- Add webhook handlers in `app/routes/api/$tenant.webhooks.omneo/events/`
- Modify `omneo.config.json` to enable/disable webhooks
- Add blocks to the `settings` array for modular components

---

## Features

- 🚀 **Server-side rendering** with React Router v7
- ⚡️ **Hot Module Replacement (HMR)** for fast development
- 🎯 **Omneo SDK Integration** for customer data management
- � **Real-time Webhook Handling** for profile events
- 🔒 **TypeScript by default** with full type safety
- � **Tailwind CSS** with Radix UI components
- 🌐 **Ngrok Integration** for local webhook testing
- � **Customer Analytics Dashboard** with aggregations
- 🛡️ **Authentication Context** with Omneo profile management
- 📋 **Structured Logging** with Google Cloud integration
- 🔐 **Server-side token check** on every API route (`requireClientelingAuth`)
- 🧪 **Vitest** with React Testing Library, and a CI workflow for pull requests

## Architecture

This template provides a complete clienteling application structure:

```
app/
├── components/          # Reusable UI components
│   └── ui/             # Radix UI component library
├── contexts/           # React contexts for state management
│   └── auth/           # Omneo authentication and profile context
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── routes/             # Application routes
│   ├── clienteling.tsx # Main clienteling dashboard
│   └── api/            # API routes for webhooks
└── utils/              # Helper utilities

plugins/                # Vite plugins for development
└── omneo-dev-environment.ts # Automated Omneo setup
```

## Detailed Setup Guide

Already completed the Quick Start? This section provides additional details about the installation process.

### Prerequisites

- Node.js 26 (see `engines` in package.json; `nvm install 26`)
- npm or yarn
- Omneo account with API access

### Manual Configuration

If you prefer to configure manually instead of using the setup wizard:

1. **Clone and install dependencies:**

```bash
git clone <your-repo>
cd omneo-app-starter
npm install
```

2. **Configure Omneo settings:**

Edit `omneo.config.json` to match your Omneo tenant:

```json
{
  "tenant": "your-tenant-name",
  "namespace": "your-app-namespace",
  "webhooks": {
    "profile.created": true,
    "profile.updated": true,
    // ... other webhook events
  }
}
```

### Development

Start the development server:

```bash
npm run dev
```

The development environment automatically:
- 🌐 Creates an ngrok tunnel for webhook testing
- 🔗 Registers webhooks with your Omneo tenant
- 📊 Displays connection status and tunnel URL
- 🔄 Hot reloads on code changes

Your application will be available at `http://localhost:5173` with webhook endpoint accessible via the generated ngrok URL.

## Webhook Integration

This template includes a complete webhook system for handling Omneo profile events:

### Supported Events

- `profile.created` - New customer profile creation
- `profile.updated` - Customer profile updates
- `profile.merged` - Profile merge operations
- `profile.deleted` - Profile deletion
- `profile.address.*` - Address management events

### Webhook Route Structure

```typescript
// app/routes/api/$tenant.webhooks.omneo/route.ts
export async function action({ request, params }: ActionFunctionArgs) {
  // Handles incoming webhook events
  // Routes to specific event handlers
}
```

### Event Handlers

Individual event processors in `app/routes/api/$tenant.webhooks.omneo/events/`:

- `profile.created/index.ts`
- `profile.updated/index.ts`
- Additional events as needed

## Authentication & Context

The template provides a comprehensive authentication system:

### AuthContext

```typescript
const { profile, location, isAuthenticated } = useClientelingContext();
const client = useOmneoClient();
```

### Features

- Automatic Omneo client initialization
- Profile and location management
- Authentication state handling
- Type-safe SDK access
- The clienteling context is only accepted from the Omneo host (`*.getomneo.com`), and a
  failed token check shows the error instead of loading forever

### Protecting your API routes

The front-end token check only gates the UI. Anyone can call `/api/*` directly, so every
API route (other than `/api/health` and webhooks) must re-verify the staff token on the server:

```typescript
// app/routes/api/my-route.ts
import { requireClientelingAuth } from '~/lib/clienteling-auth';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const denied = await requireClientelingAuth(request);
  if (denied) return denied;
  // ...
};
```

From the browser, call your routes with `apiFetch` (or `apiJson` for JSON with typed errors)
from `~/lib/api-fetch`. They send the verified staff token in the `x-omneo-token` header.
Verification is cached briefly per token, and a token that verified recently still works
through a short Omneo outage. `/api/me` is a working example, and the dashboard's
"Server check" badge calls it.

`/api/health` is an unauthenticated liveness check for deploy smoke tests and uptime checks.

## UI Components

Built with Radix UI and Tailwind CSS:

- **Cards** - Customer information display
- **Badges** - Status indicators
- **Buttons** - Actions and navigation
- **Alerts** - Status messages
- **Separators** - Content organization

### Usage Example

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';

<Card>
  <CardHeader>
    <CardTitle>Customer Profile</CardTitle>
  </CardHeader>
  <CardContent>
    <Badge variant="secondary">Active</Badge>
  </CardContent>
</Card>
```

## Customer Dashboard

The main clienteling interface includes:

- 📊 **Customer Metrics** - Spending, visits, transactions
- 🛍️ **Transaction History** - Recent purchase activity  
- 📍 **Location Data** - Store and geographic information
- 📈 **Analytics** - Customer behavior insights

## Development Tools

### Omneo Development Plugin

Automatic development environment setup:

- Configures ngrok tunnels
- Registers webhook endpoints
- Manages Omneo tenant connections
- Provides real-time status updates

### Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run typecheck  # Run TypeScript checks
npm test           # Run Vitest in watch mode
npm run test:run   # Run the tests once (what CI runs)
```

## Building for Production

Create a production build:

```bash
npm run build
```

The build outputs to:
```
build/
├── client/    # Static assets and client bundle
└── server/    # Server-side application
```

## Deployment

### Docker Deployment

The Dockerfile builds on `node:26-alpine`. Cloud Run (and most hosts) inject `$PORT`, which
`react-router-serve` honours.

```bash
# Build the Docker image
docker build -t omneo-app-starter .

# Run the container
docker run -p 3000:3000 omneo-app-starter
```

### Platform Deployment

Compatible with:
- AWS ECS/Fargate
- Google Cloud Run
- Azure Container Apps
- Vercel
- Railway
- Fly.io

### Environment Variables

Configure these for production:

```bash
OMNEO_TENANT=your-tenant
OMNEO_TOKEN=your-api-token
OMNEO_SECRET=your-webhook-secret
```

## Configuration

### omneo.config.json

The `omneo.config.json` file is the central configuration for your Omneo integration. It controls tenant settings, webhook subscriptions, and clienteling app registration.

#### Configuration Structure

```json
{
  "tenant": "your-tenant-name",
  "namespace": "your-app-namespace",
  "webhooks": {
    "profile.created": true,
    "profile.updated": true,
    // Enable/disable specific webhook events
  },
  "clienteling": {
    "apps": [
      {
        "handle": "your-app-handle",
        "development": true,
        "enabled": true,
        "fullscreen": true,
        "button": { "label": "My App" },
        "title": "My Omneo App",
        "clienteling": { "url": "http://localhost:5173/clienteling" },
        "settings": []
      }
    ],
    "enabled": true
  }
}
```

#### Configuration Options

**Root Settings:**
- `tenant` - Your Omneo tenant identifier
- `namespace` - Unique namespace for your application (auto-generated if not set)
- `lastSync` - Timestamp of last configuration sync with Omneo

**Webhook Configuration:**
- Enable/disable specific webhook events by setting them to `true`/`false`
- Supported events:
  - `profile.created` - Triggered when a new profile is created
  - `profile.updated` - Triggered when a profile is updated
  - `profile.merged` - Triggered when profiles are merged
  - `profile.deleted` - Triggered when a profile is deleted
  - `profile.address.*` - Address-related events
  - `profile-temporary.created` - Temporary profile creation

**Clienteling App Configuration:**
- `handle` - Unique identifier for your app
- `development` - Set to `true` for development mode (uses local URLs)
- `enabled` - Enable/disable the app in the Omneo clienteling interface
- `fullscreen` - Display app in fullscreen mode
- `button.label` - Label shown on the app button in Omneo
- `title` - App title displayed in the clienteling interface
- `clienteling.url` - URL where your app is hosted (local or production)
- `settings` - Array of configurable settings for your app

**Adding Blocks to Clienteling Apps:**

You can extend your clienteling app by adding blocks to the `settings` array. Blocks allow you to embed additional UI components within the Omneo clienteling interface at specific locations.

Example configuration with a block:

```json
{
  "handle": "your-app-handle",
  "development": true,
  "enabled": true,
  "fullscreen": true,
  "button": {
    "label": "My App"
  },
  "title": "My Omneo App",
  "clienteling": {
    "url": "http://localhost:5173/clienteling"
  },
  "settings": [
    {
      "type": "block",
      "use": "ExternalComponent",
      "settings": {
        "url": "http://localhost:5173/clienteling/block"
      }
    }
  ]
}
```

**Block Configuration Options:**
- `type` - Must be `"block"` to define a block component
- `use` - Component type, typically `"ExternalComponent"` for external URLs
- `settings.url` - The URL where your block component is hosted

**How Blocks Work:**
- Blocks are embedded components that appear within the Omneo clienteling interface
- They can be placed alongside customer profile data and other clienteling features
- The URL should point to a route in your app that renders the block UI
- In development, blocks use your ngrok tunnel URL for local testing
- Multiple blocks can be added to the `settings` array
- Each block is independently loaded and can have its own functionality

**Block Use Cases:**
- Display custom customer insights or analytics
- Show specialized product recommendations
- Add custom action buttons or forms
- Embed third-party integrations
- Create modular dashboard widgets

#### How It Works

1. **Development Environment:**
   - The Omneo dev plugin reads this configuration on startup
   - Creates an ngrok tunnel if `development: true`
   - Registers webhook endpoints with your Omneo tenant
   - Registers your clienteling app in the Omneo admin

2. **Webhook Registration:**
   - Only webhooks set to `true` are registered
   - Webhook URLs are automatically generated using your namespace
   - Webhooks route to `app/routes/api/$tenant.webhooks.omneo/route.ts`

3. **Clienteling Integration:**
   - Apps are registered in the Omneo clienteling interface
   - Development apps use local URLs (with ngrok tunneling)
   - Production apps use deployed URLs
   - App appears as a button in the Omneo admin interface

4. **App Detection & Synchronization:**
   - On dev server startup, the plugin queries Omneo's tenant custom fields API
   - Looks for existing apps using the namespace `clienteling.setting`
   - Matches apps by their handle using the pattern `app__<your-handle>`
   - Compares configuration to detect if updates are needed:
     - Checks if title, button label, URL, or enabled status changed
     - Detects changes in fullscreen or development mode settings
   - Creates new apps or updates existing ones based on detection results
   - Apps are stored as JSON custom fields in the Omneo tenant
   - Displays sync summary showing created, updated, and skipped apps

5. **Configuration Sync:**
   - Changes to `omneo.config.json` are detected on dev server restart
   - Configuration is automatically synced with your Omneo tenant
   - `lastSync` timestamp is updated after successful sync

#### Detection Process Details

When you run `npm run dev`, the following detection flow occurs:

1. **Fetch Existing Apps:**
   ```
   GET /tenants/custom-fields?filter[namespace]=clienteling.setting
   ```
   This retrieves all clienteling apps registered in your tenant.

2. **Match by Handle:**
   - Your app's `handle` from config (e.g., `"omneo-demo-app"`)
   - Gets prefixed to create the lookup key: `app__omneo-demo-app`
   - Plugin searches existing apps for a matching handle
   - The `app__` prefix is a convention used by Omneo's clienteling system to identify embedded apps

3. **App Loading in Omneo Clienteling:**
   - Omneo clienteling searches for apps with the `app__` prefix in tenant custom fields
   - Apps are loaded at the route pattern: `{clientelingurl}/apps/{yourappname}`
   - Example: If your app handle is `omneo-demo-app`, Omneo loads it from:
     ```
     http://localhost:5173/apps/omneo-demo-app
     ```
   - The clienteling interface automatically discovers and renders all apps with the `app__` prefix
   - Each app appears as a button in the Omneo UI based on the `button.label` configuration

4. **Comparison Logic:**
   - If match found: Compares all properties to detect changes
   - If no changes: Skips update (displays "⏭️ Skipped")
   - If changes detected: Updates app (displays "🔄 Updated")
   - If no match: Creates new app (displays "✅ Created")

5. **API Operations:**
   - **Create:** `POST /tenants/custom-fields` with app configuration
   - **Update:** `PUT /tenants/custom-fields/clienteling.setting:<handle>` with new values

This detection system ensures your local configuration stays in sync with Omneo without manual intervention.

#### Setup Instructions

1. **Copy the example configuration:**
   ```bash
   cp omneo.config.json.example omneo.config.json
   ```

2. **Update your tenant settings:**
   - Set your `tenant` name
   - Customize the `namespace` (or let it auto-generate)
   - Update the app `handle` and `title`

3. **Configure webhooks:**
   - Enable only the webhook events your app needs
   - This reduces unnecessary webhook traffic

4. **Start development:**
   ```bash
   npm run dev
   ```
   The plugin will automatically register your configuration with Omneo.

#### Best Practices

- **Keep `omneo.config.json` out of version control** if it contains sensitive data
- Use `omneo.config.json.example` as a template for team members
- Only enable webhooks your application actually uses
- Use descriptive `handle` and `namespace` values for easier identification
- Set `development: false` when deploying to production

### Other Configuration Files

- `components.json` - Shadcn/ui component configuration
- `react-router.config.ts` - React Router configuration
- `vite.config.ts` - Vite build configuration

## SDK Integration

This template uses the official Omneo SDK:

```typescript
import { useOmneoClient } from '~/contexts/auth/authContext';

const client = useOmneoClient();
const aggregations = await client.profiles.aggregations.list(profileId);
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This template is provided as-is for Omneo developers and partners.

---

Built with ❤️ for the Omneo ecosystem using React Router v7.
