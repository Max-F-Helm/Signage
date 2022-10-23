<template>
  <main>
    <Toolbar>
      <template #start>
        <MyButton label="Einverstanden" icon="pi pi-check" @click="voteForLastProposal" class="p-button-success" />
        <MyButton label="Ablehnen" icon="pi pi-trash" @click="rejectLastProposal" class="p-button-danger" />
        <MyButton label="Änderungen vorschlagen" icon="pi pi-file-edit" @click="proposeChanges" class="p-button-secondary" />
      </template>
      <template #end>
        <MyButton label="Patchset importieren" icon="pi pi-upload" @click="importPatchSet" />
        <input ref="fileInput" type="file" @change="onFileChange" style="display: none;">
        <Modal2 v-model="modalStatus"/>
      </template>
    </Toolbar>
  </main>
</template>

<script>
import MyButton from 'primevue/button';
import Toolbar from 'primevue/toolbar';
import Modal2 from "@/components/Modal2.vue";

export default {
  name: "StartPage",
  components:{
    MyButton,
    Toolbar,
    Modal2
  },
  data() {
    return {
      modalStatus: false
    }
  },
  methods: {
    importPatchSet() {
      this.$refs.fileInput.click()
    },
    voteForLastProposal() {
      // TODO: this data should be the patch
      let x = Uint8Array.from([91,68,101,115,107,116,111,112,32,69]);
      let blob = new Blob([x], {type: 'application/octet-stream'});
      let url = URL.createObjectURL(blob);
      //this.download(url, 'myDocument.signage')
      this.download(url, 'Vote.spatch')
      URL.revokeObjectURL(url);

      this.modalStatus = true
    },
    rejectLastProposal() {
      // TODO: this data should be the patch
      let x = Uint8Array.from([91,68,101,115,107,116,111,112,32,69]);
      let blob = new Blob([x], {type: 'application/octet-stream'});
      let url = URL.createObjectURL(blob);
      //this.download(url, 'myDocument.signage')
      this.download(url, 'Vote.spatch')
      URL.revokeObjectURL(url);

      this.modalStatus = true
    },
    proposeChanges() {
      this.$refs.fileInput.click()

      // do patch stuff

      // TODO: this data should be the patch
      let x = Uint8Array.from([91,68,101,115,107,116,111,112,32,69]);
      let blob = new Blob([x], {type: 'application/octet-stream'});
      let url = URL.createObjectURL(blob);
      //this.download(url, 'myDocument.signage')
      this.download(url, 'Vote.spatch')
      URL.revokeObjectURL(url);

      this.modalStatus = true
    },
    onFileChange(e) {
      let files = e.target.files || e.dataTransfer.files
      if (!files.length)
        return;

      files[0].arrayBuffer().then(buff => {
        let x = new Uint8Array(buff);
      });
    },
    download(path, filename) {
      // TODO: move this to some util file later
      let anchor = document.createElement('a');
      anchor.href = path;
      anchor.download = filename;

      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    }
  }
}
</script>

<style scoped>
  .p-toolbar {
    border-radius: 0;
    border: none;
  }
  button {
    margin: .3rem;
  }
</style>
