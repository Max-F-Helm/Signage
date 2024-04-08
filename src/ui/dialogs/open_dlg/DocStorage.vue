<template>
  <div>
    <div class="mb-2 ml-2">
      <PButton icon="pi pi-replay" class="p-button-rounded p-button-outlined p-button-secondary"
               @click="reloadEntries"></PButton>
      <div class="flex-grow-1"></div>
    </div>
    <div class="flex flex-column row-gap-3">
      <DataTable :value="entries"
                 selectionMode="single" v-model:selection="selectedEntry" :rowHover="true"
                 :scrollable="true" scrollHeight="16rem">
        <Column field="name" header="Name" :sortable="true"></Column>
        <Column class="colDel">
          <template #body="slotProps">
            <PButton icon="pi pi-trash" class="p-button-rounded p-button-outlined p-button-danger"
                     @click="() => onDel(slotProps.data.name)"></PButton>
          </template>
        </Column>
      </DataTable>

      <div>
        <PButton @click="onLoad" :disabled="selectedEntry === null">Load</PButton>
        <div class="flex-grow-1"></div>
      </div>

      <div v-show="errorMsg.length !== 0" class=" p-inline-message p-inline-message-error">
        {{ errorMsg }}
      </div>
      <div v-show="success" class="p-inline-message p-inline-message-success">
        Document loaded
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {ref, watch, onBeforeMount} from "vue";
  import DataTable from "primevue/datatable";
  import Column from "primevue/column";
  import PButton from "primevue/button";
  import BrowserStorage from "@/BrowserStorage";
  import FileProcessorWrapper from "@/FileProcessorWrapper";

  interface Entry {
    name: string
  }

  const emit = defineEmits(["update:ready"]);

  const errorMsg = ref("");
  const entries = ref<Entry[]>([]);
  const selectedEntry = ref<Entry | null>(null);

  const success = ref(false);
  watch(success, () => {
    emit("update:ready", success.value);
  });

  async function onDel(name: string) {
    await BrowserStorage.INSTANCE.removeProposal(name);
    await reloadEntries();
  }

  async function onLoad() {
    success.value = false;
    errorMsg.value = "";

    try {
      await BrowserStorage.INSTANCE.loadProposal(selectedEntry.value!.name, FileProcessorWrapper.INSTANCE);

      success.value = true;
    } catch (e) {
      console.error("unable to load proposal from storage", e);
      errorMsg.value = "there was an error while loading the proposal";
    }
  }

  async function reloadEntries() {
    const storedProposals = await BrowserStorage.INSTANCE.availableProposals();
    entries.value = storedProposals.map((name) => {
      return <Entry>{
        name: name
      };
    });
  }

  onBeforeMount(async () => {
    await reloadEntries();
  })
</script>

<style lang="scss">
  .colCryptStat {
    min-width: 12rem;
    max-width: 12rem;
    flex-grow: 0;
    justify-content: center;
  }

  .colDel {
    min-width: 6rem;
    max-width: 6rem;
    flex-grow: 0;
    justify-content: center;
  }
</style>
