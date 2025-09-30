const action = async ({ topic, request, tenant }: { topic: string, request: Request, tenant: string }) => {
  console.log(`Processing profile.created event for tenant: ${tenant}`)
  
  // Parse the webhook payload
  const payload = await request.json()
  console.log('Profile created payload:', payload)
  
  // TODO: Implement profile creation logic here
  
  return new Response('OK', { status: 200 })
}

export default action
