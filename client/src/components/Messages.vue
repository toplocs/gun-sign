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
      <small>{{ new Date(msg.timestamp).toLocaleTimeString() }}</small>
      {{ msg.user }}: {{ msg.text }} <span v-if="msg.verified">✔️</span>
    </li>
  </ul>

</template>

//
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUser } from '@/user';
import gun from '@/gun';
import hash from 'object-hash';

const { user, findPubKey } = useUser();

interface Message {
  user: string;
  text: string;
  timestamp: number;
}
// Used in messages ref
interface VerifiedMessage extends Message {
  verified?: boolean;
}
// Used in gun node
interface SignedMessage extends Message {
  signature?: string;
}

const message = ref('');
const messages = ref<Record<string, VerifiedMessage>>({});


async function putMessage(data: SignedMessage) {
  const id = crypto.randomUUID();
  const node = gun.get('chat').get(id).put(data);
}

async function hashData(data: Message): Promise<string> {
  const content = data.user + data.text + data.timestamp;
  const dataHash = hash(content, {
    algorithm: 'sha1'
  });
  return dataHash;
}

async function signData(data: Message): Promise<string> {
  const pair = gun.user()._.sea;
  const hash = await hashData(data);
  console.log('Data hash:', hash);
  const signedHash = await SEA.sign(hash, pair);
  return signedHash;
}

const sendMessage = async () => {
  if (!user.value) {
    console.warn('Not logged in');
    return;
  }

  let data: SignedMessage = {
    user: user.value.alias,
    text: message.value,
    timestamp: Date.now()
  };
  data.signature = await signData(data);

  if (user.value?.alias == "Charly") {
    // Charly doesn't sign messages properly
    data.signature = "lala";
  }

  console.log('Message:', data);
  await putMessage(data);
  message.value = '';
}

async function verifyMessage(data: Message, signature: string): Promise<boolean> {
  if (!signature) return false;
  const pubKey = await findPubKey(data.user);
  if (!pubKey) {
    console.warn(`No public key found for user ${data.user}`);
    return false;
  }
  const dataHash = await hashData(data);
  const verified = await SEA.verify(signature, pubKey);
  return verified === dataHash;
}

onMounted(() => {
  gun.get('chat')
  .map()
  .once(async (data: any, key: string) => {
    if (!data || !key) return;
    
    const message: Message = {
      user: data.user || { alias: 'Unknown' },
      text: data.text,
      timestamp: data.timestamp,
    };
    const verified = await verifyMessage(message, data.signature)
    if (true) {
      const verifiedMessage = message as VerifiedMessage;
      verifiedMessage.verified = verified;

      messages.value[data.timestamp] = verifiedMessage;
    }
  });
});

</script>
