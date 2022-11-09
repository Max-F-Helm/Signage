<template>
  <div>
    <Users :authors="authors"></Users>
    <Contents :frames="frames"></Contents>

    <!-- TODO vote menu -->
  </div>
</template>

<script lang="ts" setup>
  import Users from "./components/Users.vue";
  import Contents from "./components/Contents.vue"
  import {onMounted, onUnmounted, ref} from "vue";
  import FileProcessorWrapper from "@/FileProcessorWrapper";
  import type Author from "@/processing/model/Author";
  import type Frame from "@/processing/model/Frame";

  const fileProcessor = FileProcessorWrapper.INSTANCE;

  const authors = ref<Author[]>([]);
  const frames = ref<Frame[]>([]);

  function reloadContent() {
    if (fileProcessor.isFileLoaded()) {
      const proposal = fileProcessor.getProposal();
      authors.value = proposal.authors;
      frames.value = proposal.frames;
    } else {
      authors.value = [];
      frames.value = [];
    }
  }

  onMounted(() => {
    fileProcessor.addListener(reloadContent);
    reloadContent();
  });
  onUnmounted(() => {
    fileProcessor.removeListener(reloadContent);
  });
</script>

<style lang="scss">

</style>
