import { Omneo, type Location, type Profile } from '@omneo/omneo-sdk';

export interface ClientelingContext {
  type: 'OMNEO_CLIENTELING_CONTEXT';
  timestamp: number;
  profile: Profile | null;
  staff: {
    current: Profile | null;
    store: any | null;
  };
  location: Location | null;
  environment: {
    tenant: string | null;
    subdomain: string | null;
  };
  authentication: {
    token: string | null;
    user: any | null;
    expiry: number | null;
  };
}

export interface TokenValidationResult {
  isValid: boolean;
  error?: string;
  data?: any;
  client?: Omneo;
}


export function setupClientelingContextListener(
  onValidation?: (result: TokenValidationResult, context: ClientelingContext) => void
): () => void {
  const messageHandler = async (event: MessageEvent) => {
    // Only process messages from parent window
    if (event.source !== window.parent) {
      return;
    }

    const message = event.data;

    // Check if this is a clienteling context message
    if (message && message.type === 'OMNEO_CLIENTELING_CONTEXT') {
      let context: ClientelingContext;
      
      // Handle both old format (with data wrapper) and new format (flattened)
      if (message.data && typeof message.data === 'object') {
        // Old format - transform to new format
        context = {
          type: message.type,
          timestamp: message.timestamp,
          profile: message.data.profile,
          staff: message.data.staff,
          location: message.data.location,
          environment: message.data.environment,
          authentication: message.data.authentication,
        };
      } else {
        // New format - use as is
        context = message as ClientelingContext;
      }
      
      console.log('Received clienteling context:', context);

      // Extract authentication details
      const { token } = context.authentication;
      const { tenant } = context.environment;

      if (token && tenant) {
        // In development, use proxy to avoid CORS issues
        let baseURL: string | undefined;
        
        baseURL = `https://api.${tenant}.getomneo.com`
        
        const client = new Omneo({ token, tenant })
        
        // Validate the token
        const validationResult = await client.auth.verifyToken().then((response) => {
            return { 
              isValid: response.status === 200,
              client: response.status === 200 ? client : undefined
            }
        })
        
        console.log('Token validation result:', validationResult);

        // Call the callback if provided
        if (onValidation) {
          onValidation(validationResult, context);
        }
      } else {
        console.warn('Missing required authentication or environment data');
        if (onValidation) {
          onValidation({
            isValid: false,
            error: 'Missing required authentication data (token and tenant required)'
          }, context);
        }
      }
    }
  };

  // Add event listener
  window.addEventListener('message', messageHandler);

  // Return cleanup function
  return () => {
    window.removeEventListener('message', messageHandler);
  };
}