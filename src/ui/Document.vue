<template class="max-w-full max-h-full">
  <div>
    <MenuPanel @do:showOpenDlg="showOpenDlg = true"
               @do:showSaveDlg="showSaveDlg = true"
               @do:showAuthorsDlg="showAuthorsDlg = true"></MenuPanel>

    <FileSpec @do:showSaveDlg="showSaveDlg = true"></FileSpec>

    <OpenDialog v-model="showOpenDlg"></OpenDialog>
    <SaveChangesDlg v-model="showSaveDlg"></SaveChangesDlg>
  </div>
</template>

<script lang="ts" setup>
  import {ref} from "vue";
  import OpenDialog from "@/ui/dialogs/open_dlg/OpenDialog.vue";
  import FileSpec from "@/ui/file_spec/FileSpec.vue";
  import MenuPanel from "@/ui/menu_panel/MenuPanel.vue";
  import SaveChangesDlg from "@/ui/dialogs/SaveChangesDlg.vue";

  const showOpenDlg = ref(true);
  const showSaveDlg = ref(false);
</script>

<style lang="scss" scoped>

</style>
