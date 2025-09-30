import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router"
import { createHmac, timingSafeEqual } from "crypto"

// Used to authenticate all inbound omneo webhooks
export async function authOmneoWebhook ({ request, params }: LoaderFunctionArgs | ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return Promise.reject({ message: 'Invalid Method', status: 405 })
  }
  
  const signature = request.headers.get('x-omneo-hmac-sha256')
  const omneoSecret = process.env.OMNEO_SECRET

  // Validate required parameters
  if (!signature || !omneoSecret) {
    return Promise.reject({ message: 'Invalid Omneo Webhook', status: 422 })
  }

  try {
    // Read the raw body directly (no need to clone)
    const clonedRequest = request.clone()
    const rawBody = await clonedRequest.text()
    
    // Generate expected hash
    const expectedHash = createHmac('sha256', omneoSecret)
      .update(rawBody, 'utf8')
      .digest('hex')

    // Use timing-safe comparison to prevent timing attacks
    const signatureBuffer = Buffer.from(signature, 'hex')
    const expectedBuffer = Buffer.from(expectedHash, 'hex')

    if (signatureBuffer.length !== expectedBuffer.length || 
        !timingSafeEqual(signatureBuffer, expectedBuffer)) {
      return Promise.reject({ message: 'Authentication failed', status: 401 })
    }

    return Promise.resolve()
  } catch (err) {
    // Log error for debugging but don't expose details
    console.error('Webhook authentication error:', err)
    return Promise.reject({ message: 'Authentication failed', status: 401 })
  }
}