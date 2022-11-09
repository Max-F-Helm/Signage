<template>
  <div class="flex flex-column row-gap-3">
    <div>
      <RadioButton v-model="choice" inputId="idChoice_mode_upl" name="idChoice_mode" value="upload"/>
      <label class="ml-2" for="idChoice_mode_upl">Upload</label>
    </div>
    <div>
      <RadioButton v-model="choice" inputId="idChoice_mode_new" name="idChoice_mode" value="new"/>
      <label class="ml-2" for="idChoice_mode_upl">New</label>
    </div>
  </div>
</template>

<script lang="ts" setup>
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

<style scoped>

</style>
