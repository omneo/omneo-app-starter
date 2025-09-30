# Omneo Clienteling App Template

A production-ready React Router template for building Omneo-powered clienteling applications with real-time webhook integration and customer profile management.

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

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Omneo account with API access

### Installation

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
OMNEO_API_TOKEN=your-api-token
OMNEO_WEBHOOK_SECRET=your-webhook-secret
```

## Configuration Files

- `omneo.config.json` - Omneo tenant and webhook settings
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
