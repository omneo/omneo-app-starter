export interface NgrokConfig {
  addr: number;
  region: string;
  authtoken?: string;
  domain?: string;
}

export interface NgrokTunnelResult {
  url: string;
  success: boolean;
  listener?: any;
  error?: string;
}

export async function startNgrokTunnel(port: number): Promise<NgrokTunnelResult> {
  console.log(`\n🌐 Starting ngrok tunnel for localhost:${port}...`);
  
  try {
    // Dynamic import of ngrok (ESM module)
    const ngrok = await import('@ngrok/ngrok');

    // Check for authtoken
    const authtoken = process.env.NGROK_AUTHTOKEN;
    const domain = process.env.VITE_NGROK_DOMAIN;
    if (!authtoken) {
      console.log('⚠️  No NGROK_AUTHTOKEN found in environment variables');
      console.log('💡 To get an authenticated tunnel:');
      console.log('   1. Sign up: https://dashboard.ngrok.com/signup');
      console.log('   2. Get token: https://dashboard.ngrok.com/get-started/your-authtoken');
      console.log('   3. Set token: export NGROK_AUTHTOKEN=your_token_here');
      console.log('   4. Or add to your shell profile (.zshrc, .bashrc)');
      console.log('\n\x1b[38;5;217m∞\x1b[0m Attempting to use ngrok without authentication...');
    }

    // Start ngrok tunnel with explicit configuration
    const tunnelConfig: NgrokConfig = {
      addr: port,
      region: 'au' // Australia region
    };

    // Add authtoken if available
    if (authtoken) {
      tunnelConfig.authtoken = authtoken;
      console.log('🔐 Using authenticated ngrok session');
    }

    if (domain) {
      tunnelConfig.domain = domain;
      console.log(`🔗 Using reserved ngrok domain: ${domain}`);
    }

    const listener = await ngrok.forward(tunnelConfig);
    const url = listener.url();

    if (!url) {
      throw new Error('Failed to get tunnel URL from ngrok');
    }

    return {
      url,
      success: true,
      listener
    };

  } catch (error: any) {
    const errorMessage = error.message || error;
    console.log('❌ Failed to start ngrok tunnel:', errorMessage);
    
    if (errorMessage?.includes('ERR_NGROK_4018') || errorMessage?.includes('authentication')) {
      console.log('\n🔐 Authentication required! Here\'s how to fix this:');
      console.log('   1. Sign up: https://dashboard.ngrok.com/signup');
      console.log('   2. Get your authtoken: https://dashboard.ngrok.com/get-started/your-authtoken');
      console.log('   3. Configure it:');
      console.log('      • Via CLI: ngrok config add-authtoken YOUR_TOKEN');
      console.log('      • Via env var: export NGROK_AUTHTOKEN=YOUR_TOKEN');
      console.log('   4. Restart your dev server');
    } else {
      console.log('💡 Tips:');
      console.log('   • Make sure ngrok is installed: npm install --save-dev @ngrok/ngrok');
      console.log('   • For authenticated tunnels, set NGROK_AUTHTOKEN environment variable');
      console.log('   • Free ngrok accounts have rate limits');
    }

    return {
      url: '',
      success: false,
      error: errorMessage
    };
  }
}

export async function closeNgrokTunnel(listener: any): Promise<void> {
  if (listener) {
    try {
      await listener.close();
      console.log('🔌 Ngrok tunnel closed');
    } catch (error) {
      console.log('❌ Error closing ngrok tunnel:', error);
    }
  }
}
