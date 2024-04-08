<template>
  <FileUpload :fileLimit="1" :multiple="false" :showCancelButton="false"
              :showUploadButton="false" mode="advanced"
              @remove="(e: FileUploadRemoveEvent) => emit('remove', e)"
              @select="(e: FileUploadSelectEvent) => emit('select', e)">
    <template #content="{ files, uploadedFiles, removeFileCallback }">
      <div v-if="files.length > 0">
        <div class="flex flex-wrap p-1">
          <div v-for="(file, index) of files" :key="file.name + file.type + file.size"
               class="card flex flex-row m-0 p-2 border-1 surface-border align-items-center w-full">
            <span class="font-semibold">{{ file.name }}</span>
            <div class="flex-grow-1"></div>
            <PButton icon="pi pi-times" @click="removeFileCallback(index)"
                     class="p-button-outlined p-button-danger p-button-rounded"></PButton>
          </div>
        </div>
      </div>
    </template>
    <template #empty>
      <div class="flex align-items-center justify-content-center flex-column">
        <i class="pi pi-cloud-upload border-2 border-circle p-5 text-8xl text-400 border-400" />
        <p class="mt-4 mb-0">
          Drag and drop files to here to upload.
        </p>
      </div>
    </template>
  </FileUpload>
</template>

<script setup lang="ts">
import FileUpload, {type FileUploadRemoveEvent, type FileUploadSelectEvent} from "primevue/fileupload";
import PButton from "primevue/button";

const emit = defineEmits(["remove", "select"]);
</script>

<style scoped lang="scss">

</style>
