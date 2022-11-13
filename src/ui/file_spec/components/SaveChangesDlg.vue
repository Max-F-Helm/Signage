<template>
  <Dialog v-model:visible="show" :closable="true" :modal="false" header="Save Changes">
    Do you want to save the changes?
    <div class="flex flex-row mt-1">
      <PButton @click="onSavePatches" class="w-12rem justify-content-center">Save Patchset</PButton>
      <div class="flex-grow-1 mx-1"></div>
      <PButton @click="onSaveProposal" class="w-12rem justify-content-center">Save Proposal</PButton>
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

  const props = defineProps({
    show: {
      required: true,
      type: Boolean
    }
  });

  const emit = defineEmits(["update:show"]);

  const fileProcessor = FileProcessorWrapper.INSTANCE;
  const toast = useToast();

  const show = computed({
    get() {
      return props.show;
    },
    set(newVal) {
      emit("update:show", newVal);
    }
  });

  const patchExported = ref<boolean>(false);
  watch(show, (showing) => {
    if(!showing && patchExported.value) {
      patchExported.value = false;
      fileProcessor.clearChanges();
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
