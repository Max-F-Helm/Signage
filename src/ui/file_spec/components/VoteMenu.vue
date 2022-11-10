<template>
  <Card>
    <template #title>
      Vote for latest addendum
    </template>

    <template #content>
      <div class="flex flex-row">
        <PButton @click="onVoteAccept" :disabled="disabled"
                 icon="pi pi-check" class="p-button-success flex-grow-1 mr-1">Accept</PButton>
        <SplitButton @click="onVoteReject" :disabled="disabled"
                     label="Reject" icon="pi pi-times"
                     :model="rejectBtnOptions" class="p-button-danger flex-grow-1"></SplitButton>
      </div>

      <AddAddendumDlg v-model="showAddDlg" @loaded="onAddDlgLoaded" @error="onAddDlgError"></AddAddendumDlg>
    </template>
  </Card>
</template>

<script setup lang="ts">
import PButton from "primevue/button";
import SplitButton from "primevue/splitbutton";
import Card from "primevue/card";
import { useToast } from "primevue/usetoast";
import {onMounted, onUnmounted, ref} from "vue";
import type {MenuItem} from "primevue/menuitem";
import FileProcessorWrapper from "@/FileProcessorWrapper";
import {FrameType} from "@/processing/model/Frame";
import type Vote from "@/processing/model/Vote";
import IdentityProcessor from "@/processing/identity-processor";
import AddAddendumDlg from "@/ui/file_spec/components/AddAddendumDlg.vue";
import type {NewAddendumData} from "@/ui/file_spec/Helpers";

const fileProcessor = FileProcessorWrapper.INSTANCE;
const toast = useToast();

const rejectBtnOptions: MenuItem[] = [
  {
    label: "Reject and add new Addendum",
    icon: "pi pi-file",
    command: onVoteRejectAndAddAddendum
  }
];

const disabled = ref<boolean>(true);
const showAddDlg = ref<boolean>(false);

function onVoteAccept() {
  try {
    fileProcessor.addVote(true);
  } catch (e: any) {
    showErrToast("Error while performing vote", e);
  }
}

function onVoteReject() {
  try {
    fileProcessor.addVote(false);
  } catch (e: any) {
    showErrToast("Error while performing vote", e);
  }
}

function onVoteRejectAndAddAddendum() {
  onVoteReject();
  showAddDlg.value = true;
}

function onAddDlgLoaded(data: NewAddendumData) {
  try {
    fileProcessor.addAddendum(data.title, data.mime, data.content);
  } catch (e) {
    showErrToast("Error while adding addendum", e);
  }
}

function onAddDlgError(e: any) {
  showErrToast("Error while loading file", e);
}

function showErrToast(summary: string, e: any) {
  toast.add({
    severity: "error",
    summary: summary,
    detail: e != null ? e.toString() : "unknown reason",
    life: 5000
  });
}

function reloadDisabledStat() {
  if(fileProcessor.isFileLoaded()) {
    // check if already voted
    const identity = fileProcessor.getIdentity();
    if(identity === null) {
      disabled.value = true;
      return;
    }

    const frames = fileProcessor.getProposal().frames;
    let voted = false;
    let addendumExists = false;
    for(let i = frames.length - 1; i >= 0; i--) {
      if(frames[i].frameType === FrameType.Vote) {
        const vote = frames[i] as Vote;
        if(IdentityProcessor.equals(vote.author, identity))
          voted = true;
      } else if(frames[i].frameType === FrameType.Addendum) {
        addendumExists = true;
        break;
      }
    }

    disabled.value = !addendumExists || voted;
  } else {
    disabled.value = true;
  }
}

onMounted(() => {
  fileProcessor.addListener(reloadDisabledStat);
  reloadDisabledStat();
});
onUnmounted(() => {
  fileProcessor.removeListener(reloadDisabledStat);
});
</script>

<style scoped lang="scss">

</style>
