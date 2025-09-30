import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Omneo } from '@omneo/omneo-sdk';
import { 
  setupClientelingContextListener, 
  type ClientelingContext, 
  type TokenValidationResult 
} from '~/contexts/auth/utils';
import { 
  AuthLoadingScreen, 
  AuthErrorScreen, 
  UnauthorizedAccessScreen,
  requestContextFromParent,
  createTimeoutError
} from './utils/authComponents';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  context: ClientelingContext | null;
  validationResult: TokenValidationResult | null;
  error: string | null;
  client: Omneo | null;
}

export interface AuthContextType extends AuthState {
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    context: null,
    validationResult: null,
    error: null,
    client: null,
  });

  // Function to handle authentication
  const handleAuthentication = async (validationResult: TokenValidationResult, context: ClientelingContext) => {
    console.log('Authentication attempt:', { validationResult, context });

    if (validationResult.isValid) {
      // Use the client from validation result if available, otherwise create one
      let client: Omneo | null = validationResult.client || null;
      
      if (!client) {
        const { token } = context.authentication;
        const { tenant } = context.environment;
        
        if (token && tenant) {
          client = new Omneo({ token, tenant });
        }
      }

      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        context,
        validationResult,
        error: null,
        client,
      });
    } else {
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        context,
        validationResult,
        error: validationResult.error || 'Authentication failed',
        client: null,
      });
    }
  };

  // Set up message listener on mount
  useEffect(() => {
    console.log('Setting up auth context listener...');

    // Set up the clienteling context listener
    const cleanup = setupClientelingContextListener(handleAuthentication);

    // Request context from parent window
    const requestContext = () => {
      requestContextFromParent();
    };

    // Request context immediately
    requestContext();

    // Also request context after a short delay in case parent isn't ready
    const timeoutId = setTimeout(requestContext, 1000);

    // Set a timeout to stop loading if no response after reasonable time
    const loadingTimeoutId = setTimeout(() => {
      setAuthState(prev => {
        if (prev.isLoading && !prev.context) {
          return {
            ...prev,
            isLoading: false,
            error: createTimeoutError(),
          };
        }
        return prev;
      });
    }, 5000); // 5 second timeout

    // Cleanup function
    return () => {
      cleanup();
      clearTimeout(timeoutId);
      clearTimeout(loadingTimeoutId);
    };
  }, []);

  const contextValue: AuthContextType = {
    ...authState
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Convenience hook for just checking authentication status
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

// Convenience hook for getting the current context data
// This hook ensures context is always available (non-null)
// Should only be used within AuthGuard where authentication is guaranteed
export function useClientelingContext(): ClientelingContext {
  const { context, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !context) {
    throw new Error('useClientelingContext must be used within AuthGuard after authentication is complete');
  }
  
  return context;
}

// Convenience hook for getting the Omneo client
// This hook ensures client is always available (non-null)
// Should only be used within AuthGuard where authentication is guaranteed
// 
// Example usage:
// const client = useOmneoClient();
// const profiles = await client.profiles.list();
export function useOmneoClient(): Omneo {
  const { client, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !client) {
    throw new Error('useOmneoClient must be used within AuthGuard after authentication is complete');
  }
  
  return client;
}

// Optional hook that returns null if context is not available
// Use this only if you need to handle cases before authentication
export function useOptionalClientelingContext(): ClientelingContext | null {
  const { context } = useAuth();
  return context;
}

// Optional hook that returns null if client is not available
// Use this only if you need to handle cases before authentication
export function useOptionalOmneoClient(): Omneo | null {
  const { client } = useAuth();
  return client;
}

// Auth guard component that handles all authentication states
export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, error } = useAuth();

  // Show loading screen while authentication is in progress
  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  // Show error screen for authentication errors (network issues, etc.)
  if (!isAuthenticated && error) {
    return <AuthErrorScreen error={error} />;
  }

  // Show unauthorized screen when auth fails (invalid token, etc.)
  if (!isAuthenticated) {
    return <UnauthorizedAccessScreen />;
  }

  // User is authenticated, show the protected content
  return <>{children}</>;
}
