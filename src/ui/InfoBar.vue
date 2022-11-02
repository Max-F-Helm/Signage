<template>
  <PButton class="p-button-outlined" icon="pi pi-info-circle" @click="visibleLeft = true" />
  <Sidebar class="p-sidebar-md" v-model:visible="visibleLeft" :baseZIndex="10000">
    <h3>Projekt Informationen</h3><br>
    <p>
      Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
    </p>
  </Sidebar>
</template>

<script setup lang="ts">
import PButton from "primevue/button";
import Sidebar from "primevue/sidebar";
import {ref} from "vue";

const visibleLeft = ref(false);
</script>

<style scoped lang="scss">

</style>
