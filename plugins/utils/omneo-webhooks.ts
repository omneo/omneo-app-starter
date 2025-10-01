import { Omneo } from "@omneo/omneo-sdk";
import readline from "readline";
import type { OmneoConfig, WebhookEvent } from "./webhook-config";
import { WEBHOOK_EVENTS } from "./webhook-config";
import { SYNC_SYMBOL, displayWebhookSummary } from "./display";
import { OmneoBaseManager } from "./omneo-base";

export interface WebhookSyncResult {
  status: 'created' | 'updated' | 'skipped' | 'error';
  trigger: string;
  result?: any;
  error?: any;
}

export class OmneoWebhookManager extends OmneoBaseManager {

  async setupWebhooks(tunnelUrl: string): Promise<OmneoConfig> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const cleanup = () => {
      try {
        rl.close();
      } catch (error) {
        // Interface might already be closed, ignore
      }
    };

    try {
      console.log(`🌐 Using ngrok tunnel URL: ${tunnelUrl}`);

      // Get tenant with validation
      let tenant = '';
      while (!tenant.trim()) {
        tenant = await this.askQuestion(rl, '🏢 Enter your Omneo tenant name: ');
        if (!tenant.trim()) {
          console.log('❌ Tenant name cannot be empty. Please try again.');
        }
      }

      // Get namespace (default to app name)
      const defaultNamespace = `omneo-app-starter-${Math.random().toString(36).substring(2, 8)}`
      const namespace = await this.askQuestion(rl, `Enter webhook namespace (default: ${defaultNamespace}): `) || defaultNamespace;

      console.log('\n📋 Available webhook resources:');
      const resources = Object.keys(WEBHOOK_EVENTS) as WebhookEvent[];
      resources.forEach((resource, index) => {
        console.log(`${index + 1}. ${resource} (${WEBHOOK_EVENTS[resource].length} events)`);
      });

      const selectedResources = await this.askQuestion(rl, '\n🎯 Select resources (comma-separated numbers, or "all"): ');
      
      let webhooksToSetup: string[] = [];
      
      if (selectedResources.toLowerCase() === 'all') {
        webhooksToSetup = Object.values(WEBHOOK_EVENTS).flat();
      } else if (selectedResources.trim()) {
        try {
          const indices = selectedResources.split(',').map((n: string) => parseInt(n.trim()) - 1);
          const validIndices = indices.filter((i: number) => !isNaN(i) && i >= 0 && i < resources.length);
          
          if (validIndices.length === 0) {
            throw new Error('No valid resource selections found');
          }
          
          webhooksToSetup = validIndices.flatMap((i: number) => WEBHOOK_EVENTS[resources[i]]);
        } catch (error) {
          console.log('❌ Invalid selection format. Please use comma-separated numbers or "all".');
          throw error;
        }
      } else {
        throw new Error('No resources selected');
      }

      // Configure webhooks
      const webhooks: { [key: string]: boolean } = {};
      webhooksToSetup.forEach(event => {
        webhooks[event] = true; // Just store enabled state
      });

      console.log(`\n✅ Configured ${webhooksToSetup.length} webhooks`);
      
      const config: OmneoConfig = {
        tenant: tenant.trim(),
        namespace: namespace.trim(),
        webhooks
      };

      return config;

    } catch (error) {
      console.log('❌ Setup error:', error);
      throw error;
    } finally {
      cleanup();
    }
  }

  async syncWebhooks(config: OmneoConfig, tunnelUrl: string): Promise<void> {
    if (!tunnelUrl) {
      console.log('❌ Tunnel URL not available, cannot sync webhooks.');
      return;
    }

    const webhookUrl = `${tunnelUrl}/api/${config.tenant}/webhooks/omneo`;
    console.log(`${SYNC_SYMBOL} Syncing webhooks with Omneo API...`);
    
    if (!config.webhooks || !config.tenant) {
      console.log('❌ Missing configuration, cannot sync webhooks.');
      return;
    }

    const client = this.getOmneoClient();
    if (!client) {
      return;
    }

    try {
      console.log('📋 Fetching existing webhooks from Omneo...');
      const existingWebhooks = await client.webhooks.list({ 'filter[namespace]': config.namespace });
      console.log(`📊 Found ${existingWebhooks.data.length} existing webhooks`);

      const enabledWebhooks = Object.entries(config.webhooks).filter(([, enabled]) => enabled);
      console.log(`🎯 Processing ${enabledWebhooks.length} enabled webhooks...`);
      
      const webhookPromises = enabledWebhooks.map(async ([trigger]) => {
        return this.processWebhook(client, trigger, webhookUrl, config.namespace!, existingWebhooks.data);
      });

      const results = await Promise.allSettled(webhookPromises);
      const processed = results.map(result => 
        result.status === 'fulfilled' ? result.value : { status: 'error' as const, trigger: 'unknown', error: result.reason }
      );
      
      const summary = processed.reduce((acc, result) => {
        acc[result.status] = (acc[result.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      displayWebhookSummary(summary);
      
    } catch (error) {
      console.log('❌ Error syncing webhooks:', error);
    }
  }

  private async processWebhook(
    client: Omneo, 
    trigger: string, 
    webhookUrl: string, 
    namespace: string, 
    existingWebhooks: any[]
  ): Promise<WebhookSyncResult> {
    try {
      const existingWebhook = existingWebhooks.find((hook) => 
        hook.trigger === trigger && hook.namespace === namespace
      );

      if (existingWebhook && existingWebhook.url !== webhookUrl) {
        console.log(`${SYNC_SYMBOL} Updating webhook for event: ${trigger}`);
        const result = await this.withTimeout(
          client.webhooks.update(existingWebhook.id, { url: webhookUrl })
        );
        return { status: 'updated', trigger, result };
      } else if (!existingWebhook) {
        console.log(`➕ Creating webhook for event: ${trigger}`);
        const result = await this.withTimeout(
          client.webhooks.create({
            trigger,
            url: webhookUrl,
            namespace,
          })
        );
        return { status: 'created', trigger, result };
      }
      return { status: 'skipped', trigger, result: null };
    } catch (error) {
      console.log(`❌ Failed to process webhook for ${trigger}:`, error);
      return { status: 'error', trigger, error };
    }
  }

}
