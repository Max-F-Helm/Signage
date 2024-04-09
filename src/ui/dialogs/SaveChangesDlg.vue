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
      <PButton @click="onMailPatches" :disabled="!unsavedPatch" class="w-12rem justify-content-center">Mail Patchset</PButton>
    </div>
    <div class="flex flex-row mt-1">
      <PButton @click="onSaveProposal" class="w-12rem justify-content-center">Save Proposal</PButton>
      <template v-if="fileProcessor.storageName !== null">
        <div class="flex-grow-1 mx-1"></div>
        <PButton @click="onSaveProposalToStorage" class="w-12rem justify-content-center">Update in Storage</PButton>
      </template>
    </div>

    <MailPatchSetDlg v-model="showMailDlg"></MailPatchSetDlg>
  </Dialog>
</template>

<script setup lang="ts">
  import {computed, ref, watch} from "vue";
  import PButton from "primevue/button";
  import Dialog from "primevue/dialog";
  import FileProcessorWrapper from "@/FileProcessorWrapper";
  import {download} from "@/ui/utils/utils";
  import {useToast} from "primevue/usetoast";
  import BrowserStorage from "@/BrowserStorage";
  import MailPatchSetDlg from "@/ui/dialogs/MailPatchSetDlg.vue";

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
  const showMailDlg = ref(false);

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
      download(data, "proposal.sDoc");
    } catch (e) {
      console.error("unable to save proposal: saveFile failed", e);
      showErrToast("Error while saving file", e);
    }
  }

  async function onSaveProposalToStorage() {
    try {
      const name = fileProcessor.storageName.value!;
      const storedProposals = await BrowserStorage.INSTANCE.availableProposals();

      if(!storedProposals.includes(name)) {
        // seems like it was deleted in the meantime
        fileProcessor.storageName.value = null;

        console.warn("proposal was deleted from storage while in use");
        showErrToast("proposal was deleted from storage", null);

        return;
      }

      await BrowserStorage.INSTANCE.saveProposal(fileProcessor);

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
      download(data, "changes.sPatch");

      patchExported.value = true;
    } catch (e) {
      console.error("unable to save PatchSet: exportChanges() failed", e);
      showErrToast("Error while saving patches", e);
    }
  }

  function onMailPatches() {
    showMailDlg.value = true;
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
