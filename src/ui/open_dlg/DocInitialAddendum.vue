<template>
  <div class="flex flex-column row-gap-3">
    <div class="p-inputgroup">
      <span class="p-inputgroup-addon">
        <i class="pi pi-book"></i>
      </span>
    <InputText v-model="title" placeholder="Title"/>
  </div>

  <div>
    Addendum-File:
    <FileUploadLight @remove="delAddendumFile" @select="addAddendumFile"></FileUploadLight>
  </div>

  <div v-show="errorMsg.length !== 0" class=" p-inline-message p-inline-message-error">
    {{ errorMsg }}
  </div>
  <div v-show="ready" class="p-inline-message p-inline-message-success">
    Addendum added.
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
  import FileUploadLight from "@/ui/open_dlg/FileUploadLight.vue";
  import type {FileUploadSelectEvent} from "primevue/fileupload";
  import {Buffer} from "buffer";
  import {loadFile} from "@/ui/utils/utils";
  import FileProcessorWrapper from "@/FileProcessorWrapper";
  import {fileTypeFromBuffer} from "file-type";

  const emit = defineEmits(["update:ready"]);

  const file = ref<File | null>(null);
  const title = ref("");
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

      const sniffedMime = await fileTypeFromBuffer(data);
      let mime: string;
      if(sniffedMime !== undefined) {
        mime = sniffedMime.mime;
      } else {
        mime = file.value!.type;
      }

      try {
        FileProcessorWrapper.INSTANCE.addAddendum(title.value, mime, data);
        ready.value = true;
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
