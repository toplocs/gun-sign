<template>
  <ul v-if="!user" class="mt-4 text-blue-500">
    <li>
      <a
        class="cursor-pointer"
        @click="() => selectUser('Anna')"
      >Anna</a>
    </li>
    <li>
      <a
        class="cursor-pointer"
        @click="() => selectUser('Bob')"
      >Bob</a>
    </li>
    <li>
      <a
        class="cursor-pointer"
        @click="() => selectUser('Charly')"
      >Charly</a>
    </li>
  </ul>
  <span v-else>
    {{ user.alias }} is logged in ->
    <a
      class="cursor-pointer text-red-500"
      @click="handleLogout"
    >Logout</a>
  </span>
</template>

//
<script setup>
import { ref, watchEffect, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUser } from '@/user';

const router = useRouter();
const { user, login, register, logout } = useUser();
const form = ref<HTMLFormElement | null>(null);

const selectUser = async (id) => {
  const credentials = {
    name: id,
    password: id+id+id,
  };

  try {
    const exists = await register(credentials);
    console.log(result);
  } catch (error) {
    console.error(error);
  }
  const result = await login(credentials);
  user.value = result;
}

const handleLogout = async () => {
  await logout();
  router.push('/');
}
</script>
