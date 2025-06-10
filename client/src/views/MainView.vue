<script setup lang="ts">
import Messages from '@/components/Messages.vue';
import SelectUser from '@/components/SelectUser.vue'
</script>

<template>
  <main>
    <div class="h-[100vh] mb-8">
      <SelectUser />
      <div class="my-4">
      </div>
      <Messages />
    </div>
  </main>
</template>
