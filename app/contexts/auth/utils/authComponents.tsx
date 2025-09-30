import React from 'react';
import { LoaderCircle, AlertCircle, Shield, ShieldX } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Alert, AlertDescription } from '~/components/ui/alert';

// Loading component for authentication
export function AuthLoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <LoaderCircle className="h-12 w-12 animate-spin text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">Loading</CardTitle>
          <CardDescription>
            One moment please...
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

// Error component for authentication failures
export function AuthErrorScreen({ error }: { error: string}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-xl text-destructive">Authentication Error</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

// Unauthorized access component for when auth fails
export function UnauthorizedAccessScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ShieldX className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-xl text-destructive">Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              You are not authorized to access this application. Please ensure you are accessing this page through the authorized parent application.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to request context from parent window
export function requestContextFromParent() {
  console.log('Requesting context from parent...');
  if (window.parent !== window) {
    window.parent.postMessage({ type: 'REQUEST_CLIENTELING_CONTEXT' }, '*');
  }
}

// Helper function to create timeout error message
export function createTimeoutError(): string {
  return 'No authentication context received from parent. This app must be loaded within an authorized iframe.';
}
