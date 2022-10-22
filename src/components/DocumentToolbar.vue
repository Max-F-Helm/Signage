<template>
  <main>
    <Toolbar>
      <template #start>
        <MyButton label="Vote für letzten Vorschlag" icon="pi pi-check" @click="loadLatestDocument" class="p-button-success" />
      </template>
      <template #end>
        <MyButton label="Patchset importieren" icon="pi pi-upload" @click="loadLatestDocument" />
      </template>
    </Toolbar>
  </main>
</template>

<script>
import MyButton from 'primevue/button';
import Toolbar from 'primevue/toolbar';
export default {
  name: "StartPage",
  components:{
    MyButton,
    Toolbar
  },
  data() {
    return {}
  },
  methods: {}
}
</script>

<style scoped>
  Toolbar {
    border-radius: 0;
    border: none;
  }
</style>
