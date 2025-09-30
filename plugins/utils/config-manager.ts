import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import type { OmneoConfig } from "./webhook-config";

export class ConfigManager {
  private configPath: string;
  private config: OmneoConfig = {};

  constructor() {
    this.configPath = join(process.cwd(), 'omneo.config.json');
  }

  loadConfig(): OmneoConfig {
    if (existsSync(this.configPath)) {
      try {
        const configData = readFileSync(this.configPath, 'utf-8');
        this.config = JSON.parse(configData);
        console.log('📄 Loaded omneo.config.json configuration');
      } catch (error) {
        console.log('❌ Error loading omneo.config.json:', error);
        this.config = {};
      }
    } else {
      console.log('📄 No omneo.config.json found, will create new configuration');
      this.config = {};
    }
    return this.config;
  }

  saveConfig(config: OmneoConfig): void {
    try {
      config.lastSync = new Date().toISOString();
      writeFileSync(this.configPath, JSON.stringify(config, null, 2));
      console.log('💾 Saved configuration to omneo.config.json');
      this.config = config;
    } catch (error) {
      console.log('❌ Error saving omneo.config.json:', error);
    }
  }

  getConfig(): OmneoConfig {
    return this.config;
  }

  validateConfig(config: OmneoConfig): boolean {
    return !!(
      config.tenant?.trim() &&
      config.namespace?.trim() &&
      config.webhooks &&
      Object.keys(config.webhooks).length > 0
    );
  }
}
