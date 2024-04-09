<template>
  <Dialog
      v-model:visible="show"
      :closable="true"
      :modal="false"
      header="Send Patchset via E-Mail"
  >
    <div>
      <Panel header="Authors to send to" toggleable>
        <template #icons>
          <Button icon="pi pi-check-square" text aria-label="select all authors" @click="checkAllAuthors" />
          <Button icon="pi pi-stop" text aria-label="select no authors" @click="uncheckAllAuthors" />
        </template>

        <DataTable :value="availableAuthors" responsive-layout="scroll">
          <Column field="selected">
            <template #body="{ data }">
              <Checkbox v-model="data.selected" :binary="true" />
            </template>
          </Column>
          <Column field="author.name" header="Username"/>
          <Column field="author.mail" header="E-Mail"/>
        </DataTable>
      </Panel>

      <div class="mt-3 mb-3" v-show="link != ''">
        Other Authors can use this <a :href="link">link</a> to apply the Patchset.
      </div>

      <div class="flex flex-row align-items-end">
        <Button @click="showLink">Generate Link</Button>
        <div class="w-1rem"></div>
        <Button @click="sendMail">Send Mail</Button>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import {reactive, ref, watch} from "vue";
import Dialog from "primevue/dialog";
import Panel from "primevue/panel";
import Button from "primevue/button";
import type Author from "@/processing/model/Author";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Checkbox from "primevue/checkbox";
import FileProcessorWrapper from "@/FileProcessorWrapper";
import {useToast} from "primevue/usetoast";
import libsodium from "libsodium-wrappers-sumo";
import {basePath} from "@/ui/utils";

interface SelectableAuthor {
  author: Author,
  selected: boolean
}

const toast = useToast();
const fileProcessor = FileProcessorWrapper.INSTANCE;

const show = defineModel<boolean>();

const emit = defineEmits<{
  (e: 'done'): void
}>();

const availableAuthors = ref<SelectableAuthor[]>([]);
const link = ref("");
let emitDone = false;

function loadAuthors() {
  availableAuthors.value = fileProcessor.getProposal().authors
      .map(a => reactive(<SelectableAuthor>{ author: a, selected: false }));
}

function checkAllAuthors() {
  availableAuthors.value.forEach(a => a.selected = true);
}

function uncheckAllAuthors() {
  availableAuthors.value.forEach(a => a.selected = false);
}

async function showLink() {
  try {
    await generateLink();
    emitDone = true;
  } catch (e) {
    console.error("unable to save PatchSet: generateLink() failed", e);
    showErrToast("Error while processing patches", e);
  }
}

async function sendMail(){
  try {
    await generateLink()

    const recipients = availableAuthors.value.filter(a => a.selected).map(a => a.author.mail);
    if(recipients.length < 1) {
      toast.add({
        severity: "warn",
        summary: "no recipients were selected",
        life: 3000
      });
      return;
    }

    let cc: string;
    if(recipients.length > 1)
      cc = "cc=" + recipients.slice(1).join(", ");
    else
      cc = "";

    const subject = "Update for Proposal";

    const body = `The Proposal <enter name> was updated. Use the following link to import the Patchset:\n${link.value}`;

    const mailto = `mailto:${recipients[0]}?${cc}&subject=${subject}&body=${encodeURIComponent(body)}`;
    const trigger = document.createElement("a");
    trigger.href = mailto;
    //trigger.click();
    console.log(mailto);

    emitDone = true;
  } catch (e) {
    console.error("unable to save PatchSet: generateLink() failed", e);
    showErrToast("Error while processing patches", e);
  }
}

async function generateLink() {
  const data = await fileProcessor.exportChanges();
  const dataStr = libsodium.to_base64(data, libsodium.base64_variants.URLSAFE);
  const url = `${location.origin}${basePath()}/importPatchset#${dataStr}`;

  link.value = url;
}

function showErrToast(summary: string, e: any) {
  toast.add({
    severity: "error",
    summary: summary,
    detail: e != null ? e.toString() : "unknown reason",
    life: 5000
  });
}

watch(show, (showing) => {
  if(showing) {
    emitDone = false;
    link.value = "";

    loadAuthors();
  } else {
    if(emitDone) {
      emit("done");
    }
  }
});
</script>

<style scoped lang="scss">

</style>
