<template>
  <input
    class="mt-4 border border-solid border-black"
    v-model="message"
  />
  <button @click="sendMessage">
    Send
  </button>

  <ul class="mt-4">
    <li v-for="msg of messages">
      {{ msg.user?.alias }}: {{ msg.text }}
      <small>{{ new Date(msg.timestamp).toLocaleTimeString() }}</small>
    </li>
  </ul>

</template>

//
<script setup>
import { ref, onMounted } from 'vue';
import { useUser } from '@/user';
import gun from '@/gun';

const { user } = useUser();
const message = ref('');
const messages = ref([]);

async function signAndStoreData(data) {
  const pair = gun.user()._.sea;
  const signedData = await SEA.sign(data, pair);
  const id = crypto.randomUUID();
  const node = gun.get('message').get(id).put({
    pub: data.user?.pub,
    signedData
  });
  const list = gun.get('messages').set(node);

  return signedData;
}

const sendMessage = async () => {
  const data = {
    user: user.value,
    text: message.value,
    timestamp: Date.now()
  };
  await signAndStoreData(data);
  message.value = '';
}

onMounted(() => {
  gun.get('messages')
  .map()
  .once((ref, key) => {
    if (!ref || !key) return;
    gun.get(key).once(async (data) => {
      if (data?.pub && data?.signedData) {
        const verified = await SEA.verify(data.signedData, data.pub);
        if (verified && verified.timestamp) {
          messages.value.push(verified);   
          messages.value.sort((a, b) => a.timestamp - b.timestamp);
        } else {
          console.warn('Not verified:', data.signedData)
        }
      }
    });
  });
});

</script>
