<template>
  <div class="flex flex-column row-gap-3">
    <div class="p-inputgroup">
      <span class="p-inputgroup-addon pi pi-book"></span>
      <InputText v-model="title" placeholder="Title"/>
    </div>

    <div>
      Addendum-File:
      <FileUploadLight @remove="delAddendumFile" @select="addAddendumFile"></FileUploadLight>
    </div>

    <div class="flex">
      <div class="p-inputgroup-addon">
        <Checkbox v-model="saveToStorage" :binary="true" inputId="docUpl_storage"/>
        <label for="docUpl_storage" class="ml-1">Save in Browser-Storage</label>
      </div>
      <div class="p-inputgroup-addon">
        <Checkbox v-model="saveToStorageEnc" :binary="true" :disabled="!saveToStorage" inputId="docUpl_storage_enc"/>
        <label for="docUpl_storage_enc" class="ml-1">Save encrypted</label>
      </div>
      <div class="p-inputgroup-addon p-0 w-6">
        <span class="p-input-icon-left w-full">
          <i class="pi pi-file"></i>
          <InputText v-model="saveToStorageName" placeholder="Name" :disabled="!saveToStorage" class="border-0 w-full"/>
        </span>
      </div>
    </div>

    <div v-show="errorMsg.length !== 0" class=" p-inline-message p-inline-message-error">
      {{ errorMsg }}
    </div>
    <div v-show="ready" class="p-inline-message p-inline-message-success">
      Addendum added. Please save it to a file.
    </div>

    <div>
      <PButton :disabled="!valid" @click="onAdd">Upload</PButton>
      <div class="flex-grow-1"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {computed, ref, watch} from "vue";
  import PButton from "primevue/button";
  import InputText from "primevue/inputtext";
  import Checkbox from "primevue/checkbox";
  import FileUploadLight from "@/ui/open_dlg/FileUploadLight.vue";
  import type {FileUploadSelectEvent} from "primevue/fileupload";
  import {download, loadFile, sniffMime} from "@/ui/utils/utils";
  import FileProcessorWrapper from "@/FileProcessorWrapper";
  import Bill from "@/processing/bill";
  import BrowserStorage from "@/BrowserStorage";

  const emit = defineEmits(["update:ready"]);

  const file = ref<File | null>(null);
  const title = ref("");
  const saveToStorage = ref(true);
  const saveToStorageEnc = ref(true);
  const saveToStorageName = ref("");
  const errorMsg = ref("");

  function addAddendumFile(e: FileUploadSelectEvent) {
    file.value = e.files[0];
  }

  function delAddendumFile() {
    file.value = null;
  }

  const valid = computed(() => {
    return file.value !== null
        && title.value.length !== 0;
  });

  const ready = ref(false);
  watch(ready, () => {
    emit("update:ready", ready.value);
  });

  async function onAdd() {
    ready.value = false;
    errorMsg.value = "";

    try {
      const data = await loadFile(file.value!);
      const mime = sniffMime(file.value!!, data);

      try {
        await FileProcessorWrapper.INSTANCE.addAddendum(title.value, mime, data);

        try {
          const key = FileProcessorWrapper.INSTANCE.getKey()!;
          const data = await FileProcessorWrapper.INSTANCE.saveFile();
          const dataEnc = await Bill.encrypt(data, key);
          download(dataEnc, "proposal.sDoc");

          if(saveToStorage.value) {
            FileProcessorWrapper.INSTANCE.storageName.value = saveToStorageName.value;

            try {
              await BrowserStorage.INSTANCE.saveProposal(FileProcessorWrapper.INSTANCE, saveToStorageEnc.value);
            } catch (e) {
              console.error("unable to store proposal:", e);
              errorMsg.value = "there was an error while storing the proposal";
            }
          } else {
            FileProcessorWrapper.INSTANCE.storageName.value = null;
          }

          ready.value = true;
        } catch (e) {
          console.error("unable to save proposal: saveFile failed", e);
          errorMsg.value = "there was an error while adding the addendum (unable to save the proposal)";
        }
      } catch (e) {
        console.error("unable to add addendum: add failed", e);
        errorMsg.value = "there was an error while adding the addendum (unable to add the file)";
      }
    } catch (e) {
      console.error("unable to add addendum: open failed", e);
      errorMsg.value = "there was an error while adding the addendum (unable to open the file)";
    }
  }
</script>

<style scoped lang="scss">

</style>
