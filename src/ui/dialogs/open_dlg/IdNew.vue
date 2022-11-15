<template>
  <div class="flex flex-column row-gap-3">
    <div class="p-inputgroup">
      <span class="p-inputgroup-addon">
        <i class="pi pi-user"></i>
      </span>
      <InputText v-model="name" placeholder="Name" type="text"></InputText>
    </div>
    <div class="p-inputgroup">
      <span class="p-inputgroup-addon">
        <i class="pi pi-at"></i>
      </span>
      <InputText v-model="mail" placeholder="E-Mail" type="email"></InputText>
    </div>
    <div class="p-inputgroup">
      <span class="p-inputgroup-addon">
        <i class="pi pi-lock"></i>
      </span>
      <Password v-model="passwd" :feedback="false" placeholder="Password"/>
    </div>

    <div class="flex">
      <div class="p-inputgroup-addon">
        <Checkbox v-model="saveToStorage" :binary="true" inputId="idNew_storage"/>
        <label for="idNew_storage" class="ml-1">Save in Browser-Storage</label>
      </div>
      <div class="p-inputgroup-addon">
        <Checkbox v-model="saveToStorageEnc" :binary="true" :disabled="!saveToStorage" inputId="idNew_storage_enc"/>
        <label for="idNew_storage_enc" class="ml-1">Save encrypted</label>
      </div>
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

<script lang="ts" setup>
  import {computed, ref, watch} from "vue";
  import PButton from "primevue/button";
  import Password from "primevue/password";
  import InputText from "primevue/inputtext";
  import Checkbox from "primevue/checkbox";
  import IdentityProcessor from "@/processing/identity-processor";
  import Bill from "@/processing/bill";
  import BufferWriter from "@/processing/buffer-writer";
  import {download} from "@/ui/utils/utils";
  import FileProcessorWrapper from "@/FileProcessorWrapper";
  import BrowserStorage from "@/BrowserStorage";

  const emit = defineEmits(["update:ready"]);

  const name = ref("");
  const mail = ref("");
  const passwd = ref("");
  const errorMsg = ref("");
  const saveToStorage = ref(true);
  const saveToStorageEnc = ref(true);

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

      writer.setPositionAbs(0);
      await IdentityProcessor.saveAuthor(writer, await IdentityProcessor.toAuthor(identity));
      const author = writer.take();

      download(dataEnc, "identity.sIdn");
      download(author, "author.sAut");

      FileProcessorWrapper.INSTANCE.setIdentity(identity);
      FileProcessorWrapper.INSTANCE.init();

      if(saveToStorage.value) {
        try {
          await BrowserStorage.INSTANCE.saveIdentity(identity, key, !saveToStorageEnc.value);
        } catch (e) {
          console.error("unable to store identity:", e);
          errorMsg.value = "there was an error while storing the identity";
        }
      }

      ready.value = true;
    } catch (e) {
      console.error("unable to create identity:", e);
      errorMsg.value = "there was an error while creating the identity";
    }
  }
</script>

<style lang="scss" scoped>

</style>
