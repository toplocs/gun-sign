import type { Ref } from 'vue';
import type { GunUser, GunAck } from './gun.d';

// Define the type for the useUser result
export interface UserComposable {
  user: Ref<GunUser | null>;
  findPubKey: (name: string) => Promise<string | null>;
  register: (credentials: UserCredentials) => Promise<GunAck>;
  login: (credentials: UserCredentials) => Promise<GunUser>;
  logout: () => Promise<void>;
  deleteUser: () => Promise<void>;
}

// UserCredentials type for user authentication
export type UserCredentials = {
  name: string;
  password: string;
}

