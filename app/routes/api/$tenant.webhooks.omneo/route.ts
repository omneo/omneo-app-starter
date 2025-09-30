import type { ActionFunctionArgs } from "react-router";
import { authOmneoWebhook } from "~/utils/omneo/auth";
import events from "./events";

export const action = async (args: ActionFunctionArgs) => {
  const { request, params } = args
  const topic = request.headers.get('x-omneo-event') as keyof typeof events;
  const tenant = params.tenant;
  
  if (!tenant) {
    return new Response("Missing tenant parameter", { status: 400 });
  }
  
  try {
    // Authenticate the webhook
    await authOmneoWebhook(args)
    console.log(`Received Omneo Webhook Event: ${topic}`)

    const webhook = events[topic as keyof typeof events];
    if (!webhook) {
      return new Response("Unknown Webhook Event", { status: 422 });
    }
    
    console.log('Processing Omneo webhook', { topic, tenant })
    return webhook({ request, topic, tenant });
  } catch (error: any) {
    console.log(`Error in webhook ${topic}`, error)
    return new Response(error?.message || 'Internal Server Error', { status: error?.status || 500 });
  }
};
