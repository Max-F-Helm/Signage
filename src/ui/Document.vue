<template class="max-w-full max-h-full">
  <div>
    <InfoBar></InfoBar>

    <OpenDialog v-model="showOpenDlg"></OpenDialog>
    <FileSpec></FileSpec>
  </div>
</template>

<script lang="ts" setup>
  import OpenDialog from "@/ui/open_dlg/OpenDialog.vue";
  import InfoBar from "@/ui/InfoBar.vue";
  import FileSpec from "@/ui/file_spec/FileSpec.vue";
  import {ref} from "vue";

  const showOpenDlg = ref<boolean>(true);
</script>

<style lang="scss" scoped>

</style>
