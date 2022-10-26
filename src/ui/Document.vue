<template class="max-w-full max-h-full">
  <div>
    <OpenDialog :model-value="true"></OpenDialog>

    <PButton class="p-button-outlined" icon="pi pi-arrow-right" @click="visibleLeft = true" />
    <Sidebar class="p-sidebar-md" v-model:visible="visibleLeft" :baseZIndex="10000">
      <h3>Projekt Informationen</h3><br>
      <p>
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
      </p>
    </Sidebar>
    <div class="grid mt-1">
      <div class="col-5">
        <div class="flex justify-content-center gap-3 w-full">
          <PButton class="w-6" label="Neues Dokument" />
          <PButton class="w-6" label="Vorhandenes Dokument" />
        </div>
      </div>
      <div class="col-1"/>
      <div class="col-6">
        <div v-if="documentState" id="newDocument">
          <h1>Persönliche Daten eintragen</h1>
          <div class="grid">
            <div class="col-12">
              <div class="p-inputgroup">
                <span class="p-inputgroup-addon">
                  <i class="pi pi-user"></i>
                </span>
                <InputText placeholder="Name"/>
              </div>
            </div>
            <div class="col-12">
              <div class="p-inputgroup">
                <span class="p-inputgroup-addon">
                  <i class="pi pi-inbox"></i>
                </span>
                <InputText placeholder="Email"/>
              </div>
            </div>
            <div class="col-12">
              <div class="p-inputgroup">
                <span class="p-inputgroup-addon">
                  <i class="pi pi-lock"></i>
                </span>
                <Password v-model="passwordValue" :feedback="false" placeholder="Passwort"/>
              </div>
            </div>
            <div class="col-12 flex justify-content-end">
              <PButton class="w-3 p-button-success" label="Identität Laden"/>
            </div>
          </div>
        </div>
        <div v-else id="existingDocument">
          <h1>Existierendes Dokument</h1>
          <FileUpload name="document[]" url="" @upload="" :multiple="false" accept="document/*" :maxFileSize="1000000" @select="" :showUploadButton="false" :showCancelButton="false">
            <template #content>
              <ul v-if="uploadedFiles && uploadedFiles[0]">
                <li v-for="file of uploadedFiles[0]" :key="file">{{ file.name }} - {{ file.size }} bytes</li>
              </ul>
            </template>
            <template #empty>
              <p>Ziehe ein Dokument hierher um es hochzuladen.</p>
            </template>
          </FileUpload>
          <div class="grid mt-1">
            <div class="col-12">
              <div class="p-inputgroup">
                <span class="p-inputgroup-addon">
                  <i class="pi pi-lock"></i>
                </span>
                <Password v-model="passwordValue" :feedback="false" placeholder="Passwort"/>
              </div>
            </div>
            <div class="col-12 flex justify-content-end">
              <PButton class="w-3 p-button-success" label="Identität Laden"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from "vue";

import PButton from "primevue/button";
import Sidebar from "primevue/sidebar";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import FileUpload from "primevue/fileupload";

import OpenDialog from "@/ui/open_dlg/OpenDialog.vue";

const visibleLeft = ref(false);
let documentState: boolean = false;
const passwordValue = ref();
const uploadedFile = ref([]);
const files = ref([]);
</script>

<style scoped lang="scss">

</style>
