<template class="max-w-full max-h-full">
  <div>
    <OpenDialog :model-value="false"></OpenDialog>

    <InfoBar></InfoBar>
  </div>
</template>

<script setup lang="ts">
import OpenDialog from "@/ui/open_dlg/OpenDialog.vue";
import InfoBar from "@/ui/InfoBar.vue";
</script>

<style scoped lang="scss">

</style>
