import { Omneo } from "@omneo/omneo-sdk";
import readline from "readline";

export abstract class OmneoBaseManager {
  protected omneoClient: Omneo | null = null;

  // Cache Omneo client to avoid recreating it
  protected getOmneoClient(): Omneo | null {
    const omneoToken = process.env.OMNEO_TOKEN;
    const omneoTenant = process.env.OMNEO_TENANT;
    
    if (!omneoToken || !omneoTenant) {
      console.log('❌ Missing OMNEO_TOKEN or OMNEO_TENANT environment variables.');
      return null;
    }

    if (!this.omneoClient) {
      this.omneoClient = new Omneo({ token: omneoToken, tenant: omneoTenant });
    }
    
    return this.omneoClient;
  }

  // Helper function with timeout for operations
  protected async withTimeout<T>(promise: Promise<T>, timeoutMs: number = 30000): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
      )
    ]);
  }

  // Helper function for prompting user input
  protected askQuestion(rl: readline.Interface, question: string): Promise<string> {
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }
}
