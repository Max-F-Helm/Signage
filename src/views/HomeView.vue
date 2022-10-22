<script setup lang="ts">
import DocumentHistory from '../components/DocumentHistory.vue'
import DocumentToolbar from '../components/DocumentToolbar.vue'

</script>

<template>
  <main>
    <DocumentHistory />
    <DocumentToolbar class="toolbar" />
  </main>
</template>

<style scoped>
  .toolbar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    box-shadow: 0 0 1rem rgba(0,0,0,.3);
    z-index: 999999;
  }
</style>
