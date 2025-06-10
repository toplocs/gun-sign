import Gun from 'gun' // Using workspace package
import 'gun/sea' // Optional: for user authentication'

/**
 * Client-side message validation
 * This will validate messages before sending them to the server
 */
const validateSignature = (msg: any) => {
    // console.log('in->put:', msg);

    if (!msg.put || typeof msg.put !== 'object') return true;
    const keys = Object.keys(msg.put);
    if (keys.length === 0) return true;
    if (keys[0] === 'message') {
        // This is a message
        console.log('Message skipped', msg);

        return false;
    }
    return true;
}

/**
 * Initialize Gun with our local server and validation hooks
 */
const gun = Gun({
    peers: [
        'http://localhost:8765/gun'  // Our local GunDB server
    ],
    localStorage: true,               // Use localStorage in browser
    radisk: false,                    // Don't use file storage in browser
    multicast: false,                 // Disable multicast discovery
    hooks: {
        in: (msg: any) => {           // Hook for incoming messages
            // Add custom validation here
            return msg;
        },
        out: (msg: any) => {          // Hook for outgoing messages
            // Add custom validation here
            return msg;
        }
    }
});

gun.lookup = async function(key: string, id: string) {
  console.log(key, id);
  const ref = await gun.get(key).get(id).then();
  console.log(ref);
  const soul = ref?._?.['>'] && Object.keys(ref._['>'])[0];
  if (!soul) return null;
  const data = await gun.get(soul).then();

  return data ? { id, ...data } : null;
}

export default gun;
