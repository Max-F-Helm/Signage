<template>
  <Dialog
    v-model:visible="show"
    :closable="true"
    :modal="true"
    header="Manage stored authors"
  >
    <div>
      <div class="mb-2 ml-2">
        <PButton icon="pi pi-replay" class="p-button-rounded p-button-outlined p-button-secondary"
                 @click="reloadEntries" />
        <div class="flex-grow-1" />
      </div>
      <DataTable
        :value="authors"
        selection-mode="single"
        :row-hover="true"
        :scrollable="true"
        scroll-height="16rem"
      >
        <Column field="name" header="Name + Mail" :sortable="true" />
        <Column class="colDel">
          <template #body="slotProps">
            <PButton icon="pi pi-trash" class="p-button-rounded p-button-outlined p-button-danger"
                     @click="() => onDel(slotProps.data.name)" />
          </template>
        </Column>
      </DataTable>
    </div>

    <div class="mt-5">
      Upload new Authors to store them in the browser-storage
      <FileUpload
        :file-limit="32767"
        :multiple="true"
        :show-cancel-button="false"
        :show-upload-button="false"
        mode="advanced"
        @remove="delAuthorFile"
        @select="addAuthorFile"
      >
        <template #content="{ files, uploadedFiles, removeFileCallback }">
          <div v-if="files.length > 0">
            <div class="flex flex-wrap p-1">
              <div v-for="(file, index) of files" :key="file.name + file.type + file.size"
                   class="card flex flex-row mb-1 p-2 border-1 surface-border align-items-center w-full">
                <span class="font-semibold">{{ file.name }}</span>
                <div class="flex-grow-1" />
                <PButton icon="pi pi-times"
                         class="p-button-outlined p-button-danger p-button-rounded"
                         @click="removeFileCallback(index)" />
              </div>
            </div>
          </div>
        </template>
      </FileUpload>
      <div class="mb-2 mt-2">
        <PButton @click="onUpload">Upload</PButton>
        <div class="flex-grow-1" />
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
  import Dialog from "primevue/dialog";
  import PButton from "primevue/button";
  import DataTable from "primevue/datatable";
  import Column from "primevue/column";
  import FileUpload from "primevue/fileupload";
  import {computed, onBeforeMount, ref} from "vue";
  import BrowserStorage from "@/BrowserStorage";
  import type {FileUploadRemoveEvent, FileUploadSelectEvent} from "primevue/fileupload";
  import {useToast} from "primevue/usetoast";
  import {loadFile} from "@/ui/utils/utils";
  import IdentityProcessor from "@/processing/identity-processor";
  import BufferReader from "@/processing/buffer-reader";

  interface Entry {
    name: string
  }

  const browserStorage = BrowserStorage.INSTANCE;
  const toast = useToast();

  const props = defineProps({
    modelValue: {
      required: true,
      type: Boolean
    }
  });

  const emit = defineEmits(["update:modelValue"]);

  const show = computed({
    get(): boolean {
      return props.modelValue;
    },
    set(newVal: boolean) {
      emit("update:modelValue", newVal);
    }
  });

  const authors = ref<Entry[]>([]);
  const authorFiles = ref<File[]>([]);

  async function onDel(name: string) {
    await BrowserStorage.INSTANCE.removeAuthor(name);
    await reloadEntries();
  }

  function addAuthorFile(e: FileUploadSelectEvent) {
    authorFiles.value = e.files;
  }

  function delAuthorFile(e: FileUploadRemoveEvent) {
    authorFiles.value = e.files;
  }

  async function onUpload() {
    for (const f of authorFiles.value) {
      try {
        const data = await loadFile(f);
        const author = await IdentityProcessor.loadAuthor(new BufferReader(data));
        await browserStorage.saveAuthor(author);
      } catch (e) {
        console.error("unable to create proposal: author load failed", e);
        showErrToast(`Unable to store Author (${f.name})`, e);
        return;
      }
    }

    await reloadEntries();
  }

  async function reloadEntries() {
    authors.value = Object.entries(await browserStorage.availableAuthors()).map(([k]) => {
      return {
        name: k
      }
    });
  }

  function showErrToast(summary: string, e: any) {
    toast.add({
      severity: "error",
      summary: summary,
      detail: e != null ? e.toString() : "unknown reason",
      life: 5000
    });
  }

  onBeforeMount(async () => {
    await reloadEntries();
  });
</script>

<style lang="scss">
  .colDel {
    min-width: 6rem;
    max-width: 6rem;
    flex-grow: 0;
    justify-content: center;
  }
</style>
