<template>
  <Dialog v-model:visible="open" :closable="false" :modal="true" header="Upload File">
    <div class="p-inputgroup">
      <span class="p-inputgroup-addon">
        Title
      </span>
      <InputText v-model="title"></InputText>
    </div>

    <FileUploadLight @remove="clearFile" @select="setFile"></FileUploadLight>

    <template #footer>
      <div class="flex flex-row">
        <PButton @click="onCancel" class="p-button-danger">Cancel</PButton>
        <div class="flex-grow-1"></div>
        <PButton @click="onUpload" class="p-button-success"
                 :disabled="file === null || title.length === 0">Upload</PButton>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import {computed, ref} from "vue";
import PButton from "primevue/button";
import InputText from "primevue/inputtext";
import Dialog from "primevue/dialog";
import FileUploadLight from "@/ui/open_dlg/FileUploadLight.vue";
import type {FileUploadSelectEvent} from "primevue/fileupload";
import type {NewAddendumData} from "@/ui/file_spec/Helpers";
import {loadFile, sniffMime} from "@/ui/utils/utils";

const emit = defineEmits(["update:modelValue", "loaded", "error"]);

const props = defineProps({
  modelValue: {
    required: true,
    type: Boolean
  }
});

const open = computed({
  get(): boolean {
    return props.modelValue;
  },
  set(val: boolean) {
    emit("update:modelValue", val);
  }
});

const title = ref<string>("");
const file = ref<File | null>(null);

function setFile(e: FileUploadSelectEvent) {
  file.value = e.files[0];
}

function clearFile() {
  file.value = null;
}

function onCancel() {
  open.value = false;
}

async function onUpload() {
  try {
    const data = await loadFile(file.value!);
    const mime = sniffMime(file.value!!, data);

    emit("loaded", {
      title: title.value,
      mime: mime,
      content: data
    } as NewAddendumData);

    open.value = false;
  } catch (e) {
    emit("error", e);
  }
}
</script>

<style scoped lang="scss">

</style>
