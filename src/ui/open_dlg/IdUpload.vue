<template>
  <div class="flex flex-column row-gap-3">
    <div>
      <FileUploadLight @remove="clearFile" @select="setFile"></FileUploadLight>
    </div>
    <div class="p-inputgroup">
            <span class="p-inputgroup-addon">
              <i class="pi pi-lock"></i>
            </span>
      <Password v-model="passwd" :feedback="false" placeholder="Password" ref="refPasswdInp"
                @keyup.enter="onPasswdImpEnter"/>
    </div>

    <div class="flex">
      <div class="p-inputgroup w-fit mr-1">
        <div class="p-inputgroup-addon h-full">
          Save in Browser-Storage
        </div>
        <div class="p-inputgroup-addon h-full">
          <Checkbox v-model="saveToStorage" :binary="true"/>
        </div>
      </div>
      <div class="p-inputgroup w-fit">
        <span class="p-inputgroup-addon h-full">
          Save encrypted
        </span>
        <Checkbox v-model="saveToStorageEnc" :binary="true" :disabled="!saveToStorage"
                  class="p-inputgroup-addon h-full"/>
      </div>
    </div>

    <div>
      <PButton :disabled="loadDisabled" @click="load">Load</PButton>
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

<script lang="ts" setup>
  import {computed, ref, watch} from "vue";
  import PButton from "primevue/button";
  import type {FileUploadSelectEvent} from "primevue/fileupload";
  import Password from "primevue/password";
  import Checkbox from "primevue/checkbox";
  import Bill from "@/processing/bill";
  import {Buffer} from "buffer";
  import IdentityProcessor from "@/processing/identity-processor";
  import BufferReader from "@/processing/buffer-reader";
  import FileProcessorWrapper from "@/FileProcessorWrapper";
  import FileUploadLight from "@/ui/open_dlg/FileUploadLight.vue";
  import {loadFile} from "@/ui/utils/utils";
  import BrowserStorage from "@/BrowserStorage";

  const emit = defineEmits(["update:ready"]);

  const file = ref<File | null>(null);
  const passwd = ref("");
  const errorMsg = ref("");
  const saveToStorage = ref(true);
  const saveToStorageEnc = ref(true);
  const refPasswdInp = ref();

  const success = ref(false);
  watch(success, () => {
    emit("update:ready", success.value);
  });

  const loadDisabled = computed(() => {
    return file.value === null || passwd.value.length === 0;
  });

  function setFile(e: FileUploadSelectEvent) {
    file.value = e.files[0];
    refPasswdInp.value?.$refs.input.$el.focus();
  }

  function clearFile() {
    file.value = null;
  }

  async function onPasswdImpEnter() {
    if(!loadDisabled.value)
      await load();
  }

  async function load() {
    success.value = false;
    errorMsg.value = "";

    try {
      const data = await loadFile(file.value!);

      try {
        const key = await Bill.digest_pwd(passwd.value);
        const dataDec = Buffer.from(await Bill.decrypt(data, key));

        try {
          const identity = await IdentityProcessor.loadIdentity(new BufferReader(dataDec));
          FileProcessorWrapper.INSTANCE.setIdentity(identity);
          FileProcessorWrapper.INSTANCE.init();

          if(saveToStorage.value) {
            try {
              await BrowserStorage.INSTANCE.saveIdentity(identity, saveToStorageEnc.value ? key : null);
            } catch (e) {
              console.error("unable to store identity:", e);
              errorMsg.value = "there was an error while storing the identity";
            }
          }

          success.value = true;
        } catch (e) {
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

<style lang="scss" scoped>

</style>
