<template>
  <div class="p-1">
    <Toast></Toast>
    <RouterView />
  </div>
</template>

<script setup lang="ts">
  import { RouterView } from 'vue-router';
  import Toast from "primevue/toast";
</script>

<style scoped lang="scss">

</style>
