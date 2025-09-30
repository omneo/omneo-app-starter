// ASCII Art for OMNEO
export function displayOmneoAsciiArt(): void {
  const art = `
\x1b[38;5;217m\x1b[1m
  ██████  ███    ███ ███    ██ ███████  ██████  
 ██    ██ ████  ████ ████   ██ ██      ██    ██ 
 ██    ██ ██ ████ ██ ██ ██  ██ █████   ██    ██ 
 ██    ██ ██  ██  ██ ██  ██ ██ ██      ██    ██ 
  ██████  ██      ██ ██   ████ ███████  ██████  
\x1b[0m\x1b[38;5;181m          app development environment\x1b[0m
`;
  console.log(art);
}

// Salmon colored infinity symbol for sync operations
export const SYNC_SYMBOL = '\x1b[38;5;217m∞\x1b[0m';

// Display webhook sync summary with proper formatting
export function displayWebhookSummary(summary: Record<string, number>): void {
  console.log(`\n📊 Webhook sync summary:`);
  Object.entries(summary).forEach(([status, count]) => {
    const emoji = getStatusEmoji(status);
    console.log(`  ${emoji} ${status}: ${count}`);
  });
}

function getStatusEmoji(status: string): string {
  switch (status) {
    case 'created': return '➕';
    case 'updated': return SYNC_SYMBOL;
    case 'skipped': return '⏭️';
    default: return '❌';
  }
}
