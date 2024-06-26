<template>
  <div class="flex flex-column row-gap-3">
    <div>
      Authors (excluding yourself):
      <TabView v-model:activeIndex="openTab">
        <TabPanel header="Upload Authors">
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
                    <div class="flex-grow-1"></div>
                    <PButton icon="pi pi-times" @click="removeFileCallback(index)"
                             class="p-button-outlined p-button-danger p-button-rounded"></PButton>
                  </div>
                </div>
              </div>
            </template>
          </FileUpload>
        </TabPanel>

        <TabPanel header="Stored Authors">
          <div class="mb-2 ml-2">
            <PButton icon="pi pi-replay" class="p-button-rounded p-button-outlined p-button-secondary"
                     @click="reloadStoredAuthors"></PButton>
            <div class="flex-grow-1"></div>
          </div>
          <DataTable
            v-model:selection="selectedStoredAuthors"
            :value="storedAuthors"
            selection-mode="multiple"
            data-key="name"
            :row-hover="true"
            :scrollable="true"
            scroll-height="16rem"
          >
            <Column selection-mode="multiple" />
            <Column field="name" header="Name + Mail" :sortable="true"/>
          </DataTable>
        </TabPanel>
      </TabView>
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
  import {computed, onBeforeMount, ref, watch} from "vue";
  import PButton from "primevue/button";
  import TabView from "primevue/tabview";
  import TabPanel from "primevue/tabpanel";
  import DataTable from "primevue/datatable";
  import Column from "primevue/column";
  import FileUpload from "primevue/fileupload";
  import IdentityProcessor from "@/processing/identity-processor";
  import FileProcessorWrapper from "@/FileProcessorWrapper";
  import type {FileUploadRemoveEvent, FileUploadSelectEvent} from "primevue/fileupload";
  import type Author from "@/processing/model/Author";
  import BufferReader from "@/processing/buffer-reader";
  import {loadFile} from "@/ui/utils/utils";
  import BrowserStorage from "@/BrowserStorage";
  import {useToast} from "primevue/usetoast";
  import {findDuplicates} from "@/processing/utils";

  interface Entry {
    name: string
  }

  const browserStorage = BrowserStorage.INSTANCE;
  const toast = useToast();

  const emit = defineEmits(["update:ready"]);

  const authors = ref<File[]>([]);
  const errorMsg = ref("");
  const storedAuthors = ref<Entry[]>([]);
  const selectedStoredAuthors = ref<Entry[]>([]);
  const openTab = ref(0);

  watch(openTab, (tab) => {
    if(tab === 1)
      reloadStoredAuthors();
  });

  function addAuthorFile(e: FileUploadSelectEvent) {
    authors.value = e.files;
  }

  function delAuthorFile(e: FileUploadRemoveEvent) {
    authors.value = e.files;
  }

  const valid = computed(() => {
    return authors.value.length !== 0;
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
          const author = await loadAuthor(f);

          if(IdentityProcessor.equals(FileProcessorWrapper.INSTANCE.getIdentity()!, author)) {
            toast.add({
              severity: "warn",
              summary: "Duplicate Author",
              detail: "you can not add your own author-file; ignoring it",
              life: 5000
            });
          } else {
            loadedAuthors.push(author);
          }
        } catch (e) {
          console.error("unable to create proposal: author load failed", e);
          errorMsg.value = `there was an error while creating the proposal (author-file ${f.name} is corrupted)`;
          return;
        }
      }

      for(const selected of selectedStoredAuthors.value){
        try {
          loadedAuthors.push(await browserStorage.loadAuthor(selected.name));
        } catch (e) {
          console.error("unable to create proposal: author load failed", e);
          errorMsg.value = `there was an error while creating the proposal (stored author ${selected.name} is corrupted)`;
          return;
        }
      }

      loadedAuthors.push(await IdentityProcessor.toAuthor(FileProcessorWrapper.INSTANCE.getIdentity()!));

      const duplicateAuthors = findDuplicates(loadedAuthors);
      if(duplicateAuthors.length !== 0) {
        toast.add({
          severity: "warn",
          summary: "Duplicate Author",
          detail: "you can not add an author twice; ignoring it",
          life: 5000
        });

        for(let i = duplicateAuthors.length - 1; i >= 0; i--)
          loadedAuthors.splice(i, 1);
      }

      try {
        await FileProcessorWrapper.INSTANCE.createFile(loadedAuthors);
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

  async function reloadStoredAuthors() {
    const self = FileProcessorWrapper.INSTANCE.getIdentity();
    let selfKey: string;
    if(self !== null)
      selfKey = `${self.name} (${self.mail})`;
    else
      selfKey = "";

    storedAuthors.value = Object.entries(await browserStorage.availableAuthors())
        .filter(([k]) => k !== selfKey)
        .map(([k]) => {
          return {
            name: k
          }
        });
  }

  onBeforeMount(async () => {
    await reloadStoredAuthors();
  });
</script>

<style lang="scss" scoped>

</style>
