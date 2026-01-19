import { type Plugin } from "vite";
import { displayOmneoAsciiArt } from "./utils/display";
import { ConfigManager } from "./utils/config-manager";
import { startNgrokTunnel, closeNgrokTunnel } from "./utils/ngrok-tunnel";
import { OmneoWebhookManager } from "./utils/omneo-webhooks";
import { OmneoClientelingManager } from "./utils/clienteling-apps";
import { isDevelopmentMode, getServerPort } from "./utils/common";

// Combined Omneo Development Environment Plugin
export function omneoDevEnvironment(): Plugin {
  // State management
  let listener: any = null;
  let tunnelUrl: string | null = null;
  let hasDisplayedArt = false;
  let isSetupComplete = false;

  // Utility instances
  const configManager = new ConfigManager();
  const webhookManager = new OmneoWebhookManager();
  const clientelingManager = new OmneoClientelingManager();

  return {
    name: 'omneo-dev-environment',
    async configureServer(server) {
      // Only run in development mode
      if (!isDevelopmentMode(server.config.command)) {
        console.log('🚫 Omneo development environment disabled in production mode');
        return;
      }

      // Display ASCII art once when the server is configured
      if (!hasDisplayedArt) {
        displayOmneoAsciiArt();
        hasDisplayedArt = true;
      }

      // Load existing config
      configManager.loadConfig();

      const originalListen = server.listen.bind(server);
      
      server.listen = async (port?: number, isRestart?: boolean) => {
        const result = await originalListen(port, isRestart);
        
        // Get the actual port the server is running on
        const address = server.httpServer?.address();
        const devServerPort = getServerPort(address);
        
        // Start the tunnel and then handle omneo management
        setTimeout(async () => {
          await startTunnelAndSetupOmneo(devServerPort);
        }, 1000);
        
        return result;
      };
    },
    async buildEnd() {
      // Clean up tunnel on build end
      await closeNgrokTunnel(listener);
      listener = null;
    }
  };

  async function startTunnelAndSetupOmneo(port: number): Promise<void> {
    try {
      // Start ngrok tunnel
      const tunnelResult = await startNgrokTunnel(port);
      
      if (!tunnelResult.success) {
        return;
      }

      tunnelUrl = tunnelResult.url;
      listener = tunnelResult.listener;

      // Now that tunnel is established, handle omneo management
      await initializeWebhooks();
      
      // Only show tunnel ready messages AFTER omneo management is complete
      console.log(`\n✅ Tunnel ready: \x1b[32m\x1b[1m${tunnelUrl}\x1b[0m`);

    } catch (error) {
      console.log('❌ Failed to setup development environment:', error);
    }
  }

  async function initializeWebhooks(): Promise<void> {
    if (isSetupComplete) return;
    isSetupComplete = true;

    console.log('\n🔗 Omneo Webhook Management');
    
    const config = configManager.getConfig();
    
    // Check if webhooks are already configured
    if (configManager.validateConfig(config)) {
      const webhookCount = Object.keys(config.webhooks || {}).length;
      if (webhookCount > 0) {
        console.log('✅ Webhooks already configured');
        console.log(`📊 Found ${webhookCount} configured webhook events`);
        await webhookManager.syncWebhooks(config, tunnelUrl!);
      } else {
        console.log('⏭️  No webhooks configured');
      }
      
      // Check if clienteling config exists, if not prompt for setup
      let updatedConfig = config;
      if (!clientelingManager.hasClientelingConfig(config)) {
        console.log('\n📱 No clienteling configuration found');
        updatedConfig = await clientelingManager.setupClientelingApp(config);
        configManager.saveConfig(updatedConfig);
      }
      
      // After webhook sync, handle clienteling apps
      await clientelingManager.syncClientelingApps(updatedConfig);
      return;
    }

    // First time setup
    console.log('🆕 First time setup - configuring webhooks...');
    try {
      let newConfig = await webhookManager.setupWebhooks(tunnelUrl!);
      
      // After webhook setup, offer clienteling app setup
      newConfig = await clientelingManager.setupClientelingApp(newConfig);
      
      configManager.saveConfig(newConfig);
      await webhookManager.syncWebhooks(newConfig, tunnelUrl!);
      
      // Sync clienteling apps if any were configured
      await clientelingManager.syncClientelingApps(newConfig);
    } catch (error) {
      console.log('❌ Failed to setup webhooks:', error);
    }
  }
}
