<template>
  <div class="flex flex-column row-gap-3">
    <div>
      <FileUploadLight
        @remove="delFile"
        @select="addFile"
      />
    </div>

    <div class="flex">
      <div class="p-inputgroup-addon">
        <Checkbox v-model="saveToStorage" :binary="true" input-id="docUpl_storage"/>
        <label for="docUpl_storage" class="ml-1">Save in Browser-Storage</label>
      </div>
      <div class="p-inputgroup-addon p-0 w-6">
        <span class="p-input-icon-left w-full">
          <i class="pi pi-file" />
          <InputText v-model="saveToStorageName" placeholder="Name" :disabled="!saveToStorage" class="border-0 w-full"/>
        </span>
      </div>
    </div>

    <div>
      <PButton :disabled="loadDisabled" @click="load">Load</PButton>
      <div class="flex-grow-1" />
    </div>

    <div v-show="errorMsg.length !== 0" class=" p-inline-message p-inline-message-error">
      {{ errorMsg }}
    </div>
    <div v-show="success" class="p-inline-message p-inline-message-success">
      Proposal loaded
    </div>
  </div>
</template>

<script lang="ts" setup>
  import {computed, ref, watch} from "vue";
  import PButton from "primevue/button";
  import InputText from "primevue/inputtext";
  import Checkbox from "primevue/checkbox";
  import type {FileUploadSelectEvent} from "primevue/fileupload";
  import {Buffer} from "buffer";
  import BufferReader from "@/processing/buffer-reader";
  import FileProcessorWrapper from "@/FileProcessorWrapper";
  import FileUploadLight from "@/ui/utils/FileUploadLight.vue";
  import {loadFile} from "@/ui/utils/utils";
  import BrowserStorage from "@/BrowserStorage";

  const emit = defineEmits(["update:ready"]);

  const file = ref<File | null>(null);
  const errorMsg = ref("");
  const saveToStorage = ref(true);
  const saveToStorageName = ref("");

  const success = ref(false);
  watch(success, () => {
    emit("update:ready", success.value);
  });

  const loadDisabled = computed(() => {
    return file.value === null;
  });

  function addFile(e: FileUploadSelectEvent) {
    file.value = e.files[0];

    let fileName = file.value!.name;
    const dotIdx = fileName.lastIndexOf(".");
    if(dotIdx !== -1)
      fileName = fileName.substring(0, dotIdx);
    saveToStorageName.value = fileName;
  }

  function delFile() {
    file.value = null;
  }

  async function load() {
    success.value = false;
    errorMsg.value = "";

    let data: Buffer;
    try {
      data = await loadFile(file.value!);
    } catch (e) {
      console.error("unable to load proposal from file: open failed", e);
      errorMsg.value = "there was an error while loading the proposal (unable to open the file)";
      return;
    }

    try {
      await FileProcessorWrapper.INSTANCE.loadFile(new BufferReader(data));

      if(saveToStorage.value) {
        FileProcessorWrapper.INSTANCE.storageName.value = saveToStorageName.value;

        try {
          await BrowserStorage.INSTANCE.saveProposal(FileProcessorWrapper.INSTANCE);
        } catch (e) {
          console.error("unable to store proposal:", e);
          errorMsg.value = "there was an error while storing the proposal";
        }
      } else {
        FileProcessorWrapper.INSTANCE.storageName.value = null;
      }

      success.value = true;
    } catch (e) {
      console.error("unable to load proposal from file: load failed", e);
      errorMsg.value = "there was an error while loading the proposal (you are not an author or the file is corrupted)";
    }
  }
</script>

<style lang="scss" scoped>

</style>
