<template>
  <main>
    <Toolbar>
      <template #start>
        <MyButton label="Vote für letzten Vorschlag" icon="pi pi-check" @click="" class="p-button-success" />
      </template>
      <template #end>
        <MyButton label="Patchset importieren" icon="pi pi-upload" @click="importPatchSet" />
        <Modal2 :modalStatus="modalStatus"/>
      </template>
    </Toolbar>
  </main>
</template>

<script>
import MyButton from 'primevue/button';
import Toolbar from 'primevue/toolbar';
import Modal2 from "@/components/Modal2";
import Modal from './Modal.vue';
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
      this.modalStatus = true
    }
  }
}
</script>

<style scoped>
  Toolbar {
    border-radius: 0;
    border: none;
  }
</style>
