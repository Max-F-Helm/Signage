<template>
  <main>
    <DocumentHistory :model-value="frames" />
    <DocumentToolbar class="toolbar" />
  </main>
</template>

<script setup lang="ts">
import DocumentHistory from '../components/DocumentHistory.vue'
import DocumentToolbar from '../components/DocumentToolbar.vue'
import {onBeforeMount, onBeforeUnmount, ref} from "vue";
import type Frame from "@/processing/model/Frame";
import {fileProcessorWrapper} from "@/FileProcessorWrapper";

const frames = ref<Frame[]>([]);

function updateFrames() {
  if(fileProcessorWrapper.isFileLoaded())
    frames.value = fileProcessorWrapper.getProposal().frames;
}

onBeforeMount(() => {
  fileProcessorWrapper.addListener(updateFrames);
  updateFrames();
});

onBeforeUnmount(() => {
  fileProcessorWrapper.removeListener(updateFrames);
});
</script>

<style scoped>
  .toolbar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    box-shadow: 0 0 1rem rgba(0,0,0,.3);
    z-index: 5;
  }
</style>
