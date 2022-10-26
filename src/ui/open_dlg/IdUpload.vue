<template>
  <div class="flex flex-column row-gap-3">
    <div>
      <FileUpload mode="advanced" :multiple="false" :fileLimit="1"
                  :showUploadButton="false" :showCancelButton="false"
                  @select="idUplSetFile" @remove="idUplClearFile"></FileUpload>
    </div>
    <div class="p-inputgroup">
            <span class="p-inputgroup-addon">
              <i class="pi pi-lock"></i>
            </span>
      <Password v-model="passwd" :feedback="false" placeholder="Password"/>
    </div>
    <div>
      <PButton @click="idUplLoad" :disabled="idUplLoadDisabled">Load</PButton>
      <div class="flex-grow-1"></div>
    </div>

    <div v-show="errorMsg.length !== 0" class=" p-inline-message p-inline-message-error">
      {{ errorMsg }}
    </div>
    <div v-show="success" class="p-inline-message p-inline-message-success">
      Identity loaded
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, ref, watch} from "vue";
import PButton from "primevue/button";
import FileUpload from "primevue/fileupload";
import type {FileUploadSelectEvent} from "primevue/fileupload";
import Password from "primevue/password";
import Bill from "@/processing/bill";
import {Buffer} from "buffer";
import IdentityProcessor from "@/processing/identity-processor";
import BufferReader from "@/processing/buffer-reader";
import FileProcessorWrapper from "@/FileProcessorWrapper";

const emit = defineEmits(["update:ready"]);

const file = ref<File | null>(null);
const passwd = ref("");
const errorMsg = ref("");

const success = ref(false);
watch(success, () => {
  emit("update:ready", success.value);
});

const idUplLoadDisabled = computed(() => {
  return file.value === null || passwd.value.length === 0;
});

function idUplSetFile(e: FileUploadSelectEvent) {
  file.value = e.files[0];
}
function idUplClearFile() {
  file.value = null;
}

async function idUplLoad() {
  success.value = false;
  errorMsg.value = "";

  const reader = new FileReader();
  const filePromise = new Promise<ArrayBuffer>((resolve, reject) => {
    reader.onload = (e) => {
      resolve(e.target!.result as ArrayBuffer);
    }
    reader.onerror = (e) => {
      reject(e.target!.error);
    }
  });
  reader.readAsArrayBuffer(file.value!);

  try {
    try {
      const key = await Bill.digest_pwd(passwd.value);
      const data = Buffer.from(await filePromise);
      const dataDec = Buffer.from(await Bill.decrypt(data, key));

      try {
        const identity = await IdentityProcessor.loadIdentity(new BufferReader(dataDec));
        FileProcessorWrapper.INSTANCE.setIdentity(identity);

        success.value = true;
      }catch (e) {
        console.error("unable to load identity from file: load failed", e);
        errorMsg.value = "there was an error while loading the identity (the file seems corrupted)";
      }
    } catch (e) {
      console.error("unable to load identity from file: decryption failed", e);
      errorMsg.value = "there was an error while loading the identity (was the password correct?)";
    }
  } catch (e) {
    console.error("unable to load identity from file: open failed", e);
    errorMsg.value = "there was an error while loading the identity (unable to open the file)";
  }
}
</script>

<style scoped lang="scss">

</style>
