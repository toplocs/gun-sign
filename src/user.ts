import { ref, computed, inject, provide, watch, onMounted, onUnmounted } from 'vue';
import gun from '@/gun';

export function userProvider() {
  const user = ref<User | null>(null);
  const pair = ref(null);

  const register = async (user) => {
    return new Promise(async (resolve, reject) => {
      const username = user.name
      const password = user.password;

      gun.user().create(username, password, (ack) => {
        if (ack.err) {
          reject('Create failed:', ack.err);
        } else {
          resolve(ack);
        }
      });
    });
  }

  const login = async (user) => {
    return new Promise((resolve, reject) => {
      const username = user.name
      const password = user.password;

      gun.user().auth(username, password, (ack) => {
        if (ack.err) {
          reject('Auth failed:', ack.err);
        } else {
          gun.user()
          .once(data => {
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

  onMounted(() => {
    gun.user().recall({ sessionStorage: true });

    gun.user()
    .once(data => {
      user.value = data;
    });
  });

  provide('user', {
    user,
    pair,
    register,
    login,
    logout
  });
}

export function useUser() {
  const data = inject('user');

  if (!data) {
    throw new Error('Composable must have an user provider.');
  }
  
  return data;
}