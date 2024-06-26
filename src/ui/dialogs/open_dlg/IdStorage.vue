<template>
  <div>
    <div class="mb-2 ml-2">
      <PButton icon="pi pi-replay" class="p-button-rounded p-button-outlined p-button-secondary" @click="reloadEntries" />
      <div class="flex-grow-1" />
    </div>
    <div class="flex flex-column row-gap-3">
      <DataTable
        v-model:selection="selectedEntry"
        :value="entries"
        selection-mode="single"
        :row-hover="true"
        :scrollable="true"
        scroll-height="16rem"
        @row-select="onSelect"
      >
        <Column field="name" header="Name + Mail" :sortable="true" />
        <Column field="encrypted" header="Encrypted" class="colCryptStat">
          <template #body="slotProps">
            <div v-if="slotProps.data.encryptionKey === null" class="pi pi-lock" />
            <div v-else class="pi pi-lock-open" />
          </template>
        </Column>
        <Column class="colDel">
          <template #body="slotProps">
            <PButton icon="pi pi-trash" class="p-button-rounded p-button-outlined p-button-danger"
                     @click="() => onDel(slotProps.data.name)" />
          </template>
        </Column>
      </DataTable>

      <div class="p-inputgroup">
        <span class="p-inputgroup-addon">
          <i class="pi pi-lock" />
        </span>
        <Password
          ref="refPasswdInp"
          v-model="passwd"
          :feedback="false"
          placeholder="Password"
          :disabled="!passwordRequired"
          @keyup.enter="onPasswdImpEnter"
        />
      </div>

      <div>
        <PButton :disabled="selectedEntry === null" @click="onLoad">Load</PButton>
        <div class="flex-grow-1" />
      </div>

      <div v-show="errorMsg.length !== 0" class=" p-inline-message p-inline-message-error">
        {{ errorMsg }}
      </div>
      <div v-show="success" class="p-inline-message p-inline-message-success">
        Identity loaded
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, ref, watch, onBeforeMount} from "vue";
  import DataTable from "primevue/datatable";
  import Column from "primevue/column";
  import PButton from "primevue/button";
  import Password from "primevue/password";
  import BrowserStorage from "@/BrowserStorage";
  import Bill from "@/processing/bill";
  import FileProcessorWrapper from "@/FileProcessorWrapper";

  interface Entry {
    name: string,
    encryptionKey: Uint8Array | null
  }

  const emit = defineEmits(["update:ready"]);

  const errorMsg = ref("");
  const entries = ref<Entry[]>([]);
  const selectedEntry = ref<Entry | null>(null);
  const passwd = ref("");
  const refPasswdInp = ref();

  const success = ref(false);
  watch(success, () => {
    emit("update:ready", success.value);
  });

  const passwordRequired = computed(() => {
    return selectedEntry.value !== null && selectedEntry.value.encryptionKey === null;
  });

  function onSelect() {
    if(passwordRequired.value)
      refPasswdInp.value?.$refs.input.$el.focus();
  }

  async function onPasswdImpEnter() {
    if(selectedEntry.value !== null)
      await onLoad();
  }

  async function onDel(name: string) {
    await BrowserStorage.INSTANCE.removeIdentity(name);
    await reloadEntries();
  }

  async function onLoad() {
    success.value = false;
    errorMsg.value = "";

    try {
      let cipherKey: Uint8Array;
      if(passwordRequired.value) {
        cipherKey = await Bill.digest_pwd(passwd.value);
      } else {
        cipherKey = selectedEntry.value!.encryptionKey!;
      }

      const identity = await BrowserStorage.INSTANCE.loadIdentity(selectedEntry.value!.name, cipherKey);

      FileProcessorWrapper.INSTANCE.setIdentity(identity);
      FileProcessorWrapper.INSTANCE.init();

      success.value = true;
    } catch (e) {
      console.error("unable to load identity from storage", e);
      if(passwordRequired.value)
        errorMsg.value = "there was an error while loading the identity (was the password correct?)";
      else
        errorMsg.value = "there was an error while loading the identity";
    }
  }

  async function reloadEntries() {
    entries.value = Object.entries(await BrowserStorage.INSTANCE.availableIdentities()).map(([k, v]) => {
      return {
        name: k,
        encryptionKey: v.encryptionKey
      }
    });
  }

  onBeforeMount(async () => {
    await reloadEntries();
  });
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
