<template class="max-w-full max-h-full">
  <div>
    <MenuPanel
      @do:show-open-dlg="showOpenDlg = true"
      @do:show-save-dlg="showSaveDlg = true"
      @do:show-authors-dlg="showAuthorsDlg = true"
    />

    <FileSpec @do:show-save-dlg="showSaveDlg = true" />

    <OpenDialog v-model="showOpenDlg" />
    <SaveChangesDlg v-model="showSaveDlg" />
    <ManageAuthorsDlg v-model="showAuthorsDlg" />
  </div>
</template>

<script lang="ts" setup>
  import {ref} from "vue";
  import OpenDialog from "@/ui/dialogs/open_dlg/OpenDialog.vue";
  import FileSpec from "@/ui/file_spec/FileSpec.vue";
  import MenuPanel from "@/ui/menu_panel/MenuPanel.vue";
  import SaveChangesDlg from "@/ui/dialogs/SaveChangesDlg.vue";
  import ManageAuthorsDlg from "@/ui/dialogs/ManageAuthorsDlg.vue";

  const showOpenDlg = ref(true);
  const showSaveDlg = ref(false);
  const showAuthorsDlg = ref(false);
</script>

<style lang="scss" scoped>

</style>
