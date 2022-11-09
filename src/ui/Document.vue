<template class="max-w-full max-h-full">
  <div>
    <OpenDialog :model-value="false"></OpenDialog>
    <FileSpec />
    <InfoBar></InfoBar>
  </div>
</template>

<script setup lang="ts">
import OpenDialog from "@/ui/open_dlg/OpenDialog.vue";
import InfoBar from "@/ui/InfoBar.vue";
import FileSpec from "@/ui/file_spec/FileSpec.vue";
</script>

<style scoped lang="scss">

</style>
