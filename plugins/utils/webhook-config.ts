// Available webhook events grouped by resource
export const WEBHOOK_EVENTS = {
  profile: [
    "profile.created",
    "profile-temporary.created", 
    "profile.updated",
    "profile.merged",
    "profile.before.update",
    "profile.deleted",
    "profile.address.created",
    "profile.address.updated", 
    "profile.address.deleted"
  ],
  product: [
    "product.created",
    "product.updated",
    "product.deleted"
  ],
  identity: [
    "identity.created"
  ],
  "product-list": [
    "product-list.created",
    "product-list.updated",
    "product-list-item.created",
    "product-list-item.updated",
    "product-list-item.linked",
    "product-list-share.created",
    "product-list-share.deleted"
  ],
  aggregation: [
    "aggregation.updated"
  ],
  interaction: [
    "interaction.created"
  ],
  "profile-attribute": [
    "profile-attribute.updated"
  ],
  reward: [
    "reward.created",
    "reward.updated",
    "reward.deleted"
  ],
  benefit: [
    "benefit.created",
    "benefit.updated",
    "benefit.deleted",
    "benefit.code.allocated",
    "benefit-definition.created",
    "benefit-definition.updated",
    "benefit-definition.deleted"
  ],
  point: [
    "point.created",
    "point.updated",
    "point.deleted"
  ],
  tier: [
    "tier.achieved",
    "tier.lost",
    "tier.maintained",
    "tier.progressed",
    "tier-point.created",
    "tier-point.updated",
    "tier-point.deleted"
  ],
  achievement: [
    "achievement.progressed",
    "achievement.unlocked",
    "achievement.lost"
  ],
  transaction: [
    "transaction.created",
    "transaction.tier-points.issued",
    "transaction.resent",
    "transaction.updated",
    "transaction.received",
    "transaction.sync",
    "transaction.deleted",
    "transaction-item.created",
    "transaction-item.resent",
    "transaction.points.issued"
  ],
  rating: [
    "rating.created",
    "rating.updated"
  ],
  balance: [
    "balance.updated"
  ],
  order: [
    "order.created",
    "order.updated"
  ],
  connection: [
    "connection.created",
    "connection.updated",
    "connection.deleted"
  ],
  location: [
    "location.created",
    "location.updated"
  ],
  region: [
    "region.created",
    "region.updated"
  ],
  address: [
    "address.created",
    "address.updated"
  ]
} as const;

export interface ClientelingApp {
  handle: string;
  development: boolean;
  enabled: boolean;
  fullscreen: boolean;
  button: {
    label: string;
  };
  title: string;
  clienteling: {
    url: string;
  };
  settings: any[];
}

export interface OmneoConfig {
  webhooks?: {
    [event: string]: boolean; // Just store enabled/disabled
  };
  clienteling?: {
    apps: ClientelingApp[];
    enabled?: boolean;
  };
  tenant?: string;
  namespace?: string;
  lastSync?: string; // Add timestamp for last sync
}

export type WebhookEvent = keyof typeof WEBHOOK_EVENTS;
export type WebhookTrigger = typeof WEBHOOK_EVENTS[WebhookEvent][number];
