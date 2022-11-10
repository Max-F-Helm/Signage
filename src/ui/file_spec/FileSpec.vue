<template>
  <div>
    <Users :authors="authors"></Users>
    <Contents :frames="frames"></Contents>
    <VoteMenu></VoteMenu>
  </div>
</template>

<script lang="ts" setup>
  import Users from "./components/Users.vue";
  import Contents from "./components/Contents.vue"
  import {onMounted, onUnmounted, ref} from "vue";
  import FileProcessorWrapper from "@/FileProcessorWrapper";
  import type Author from "@/processing/model/Author";
  import type Frame from "@/processing/model/Frame";
  import VoteMenu from "@/ui/file_spec/components/VoteMenu.vue";
  import debounce from "debounce";
  import {useToast} from "primevue/usetoast";

  const fileProcessor = FileProcessorWrapper.INSTANCE;
  const toast = useToast();

  const authors = ref<Author[]>([]);
  const frames = ref<Frame[]>([]);

  function reloadContent() {
    if (fileProcessor.isFileLoaded()) {
      const proposal = fileProcessor.getProposal();
      authors.value = [...proposal.authors];
      frames.value = [...proposal.frames];
    } else {
      authors.value = [];
      frames.value = [];
    }
  }

  const errToast = debounce(() => {
    toast.add({
      severity: "error",
      summary: "The Proposal seems corrupted",
      detail: "for error-details open the browser-console",
      life: 5000
    });
  }, 1000);
  function onError(e: string) {
    console.error("error in FileProcessor: ", e);
    errToast();
  }

  onMounted(() => {
    fileProcessor.addListener(reloadContent);
    fileProcessor.addErrListener(onError)
    reloadContent();
  });
  onUnmounted(() => {
    fileProcessor.removeListener(reloadContent);
    fileProcessor.removeErrListener(onError);
    errToast.flush();
    errToast.clear();
  });
</script>

<style lang="scss">

</style>
