<template>
  <Dialog
    v-model:visible="show"
    :closable="true"
    :modal="false"
    header="Save Changes"
  >
    Do you want to save the changes?
    <div class="flex flex-row mt-1">
      <PButton @click="onSavePatches" :disabled="!unsavedPatch" class="w-12rem justify-content-center">Save Patchset</PButton>
      <div class="flex-grow-1 mx-1"></div>
      <PButton @click="onSaveProposal" class="w-12rem justify-content-center">Save Proposal</PButton>
      <template v-if="fileProcessor.storageName !== null">
        <div class="flex-grow-1 mx-1"></div>
        <PButton @click="onSaveProposalToStorage" class="w-12rem justify-content-center">Update in Storage</PButton>
      </template>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
  import {computed, ref, watch} from "vue";
  import PButton from "primevue/button";
  import Dialog from "primevue/dialog";
  import FileProcessorWrapper from "@/FileProcessorWrapper";
  import Bill from "@/processing/bill";
  import {download} from "@/ui/utils/utils";
  import {useToast} from "primevue/usetoast";
  import BrowserStorage from "@/BrowserStorage";

  const props = defineProps({
    modelValue: {
      required: true,
      type: Boolean
    }
  });

  const emit = defineEmits(["update:modelValue"]);

  const fileProcessor = FileProcessorWrapper.INSTANCE;
  const toast = useToast();

  const patchExported = ref<boolean>(false);
  const unsavedPatch = ref(false);

  const show = computed({
    get() {
      return props.modelValue;
    },
    set(newVal) {
      emit("update:modelValue", newVal);
    }
  });

  watch(show, (showing) => {
    if(showing) {
      unsavedPatch.value = fileProcessor.getChangesCount() > 0;
    } else {
      if(patchExported.value) {
        patchExported.value = false;
        fileProcessor.clearChanges();
      }
    }
  });

  async function onSaveProposal() {
    try {
      const data = await fileProcessor.saveFile();
      const dataEnc = await Bill.encrypt(data, fileProcessor.getKey()!);
      download(dataEnc, "proposal.sDoc");
    } catch (e) {
      console.error("unable to save proposal: saveFile failed", e);
      showErrToast("Error while saving file", e);
    }
  }

  async function onSaveProposalToStorage() {
    try {
      const name = fileProcessor.storageName.value!;
      const storedProposals = await BrowserStorage.INSTANCE.availableProposals();
      if(!storedProposals.hasOwnProperty(name)) {
        // seems like it was deleted in the meantime
        fileProcessor.storageName.value = null;

        console.warn("proposal was deleted from storage while in use");
        showErrToast("proposal was deleted from storage", null);

        return;
      }
      const encrypted = storedProposals[name].encryptionKey !== null;

      await BrowserStorage.INSTANCE.saveProposal(fileProcessor, encrypted);

      toast.add({
        severity: "success",
        summary: "saved to storage",
        life: 5000
      });
    } catch (e) {
      console.error("unable to store proposal: saveProposal failed", e);
      showErrToast("Error while storing file", e);
    }
  }

  async function onSavePatches() {
    try {
      const data = await fileProcessor.exportChanges();
      const dataEnc = await Bill.encrypt(data, fileProcessor.getKey()!);
      download(dataEnc, "changes.sPatch");
      patchExported.value = true;
    } catch (e) {
      console.error("unable to save proposal: saveFile failed", e);
      showErrToast("Error while saving file", e);
    }
  }

  function showErrToast(summary: string, e: any) {
    toast.add({
      severity: "error",
      summary: summary,
      detail: e != null ? e.toString() : "unknown reason",
      life: 5000
    });
  }
</script>

<style scoped lang="scss">

</style>
