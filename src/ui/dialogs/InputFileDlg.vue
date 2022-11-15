<template>
  <Dialog :visible="props.modelValue" @update:visible="onUpdateVisible" :modal="true" :header="props.header">
    <div class="mb-2">{{description}}</div>

    <FileUploadLight @select="onAdd" @remove="onDel"></FileUploadLight>

    <div class="flex flex-row w-full mt-2">
      <div class="flex-grow-1"></div>
      <PButton @click="onSubmit">OK</PButton>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
  import {ref, watch} from "vue";
  import type {PropType} from "vue";
  import Dialog from "primevue/dialog";
  import PButton from "primevue/button";
  import type {InputFileDlgResult} from "@/ui/dialogs/Helpers";
  import FileUploadLight from "@/ui/utils/FileUploadLight.vue";
  import type {FileUploadRemoveEvent, FileUploadSelectEvent} from "primevue/fileupload";

  const props = defineProps({
    modelValue: {
      required: true,
      type: Boolean
    },
    mode: {
      required: false,
      type: String as PropType<"single" | "multiple">,
      default: "single"
    },
    header: {
      required: false,
      type: String
    },
    description: {
      required: false,
      type: String,
      default: ""
    }
  });

  const emit = defineEmits<{
    (event: "result", val: InputFileDlgResult): void,
    (event: "update:modelValue", val: boolean): void
  }>();

  const files = ref<File[]>([]);

  watch(() => props.modelValue, (show) => {
    if(show) {
      files.value = [];
    }
  });

  function onUpdateVisible(visible: boolean) {
    if(!visible) {
      emit("result", {
        ok: false,
        files: []
      });
    }

    emit("update:modelValue", visible);
  }

  function onSubmit() {
    emit("result", {
      ok: true,
      files: files.value
    });
    emit("update:modelValue", false);
  }

  function onAdd(e: FileUploadSelectEvent) {
    files.value = e.files;
  }

  function onDel(e: FileUploadRemoveEvent) {
    files.value = e.files;
  }
</script>

<style scoped lang="scss">

</style>
