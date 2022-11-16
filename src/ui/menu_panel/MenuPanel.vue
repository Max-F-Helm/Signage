<template>
  <PButton icon="pi pi-bars" @click="open = true" class="p-button-outlined mb-2"/>
  <Sidebar v-model:visible="open" position="left" :modal="true" :dismissable="true" class="p-sidebar-sm">
    <PanelMenu :model="menuItems.val"></PanelMenu>
  </Sidebar>

  <InfoPopup v-model="showInfo"></InfoPopup>

  <InputTextDlg v-model="showInpPasswdDlg" mode="password" header="Enter password for save" @result="onPasswordResult"></InputTextDlg>
  <InputFileDlg v-model="showInpFileDlg" mode="single" header="Upload file" @result="onFileResult"></InputFileDlg>
</template>

<script setup lang="ts">
  import {computed, reactive, ref, watch} from "vue";
  import PButton from "primevue/button";
  import Sidebar from "primevue/sidebar";
  import PanelMenu from "primevue/panelmenu";
  import type {MenuItem} from "primevue/menuitem";
  import InfoPopup from "@/ui/menu_panel/InfoPopup.vue";
  import FileProcessorWrapper from "@/FileProcessorWrapper";
  import {useToast} from "primevue/usetoast";
  import InputTextDlg from "@/ui/dialogs/InputTextDlg.vue";
  import InputFileDlg from "@/ui/dialogs/InputFileDlg.vue";
  import type {InputFileDlgResult, InputTextDlgResult} from "@/ui/dialogs/Helpers";
  import BufferWriter from "@/processing/buffer-writer";
  import IdentityProcessor from "@/processing/identity-processor";
  import {download, loadFile} from "@/ui/utils/utils";
  import Bill from "@/processing/bill";
  import BufferReader from "@/processing/buffer-reader";
  import {Buffer} from "buffer";

  const toast = useToast();

  const emit = defineEmits(["do:showOpenDlg", "do:showSaveDlg", "do:showAuthorsDlg"]);

  const open = ref(false);
  const disableFileActions = ref(true);
  const disableIdentityActions = ref(true);
  const showInfo = ref(false);
  const showInpPasswdDlg = ref(false);
  const showInpFileDlg = ref(false);
  /** current action for dlg-callbacks; values: "identityExportPasswd", "patchsetImportFile" */
  const currentAction = ref("");

  //XXX PanelMenu break if it gets items from a computed val
  const computedMenuItems = computed<MenuItem[]>(() => {
    return [
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
            disabled: disableFileActions.value,
            command: onFileSave
          },
          {
            key: "main-file-import_patchset",
            label: "Import Patchset",
            icon: "pi pi-file-import",
            disabled: disableFileActions.value,
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
            disabled: disableIdentityActions.value,
            command: onIdentitiesExportAuthor
          },
          {
            key: "main-identities-export_identity",
            label: "Save own Identity",
            icon: "pi pi-file-export",
            disabled: disableIdentityActions.value,
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
    ];
  });
  const menuItems = reactive({
    val: computedMenuItems.value
  });
  watch(computedMenuItems, (items) => menuItems.val = items);

  watch(open, (open) => {
    if(open) {
      disableFileActions.value = !FileProcessorWrapper.INSTANCE.isFileLoaded();
      disableIdentityActions.value = FileProcessorWrapper.INSTANCE.getIdentity() === null;
    }
  })

  function onFileOpen() {
    open.value = false;
    emit("do:showOpenDlg");
  }

  function onFileSave() {
    open.value = false;
    emit("do:showSaveDlg");
  }

  function onFileImportPatchset() {
    open.value = false;
    currentAction.value = "patchsetImportFile";
    showInpFileDlg.value = true;
  }

  function onIdentitiesManageAuthors() {
    open.value = false;
    emit("do:showAuthorsDlg");
  }

  async function onIdentitiesExportAuthor() {
    try {
      const author = await IdentityProcessor.toAuthor(FileProcessorWrapper.INSTANCE.getIdentity()!);
      const writer = new BufferWriter();
      await IdentityProcessor.saveAuthor(writer, author);
      const authorData = writer.take();
      download(authorData, "author.sAut");
    } catch (e) {
      console.error("error while exporting the current identity as author", e);
      showErrToast("unable to export Author to file", e);
    }
  }

  function onIdentitiesExportIdentity() {
    open.value = false;
    currentAction.value = "identityExportPasswd";
    showInpPasswdDlg.value = true;
  }

  function onShowInfo() {
    open.value = false;
    showInfo.value = true;
  }

  function onPasswordResult(res: InputTextDlgResult) {
    switch (currentAction.value) {
      case "identityExportPasswd": {
        if(res.ok) {
          exportIdentity(res.text);
        }
      }
    }
  }

  function onFileResult(res: InputFileDlgResult) {
    switch (currentAction.value) {
      case "patchsetImportFile": {
        if(res.ok) {
          importPatchset(res.files[0]);
        }
      }
    }
  }

  async function exportIdentity(password: string) {
    try {
      const writer = new BufferWriter();
      await IdentityProcessor.saveIdentity(writer, FileProcessorWrapper.INSTANCE.getIdentity()!);
      let data: Uint8Array = writer.take();

      const key = await Bill.digest_pwd(password);
      data = await Bill.encrypt(data, key);

      download(data, "identity.sIdn");
    } catch (e) {
      console.error("error while exporting the current identity", e);
      showErrToast("unable to export current identity", e);
    }

    currentAction.value = "";
  }

  async function importPatchset(file: File) {
    try {
      let data: Uint8Array = await loadFile(file);
      data = await Bill.decrypt(data, FileProcessorWrapper.INSTANCE.getKey()!);

      await FileProcessorWrapper.INSTANCE.importPatchSet(new BufferReader(Buffer.from(data)));

      toast.add({
        severity: "success",
        summary: "Patchset imported",
        life: 3000
      });
    } catch (e) {
      console.error("error while importing the Patchset", e);
      showErrToast("unable to import the Patchset", e);
    }

    currentAction.value = "";
  }

  function showErrToast(summary: string, e: any) {
    toast.add({
      severity: "error",
      summary: summary,
      detail: e != null ? e.toString() : "unknown reason",
      life: 5000
    });
  }
</script>

<style scoped lang="scss">

</style>
