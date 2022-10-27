<template>
  <div class="flex flex-column row-gap-3">
    <div>
      <RadioButton value="upload" v-model="choice" name="idChoice_mode" inputId="idChoice_mode_upl" />
      <label for="idChoice_mode_upl" class="ml-2">Upload</label>
    </div>
    <div>
      <RadioButton value="new" v-model="choice" name="idChoice_mode" inputId="idChoice_mode_new" />
      <label for="idChoice_mode_upl" class="ml-2">New</label>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, watch} from "vue";
import RadioButton from "primevue/radiobutton";

const emit = defineEmits(["update:choice"]);

const choice = ref("upload");

watch(choice, () => {
  emit("update:choice", choice.value);
}, {
  immediate: true
});
</script>

<style scoped lang="scss">

</style>
