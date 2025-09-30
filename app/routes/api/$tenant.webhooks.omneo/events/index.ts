// You can define more omneo webhooks here
import profileCreated from './profile.created'
import profileUpdated from './profile.updated'

const events = {
  'profile.created': profileCreated,
  'profile.updated': profileUpdated
}

export default events
