import { Omneo } from "@omneo/omneo-sdk";
import readline from "readline";
import type { OmneoConfig, ClientelingApp } from "./webhook-config";
import { SYNC_SYMBOL } from "./display";
import { OmneoBaseManager } from "./omneo-base";

export interface AppSyncResult {
  status: 'created' | 'updated' | 'skipped' | 'error';
  appHandle: string;
  result?: any;
  error?: any;
}

export class OmneoClientelingManager extends OmneoBaseManager {
  // Check if clienteling configuration exists
  hasClientelingConfig(config: OmneoConfig): boolean {
    return !!(config.clienteling && typeof config.clienteling.enabled !== 'undefined');
  }

  async setupClientelingApp(config: OmneoConfig): Promise<OmneoConfig> {
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
      console.log('\n📱 Clienteling Embedded App Setup');
      
      const installApp = await this.askQuestion(rl, '❓ Would you like to install a clienteling embedded app? (y/n): ');
      
      if (installApp.toLowerCase() !== 'y' && installApp.toLowerCase() !== 'yes') {
        console.log('⏭️  Skipping clienteling app installation');
        console.log('🔒 Clienteling functionality disabled in configuration');
        // Set clienteling to disabled in config
        config.clienteling = {
          apps: [],
          enabled: false
        };
        cleanup();
        return config;
      }

      // Get app configuration from user
      const buttonLabel = await this.askQuestion(rl, '🏷️  Enter button text (default: My App): ') || 'My App';
      const title = await this.askQuestion(rl, '📝 Enter app title (default: My Omneo App): ') || 'My Omneo App';
      
      // Ask user for app handle
      let appHandle = '';
      while (!appHandle.trim()) {
        appHandle = await this.askQuestion(rl, '�️  Enter app handle: ');
        if (!appHandle.trim()) {
          console.log('❌ App handle cannot be empty. Please try again.');
        }
      }

      // Create app configuration
      const newApp: ClientelingApp = {
        handle: appHandle,
        development: false,
        enabled: true,
        fullscreen: true,
        button: {
          label: buttonLabel
        },
        title: title,
        clienteling: {
          url: "http://localhost:5173/clienteling"
        },
        settings: []
      };

      // Add to config
      if (!config.clienteling) {
        config.clienteling = { apps: [], enabled: true };
      }
      
      config.clienteling.enabled = true;
      config.clienteling.apps.push(newApp);

      console.log(`✅ Clienteling app configured: ${title}`);
      console.log(`�️  App handle: ${appHandle}`);
      
      cleanup();
      return config;

    } catch (error) {
      console.log('❌ Error setting up clienteling app:', error);
      cleanup();
      return config;
    }
  }

  async syncClientelingApps(config: OmneoConfig): Promise<void> {
    // Check if clienteling is disabled
    if (config.clienteling?.enabled === false) {
      console.log('⏭️  Clienteling is disabled in configuration');
      return;
    }

    if (!config.clienteling?.apps || config.clienteling.apps.length === 0) {
      console.log('⏭️  No clienteling apps to sync');
      return;
    }

    console.log(`${SYNC_SYMBOL} Syncing ${config.clienteling.apps.length} clienteling app(s) with Omneo API...`);
    
    const client = this.getOmneoClient();
    if (!client) {
      return;
    }

    try {
      // Note: Adjust the API endpoint based on actual Omneo SDK capabilities
      // This is a placeholder for the actual API call structure
      const existingApps = await this.getExistingApps(client);

      const appPromises = config.clienteling.apps.map(async (app) => {
        return this.processApp(client, app, existingApps);
      });

      const results = await Promise.allSettled(appPromises);
      const processed = results.map(result => 
        result.status === 'fulfilled' ? result.value : { 
          status: 'error' as const, 
          appHandle: 'unknown', 
          error: result.reason 
        }
      );
      
      const summary = processed.reduce((acc, result) => {
        acc[result.status] = (acc[result.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      this.displayAppSummary(summary);
      
    } catch (error) {
      console.log('❌ Error syncing clienteling apps:', error);
    }
  }

  private async getExistingApps(client: Omneo): Promise<any[]> {
    try {
      console.log('📋 Fetching existing clienteling apps from Omneo...');
      const response = await client.call({ 
        method: 'GET', 
        endpoint: "/tenants/custom-fields?filter[namespace]=clienteling.setting" 
      });
      
      const apps = response.data || [];
      console.log(`📊 Found ${apps.length} existing clienteling settings`);
      return apps;
    } catch (error) {
      console.log('⚠️  Could not fetch existing apps:', error);
      return [];
    }
  }

  private async processApp(
    client: Omneo, 
    app: ClientelingApp, 
    existingApps: any[]
  ): Promise<AppSyncResult> {
    try {
      // Use the app handle directly (it's already the handle)
      const appHandle = `app__${app.handle}`;
      console.log(`🔍 Looking for existing app with handle: ${appHandle}`);
      
      const existingApp = existingApps.find((existing) => 
        existing.handle === appHandle
      );

      if (existingApp) {
        console.log(`📍 Found existing app: ${existingApp.name} (Handle: ${existingApp.handle})`);
        // Check if app needs updating by comparing key properties
        const needsUpdate = this.appNeedsUpdate(existingApp, app);
        
        if (needsUpdate) {
          console.log(`${SYNC_SYMBOL} Updating clienteling app: ${app.title}`);
          const result = await this.withTimeout(
            this.updateApp(client, existingApp.handle, app)
          );
          return { status: 'updated', appHandle: app.handle, result };
        } else {
          console.log(`⏭️  App "${app.title}" is up to date, skipping`);
          return { status: 'skipped', appHandle: app.handle, result: null };
        }
      } else {
        console.log(`➕ Creating clienteling app: ${app.title}`);
        const result = await this.withTimeout(
          this.createApp(client, app)
        );
        return { status: 'created', appHandle: app.handle, result };
      }
    } catch (error) {
      console.log(`❌ Failed to process app ${app.title}:`, error);
      return { status: 'error', appHandle: app.handle, error };
    }
  }

  private appNeedsUpdate(existingApp: any, newApp: ClientelingApp): boolean {
    const existingValue = existingApp.value || {};
    return (
      existingValue.title !== newApp.title ||
      existingValue.button?.label !== newApp.button.label ||
      existingValue.clienteling?.url !== newApp.clienteling.url ||
      existingValue.enabled !== newApp.enabled ||
      existingValue.fullscreen !== newApp.fullscreen ||
      existingValue.development !== newApp.development
    );
  }

  private async createApp(client: Omneo, app: ClientelingApp): Promise<any> {
    const body = {
      name: app.title,
      handle: `app__${app.handle}`,
      namespace: "clienteling.setting",
      value: {
        development: app.development,
        enabled: app.enabled,
        fullscreen: app.fullscreen,
        button: {
          label: app.button.label
        },
        title: app.title,
        clienteling: {
          url: app.clienteling.url
        },
        settings: app.settings
      },
      type: "json"
    };

    return client.call({ 
      method: 'POST', 
      endpoint: "/tenants/custom-fields", 
      body 
    });
  }

  private async updateApp(client: Omneo, appId: string, app: ClientelingApp): Promise<any> {
    const body = {
      name: app.title,
      handle: `app__${app.handle}`,
      namespace: "clienteling.setting",
      value: {
        development: app.development,
        enabled: app.enabled,
        fullscreen: app.fullscreen,
        button: {
          label: app.button.label
        },
        title: app.title,
        clienteling: {
          url: app.clienteling.url
        },
        settings: app.settings
      },
      type: "json"
    };

    console.log("APP ID", appId)
    return client.call({ 
      method: 'PUT', 
      endpoint: `/tenants/custom-fields/clienteling.setting:${appId}`, 
      body 
    });
  }

  private displayAppSummary(summary: Record<string, number>): void {
    console.log('\n📱 Clienteling App Sync Summary:');
    if (summary.created) console.log(`  ✅ Created: ${summary.created} app(s)`);
    if (summary.updated) console.log(`  🔄 Updated: ${summary.updated} app(s)`);
    if (summary.skipped) console.log(`  ⏭️  Skipped: ${summary.skipped} app(s) (no changes needed)`);
    if (summary.error) console.log(`  ❌ Errors: ${summary.error} app(s)`);
    console.log('');
  }
}
