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
  /** The host page's query string (for example `locationId`, or an `app`
   * to open), when the host provides it. */
  queryParams?: Record<string, string>;
}

/** Keeps only string values, the way a parsed query string arrives. */
export function normaliseQueryParams(input: unknown): Record<string, string> | undefined {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return undefined;
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (typeof value === 'string') out[key] = value;
    else if (Array.isArray(value) && typeof value[0] === 'string') out[key] = value[0];
  }
  return out;
}

export interface TokenValidationResult {
  isValid: boolean;
  error?: string;
  data?: any;
  client?: Omneo;
}

/**
 * Validates if an origin is from Omneo (any subdomain of getomneo.com)
 */
export function isOmneoOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    return url.hostname === 'getomneo.com' || url.hostname.endsWith('.getomneo.com');
  } catch {
    return false;
  }
}

export function setupClientelingContextListener(
  onValidation?: (result: TokenValidationResult, context: ClientelingContext) => void
): () => void {
  const messageHandler = async (event: MessageEvent) => {
    // Security: Only process messages from parent window
    if (event.source !== window.parent) {
      return;
    }

    // Security: the context carries a staff token, so only accept it from
    // the Omneo clienteling host (*.getomneo.com)
    if (!isOmneoOrigin(event.origin)) {
      console.warn('Ignored message from non-Omneo origin:', event.origin);
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
          queryParams: normaliseQueryParams(message.data.queryParams),
        };
      } else {
        // New format - use as is
        context = { ...(message as ClientelingContext), queryParams: normaliseQueryParams(message.queryParams) };
      }

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
        }).catch((): TokenValidationResult => ({
          isValid: false,
          error: 'Unable to verify your clienteling session'
        }))


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