import { ref, computed, inject, provide, watch, onMounted, onUnmounted } from 'vue';
import gun from '@/gun';
import type { UserCredentials, UserComposable } from '@/types/user';
import type { GunUser as User, GunAck } from '@/types/gun';

export function userProvider() {
  const user = ref<User | null>(null)

  const pubKeys: Record<string, string> = {};

  // Function to find a user's public key by name directly from Gun
  const findPubKey = async (name: string): Promise<string | null> => {
    return new Promise((resolve) => {
      
      if (pubKeys[name]) {
        console.log('cached pub key: ', name, pubKeys[name]);
        resolve(pubKeys[name]);
        return;
      }
      let timeoutId: ReturnType<typeof setTimeout>;
      timeoutId = setTimeout(() => {
        resolve(null);
      }, 1000);

      gun.get(`~@${name}`).once((userRef: any) => {
        if (userRef && userRef._) {
          const soul = userRef._['>'] && Object.keys(userRef._['>'])[0];

          const pub = soul.substring(1);
          console.log('Public key:', pub);
          clearTimeout(timeoutId);
          pubKeys[name] = pub;
          resolve(pub as string);
        } else {
          console.log('User not found');
          clearTimeout(timeoutId);
          resolve(null);
        }
      });
    });
  }

  const register = async (credentials: UserCredentials) => {
    return new Promise<GunAck>(async (resolve, reject) => {
      const username = credentials.name;
      const password = credentials.password;

      const pub = await findPubKey(username)
      if (pub) {
        // User already exists, return existing pub key
        return resolve({pub: pub} as GunAck); 
      }

      gun.user().create(username, password, (ack: GunAck) => {
        if ('err' in ack && ack.err) {
          reject(`Create failed: ${ack.err}`);
        } else {
          // Do
          console.log('User created:', ack.pub);
          gun.get('users').get(username).put(ack.pub);
          resolve(ack);
        }
      });
    });
  }

  const login = async (credentials: UserCredentials) => {
    return new Promise<User>((resolve, reject) => {
      const username = credentials.name;
      const password = credentials.password;

      gun.user().auth(username, password, (ack: GunAck) => {
        if ('err' in ack && ack.err) {
          reject(`Auth failed: ${ack.err}`);
        } else {
          gun.user().once((data: User) => {
            resolve(data);
          });
        }
      });
    });
  }

  const logout = async () => {
    user.value = null;
    gun.user().leave();
  }

  const deleteUser = async () => {
    return new Promise<void>((resolve, reject) => {
      if (!user.value) {
        reject("No user is logged in");
        return;
      }
      
      try {
        const currentUser = user.value;
        
        // We can mark the user as deleted in a "deleted_users" node
        gun.get('deleted_users').get(currentUser.pub).put({
          alias: currentUser.alias,
          deletedAt: Date.now(),
          isDeleted: true
        });
        
        // Clear any stored sessions for this user
        localStorage.removeItem(`${currentUser.alias}`);
        sessionStorage.removeItem(`${currentUser.alias}`);
        
        // Log the user out
        gun.user().leave();
        user.value = null;
        
        // Clear any application data for the user
        // (You might want to add specific data clearing here)
        
        resolve();
      } catch (error) {
        reject(`Failed to delete user: ${error}`);
      }
    });
  }

  onMounted(() => {
    gun.user().recall({ sessionStorage: true });

    // @ts-ignore - The Gun.js type definitions may be incomplete for this use case
    gun.user()
    .once((data: User) => {
      user.value = data;
    });
  });

  provide<UserComposable>('user', {
    user,
    findPubKey,
    register,
    login,
    logout,
    deleteUser
  });
}

export function useUser(): UserComposable {
  const data = inject<UserComposable>('user');

  if (!data) {
    throw new Error('Composable must have an user provider.');
  }
  
  return data;
}