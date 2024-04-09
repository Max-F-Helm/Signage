<template>

</template>

<script setup lang="ts">
import {onBeforeMount} from "vue";
import {useToast} from "primevue/usetoast";
import libsodium from "libsodium-wrappers-sumo";
import {Buffer} from "buffer";
import FileProcessorWrapper from "@/FileProcessorWrapper";
import {useRouter} from "vue-router";

const toast = useToast();
const router = useRouter();

onBeforeMount(() => {
  let dataStr = location.hash;
  if(dataStr === "" || dataStr === "#") {
    toast.add({
      severity: "error",
      summary: "No data was given to be imported as a Patchset",
      life: 5000
    });
    navigateToDocumentView();
    return;
  }

  try {
    dataStr = dataStr.substring(1);// remove '#'
    const data = new Buffer(libsodium.from_base64(dataStr, libsodium.base64_variants.URLSAFE));
    FileProcessorWrapper.INSTANCE.addToBeLoadedPatch(data);

    toast.add({
      severity: "success",
      summary: "The Patchset will be imported as soon as you opened the document",
      life: 3000
    });
    navigateToDocumentView();
  } catch(e) {
    console.error("error while reading PatchSet", e);
    toast.add({
      severity: "error",
      summary: "Unable to import Patchset",
      life: 5000
    });
    navigateToDocumentView();
  }
});

function navigateToDocumentView() {
  router.push({ name: "document" });
}
</script>

<style scoped lang="scss">

</style>
