<template>
  <div class="flex flex-column row-gap-3">
    <div>
      Authors (excluding yourself):
      <FileUpload :fileLimit="32767" :multiple="true" :showCancelButton="false"
                  :showUploadButton="false" mode="advanced"
                  @remove="delAuthorFile" @select="addAuthorFile">
        <template #content="{ files, uploadedFiles, removeFileCallback }">
          <div v-if="files.length > 0">
            <div class="flex flex-wrap p-1">
              <div v-for="(file, index) of files" :key="file.name + file.type + file.size"
                   class="card flex flex-row mb-1 p-2 border-1 surface-border align-items-center w-full">
                <span class="font-semibold">{{ file.name }}</span>
                <div class="flex-grow-1"></div>
                <PButton icon="pi pi-times" @click="removeFileCallback(index)"
                         class="p-button-outlined p-button-danger p-button-rounded"></PButton>
              </div>
            </div>
          </div>
        </template>
      </FileUpload>
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
      Proposal created.
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
  import IdentityProcessor from "@/processing/identity-processor";
  import Bill from "@/processing/bill";
  import FileProcessorWrapper from "@/FileProcessorWrapper";
  import type {FileUploadRemoveEvent, FileUploadSelectEvent} from "primevue/fileupload";
  import FileUpload from "primevue/fileupload";
  import type Author from "@/processing/model/Author";
  import BufferReader from "@/processing/buffer-reader";
  import {loadFile} from "@/ui/utils/utils";

  const emit = defineEmits(["update:ready"]);

  const authors = ref<File[]>([]);
  const passwd = ref("");
  const errorMsg = ref("");

  function addAuthorFile(e: FileUploadSelectEvent) {
    authors.value = e.files;
  }

  function delAuthorFile(e: FileUploadRemoveEvent) {
    authors.value = e.files;
  }

  const valid = computed(() => {
    return authors.value.length !== 0
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
      const loadedAuthors: Author[] = [];
      for (const f of authors.value) {
        try {
          loadedAuthors.push(await loadAuthor(f));
        } catch (e) {
          console.error("unable to create proposal: author load failed", e);
          errorMsg.value = `there was an error while creating the proposal (author-file ${f.name} is corrupted)`;
          return;
        }
      }
      loadedAuthors.push(await IdentityProcessor.toAuthor(FileProcessorWrapper.INSTANCE.getIdentity()!));

      try {
        await FileProcessorWrapper.INSTANCE.createFile(loadedAuthors);
        FileProcessorWrapper.INSTANCE.setKey(await Bill.digest_pwd(passwd.value));

        ready.value = true;
      } catch (e) {
        console.error("unable to create proposal: createFile failed", e);
        errorMsg.value = "there was an error while creating the proposal";
      }
    } catch (e) {
      console.error("unable to create proposal", e);
      errorMsg.value = "there was an error while creating the proposal";
    }
  }

  async function loadAuthor(file: File): Promise<Author> {
    const data = await loadFile(file);
    return IdentityProcessor.loadAuthor(new BufferReader(data));
  }
</script>

<style lang="scss" scoped>

</style>
