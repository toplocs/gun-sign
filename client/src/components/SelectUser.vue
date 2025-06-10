<template>
  <div v-if="!user" class="mt-4 border-b">
    <ul class="text-blue-500">
      <li 
        class="mb-2"
        v-for="name in ['Anna', 'Bob', 'Charly']" 
        :key="name">
        <a
          class="cursor-pointer"
          @click="() => selectUser(name)">
          {{ name }}
        </a>
        <span 
          v-if="pubKeys.has(name)"
          class="text-gray-600 text-xs break-all">
          ({{ pubKeys.get(name) }})
        </span>
        <a v-else
          class="ml-2 text-blue-700 cursor-pointer"
          @click="() => handleRegister(name)">
          Register
        </a>
      </li>
    </ul>
  </div>
  <span v-else>
    {{ user.alias }} is logged in ->
    <a
      class="cursor-pointer text-red-500"
      @click="handleLogout"
    >Logout</a>
    <a
      class="cursor-pointer ml-2 text-red-700"
      @click="handleDeleteUser"
    >Delete User</a>
  </span>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUser } from '@/user';
import type { UserCredentials } from '@/types/user';

const router = useRouter();
const { user, findPubKey, login, register, logout, deleteUser } = useUser();

const pubKeys = ref<Map<string, string>>(new Map());

onMounted(async () => {
  // Fetch public keys for predefined users
  const userNames = ['Anna', 'Bob', 'Charly'];
  for (const name of userNames) {
    const pubKey = await findPubKey(name);
    if (pubKey) {
      pubKeys.value.set(name, pubKey);
    }
  }
});

const handleRegister = async (name: string) => {
  const credentials: UserCredentials = {
    name,
    password: name + name + name,
  };

  try {
    const result = await register(credentials);
    console.log('User registered:', result.pub);
    if (result.pub) {
      pubKeys.value.set(name, result.pub);
    }
  } catch (error) {
    console.error('Error registering user:', error);
  }
}

const selectUser = async (id: string) => {
  const credentials: UserCredentials = {
    name: id,
    password: id+id+id,
  };

  const result = await login(credentials);
  console.log('User logged in:', result);
  user.value = result;
}

const handleLogout = async () => {
  await logout();
  router.push('/');
}

const handleDeleteUser = async () => {
  if (confirm(`Are you sure you want to delete user "${user.value?.alias}"? This cannot be undone.`)) {
    try {
      await deleteUser();
      router.push('/');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(`Failed to delete user: ${error}`);
    }
  }
}

</script>
