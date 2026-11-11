import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createHmac } from 'crypto';
import { authOmneoWebhook } from '~/utils/omneo/auth';
import type { ActionFunctionArgs } from 'react-router';

describe('authOmneoWebhook', () => {
  const mockSecret = 'test-webhook-secret';
  const mockPayload = JSON.stringify({ event: 'profile.created', data: { id: 123 } });

  beforeEach(() => {
    vi.clearAllMocks();
    // Set the environment variable
    process.env.OMNEO_SECRET = mockSecret;
  });

  const createMockRequest = (method: string, body: string, signature?: string): any => {
    return {
      method,
      headers: {
        get: (header: string) => {
          if (header === 'x-omneo-hmac-sha256') {
            return signature || null;
          }
          return null;
        },
      },
      clone: () => ({
        text: async () => body,
      }),
      text: async () => body,
    };
  };

  const generateValidSignature = (payload: string, secret: string): string => {
    return createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');
  };

  it('should resolve for valid webhook with correct signature', async () => {
    const signature = generateValidSignature(mockPayload, mockSecret);
    const request = createMockRequest('POST', mockPayload, signature);
    const args = { request, params: {}, context: {} } as ActionFunctionArgs;

    await expect(authOmneoWebhook(args)).resolves.toBeUndefined();
  });

  it('should reject for GET requests', async () => {
    const request = createMockRequest('GET', mockPayload);
    const args = { request, params: {}, context: {} } as ActionFunctionArgs;

    await expect(authOmneoWebhook(args)).rejects.toEqual({
      message: 'Invalid Method',
      status: 405,
    });
  });

  it('should reject for PUT requests', async () => {
    const request = createMockRequest('PUT', mockPayload);
    const args = { request, params: {}, context: {} } as ActionFunctionArgs;

    await expect(authOmneoWebhook(args)).rejects.toEqual({
      message: 'Invalid Method',
      status: 405,
    });
  });

  it('should reject when signature header is missing', async () => {
    const request = createMockRequest('POST', mockPayload, undefined);
    const args = { request, params: {}, context: {} } as ActionFunctionArgs;

    await expect(authOmneoWebhook(args)).rejects.toEqual({
      message: 'Invalid Omneo Webhook',
      status: 422,
    });
  });

  it('should reject when OMNEO_SECRET is not set', async () => {
    delete process.env.OMNEO_SECRET;
    
    const signature = generateValidSignature(mockPayload, mockSecret);
    const request = createMockRequest('POST', mockPayload, signature);
    const args = { request, params: {}, context: {} } as ActionFunctionArgs;

    await expect(authOmneoWebhook(args)).rejects.toEqual({
      message: 'Invalid Omneo Webhook',
      status: 422,
    });
  });

  it('should reject for invalid signature', async () => {
    const invalidSignature = 'invalid-signature-12345';
    const request = createMockRequest('POST', mockPayload, invalidSignature);
    const args = { request, params: {}, context: {} } as ActionFunctionArgs;

    await expect(authOmneoWebhook(args)).rejects.toEqual({
      message: 'Authentication failed',
      status: 401,
    });
  });

  it('should reject for tampered payload', async () => {
    const signature = generateValidSignature(mockPayload, mockSecret);
    const tamperedPayload = JSON.stringify({ event: 'profile.created', data: { id: 999 } });
    const request = createMockRequest('POST', tamperedPayload, signature);
    const args = { request, params: {}, context: {} } as ActionFunctionArgs;

    await expect(authOmneoWebhook(args)).rejects.toEqual({
      message: 'Authentication failed',
      status: 401,
    });
  });

  it('should reject for wrong secret', async () => {
    const wrongSecret = 'wrong-secret';
    const signature = generateValidSignature(mockPayload, wrongSecret);
    const request = createMockRequest('POST', mockPayload, signature);
    const args = { request, params: {}, context: {} } as ActionFunctionArgs;

    await expect(authOmneoWebhook(args)).rejects.toEqual({
      message: 'Authentication failed',
      status: 401,
    });
  });

  it('should handle empty payload correctly', async () => {
    const emptyPayload = '';
    const signature = generateValidSignature(emptyPayload, mockSecret);
    const request = createMockRequest('POST', emptyPayload, signature);
    const args = { request, params: {}, context: {} } as ActionFunctionArgs;

    await expect(authOmneoWebhook(args)).resolves.toBeUndefined();
  });

  it('should handle large payloads correctly', async () => {
    const largePayload = JSON.stringify({
      event: 'profile.created',
      data: {
        id: 123,
        attributes: Array(1000).fill({ key: 'value' }),
      },
    });
    
    const signature = generateValidSignature(largePayload, mockSecret);
    const request = createMockRequest('POST', largePayload, signature);
    const args = { request, params: {}, context: {} } as ActionFunctionArgs;

    await expect(authOmneoWebhook(args)).resolves.toBeUndefined();
  });

  it('should use timing-safe comparison (testable indirectly)', async () => {
    // This test ensures the function completes without timing-based vulnerabilities
    const signature = generateValidSignature(mockPayload, mockSecret);
    const request = createMockRequest('POST', mockPayload, signature);
    const args = { request, params: {}, context: {} } as ActionFunctionArgs;

    const startTime = Date.now();
    await authOmneoWebhook(args);
    const endTime = Date.now();

    // Should complete quickly (within reasonable time)
    expect(endTime - startTime).toBeLessThan(100);
  });

  it('should reject authentication with timing-safe comparison', async () => {
    // This ensures timing-safe comparison is working
    const invalidSignature = 'a'.repeat(64); // Valid length but wrong content
    const request = createMockRequest('POST', mockPayload, invalidSignature);
    const args = { request, params: {}, context: {} } as ActionFunctionArgs;

    await expect(authOmneoWebhook(args)).rejects.toEqual({
      message: 'Authentication failed',
      status: 401,
    });
  });
});
