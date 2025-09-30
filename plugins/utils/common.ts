// Common utility functions

export function isDevelopmentMode(command: string): boolean {
  return process.env.NODE_ENV !== 'production' && command === 'serve';
}

export function getServerPort(address: any): number {
  let devServerPort = 5173; // Default Vite port
  if (address && typeof address === 'object') {
    devServerPort = address.port;
  }
  return devServerPort;
}

export async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
