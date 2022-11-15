<template>
  <PButton icon="pi pi-bars" @click="open = true" class="p-button-outlined mb-2"/>
  <Sidebar v-model:visible="open" position="left" :modal="true" :dismissable="true" class="p-sidebar-sm">
    <PanelMenu :model="menuItems"></PanelMenu>
  </Sidebar>

  <InfoPopup v-model="showInfo"></InfoPopup>
</template>

<script setup lang="ts">
  import {onBeforeUnmount, onMounted, ref} from "vue";
  import PButton from "primevue/button";
  import Sidebar from "primevue/sidebar";
  import PanelMenu from "primevue/panelmenu";
  import type {MenuItem} from "primevue/menuitem";
  import InfoPopup from "@/ui/menu_panel/InfoPopup.vue";
  import FileProcessorWrapper from "@/FileProcessorWrapper";

  const emit = defineEmits(["do:showOpenDlg", "do:showSaveDlg", "do:showAuthorsDlg"]);

  const open = ref(false);
  const disableFileActions = ref(true);
  const showInfo = ref(false);

  const menuItems = ref<MenuItem[]>([
    {
      key: "main-file",
      label: "File",
      icon: "pi pi-file",
      items: [
        {
          key: "main-file-open",
          label: "Open / Create",
          icon: "pi pi-file-import",
          command: onFileOpen
        },
        {
          key: "main-file-save",
          label: "Save",
          icon: "pi pi-file-export",
          disabled: disableFileActions as unknown as boolean,
          command: onFileSave
        },
        {
          key: "main-file-import_patchset",
          label: "Import Patchset",
          icon: "pi pi-file-import",
          disabled: disableFileActions as unknown as boolean,
          command: onFileImportPatchset
        }
      ]
    },
    {
      key: "main-identities",
      label: "Identities",
      icon: "pi pi-users",
      items: [
        {
          key: "main-identities-manage_authors",
          label: "Manege Authors",
          icon: "pi pi-users",
          command: onIdentitiesManageAuthors
        },
        {
          key: "main-identities-export_author",
          label: "Save own Author",
          icon: "pi pi-file-export",
          command: onIdentitiesExportAuthor
        },
        {
          key: "main-identities-export_identity",
          label: "Save own Identity",
          icon: "pi pi-file-export",
          command: onIdentitiesExportIdentity
        },

      ]
    },
    {
      key: "main-info",
      label: "info",
      icon: "pi pi-info-circle",
      command: onShowInfo
    }
  ]);

  function onFileOpen() {
    emit("do:showOpenDlg");
  }

  function onFileSave() {
    emit("do:showSaveDlg");
  }

  function onFileImportPatchset() {

  }

  function onIdentitiesManageAuthors() {

  }

  function onIdentitiesExportAuthor() {

  }

  function onIdentitiesExportIdentity() {

  }

  function onShowInfo() {
    showInfo.value = true;
  }

  function checkFileLoaded() {
    disableFileActions.value = !FileProcessorWrapper.INSTANCE.isFileLoaded();
  }

  onMounted(() => {
    FileProcessorWrapper.INSTANCE.addListener(checkFileLoaded);
    checkFileLoaded();
  });
  onBeforeUnmount(() => {
    FileProcessorWrapper.INSTANCE.removeListener(checkFileLoaded);
  });
</script>

<style scoped lang="scss">

</style>
