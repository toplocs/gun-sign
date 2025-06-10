<template>
  <div class="w-full mx-auto max-w-md">
    <div class="mx-auto">
      <header>
        <nav class="w-full sticky top-0 text-lg text-blue-500 flex flex-row gap-4 border-b">
          <RouterLink to="/">Messages</RouterLink>
        </nav>
      </header>

      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { userProvider } from '@/user';

userProvider();
</script>