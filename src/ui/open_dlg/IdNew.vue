<template>
  <div class="flex flex-column row-gap-3">
    <div class="p-inputgroup">
      <span class="p-inputgroup-addon">
        <i class="pi pi-user"></i>
      </span>
      <InputText v-model="name" type="text" placeholder="Name"></InputText>
    </div>
    <div class="p-inputgroup">
      <span class="p-inputgroup-addon">
        <i class="pi pi-at"></i>
      </span>
      <InputText v-model="mail" type="email" placeholder="E-Mail"></InputText>
    </div>
    <div class="p-inputgroup">
      <span class="p-inputgroup-addon">
        <i class="pi pi-lock"></i>
      </span>
      <Password v-model="passwd" :feedback="false" placeholder="Password"/>
    </div>

    <div v-show="errorMsg.length !== 0" class=" p-inline-message p-inline-message-error">
      {{ errorMsg }}
    </div>
    <div v-show="ready" class="p-inline-message p-inline-message-success">
      Identity created. Please save it to a file.
    </div>

    <div>
      <PButton :disabled="!valid" @click="onCreate">Create</PButton>
      <div class="flex-grow-1"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, ref, watch} from "vue";
import PButton from "primevue/button";
import Password from "primevue/password";
import InputText from "primevue/inputtext";
import IdentityProcessor from "@/processing/identity-processor";
import Bill from "@/processing/bill";
import BufferWriter from "@/processing/buffer-writer";
import {download} from "@/ui/utils/utils";
import FileProcessorWrapper from "@/FileProcessorWrapper";

const emit = defineEmits(["update:ready"]);

const name = ref("");
const mail = ref("");
const passwd = ref("");
const errorMsg = ref("");

const valid = computed(() => {
  return name.value.length !== 0
      && mail.value.length !== 0
      && passwd.value.length !== 0;
});

const ready = ref(false);
watch(ready, () => {
  emit("update:ready", ready.value);
});

async function onCreate() {
  ready.value = false;
  errorMsg.value = "";

  try {
    const key = await Bill.digest_pwd(passwd.value);

    const identity = await IdentityProcessor.createIdentity(name.value, mail.value, await Bill.gen_ecc_keypair());

    const writer = new BufferWriter();
    await IdentityProcessor.saveIdentity(writer, identity);
    const dataEnc = await Bill.encrypt(writer.take(), key);

    download(dataEnc, "identity.sIden");

    FileProcessorWrapper.INSTANCE.setIdentity(identity);
    ready.value = true;
  } catch (e) {
    console.error("unable to create identity:", e);
    errorMsg.value = "there was an error while creating the identity";
  }
}
</script>

<style scoped lang="scss">

</style>
