<template>
  <div class="flex flex-column row-gap-3">
    <div>
      <RadioButton v-model="choice" inputId="docChoice_mode_sto" name="idChoice_mode" value="storage"/>
      <label class="ml-2" for="docChoice_mode_sto">Select Stored</label>
    </div>
    <div>
      <RadioButton v-model="choice" inputId="docChoice_mode_upl" name="idChoice_mode" value="upload"/>
      <label class="ml-2" for="docChoice_mode_upl">Upload</label>
    </div>
    <div>
      <RadioButton v-model="choice" inputId="docChoice_mode_new" name="idChoice_mode" value="new"/>
      <label class="ml-2" for="docChoice_mode_new">New</label>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import {ref, watch} from "vue";
  import RadioButton from "primevue/radiobutton";

  const emit = defineEmits(["update:choice"]);

  const choice = ref("storage");

  watch(choice, () => {
    emit("update:choice", choice.value);
  }, {
    immediate: true
  });
</script>

<style lang="scss" scoped>

</style>
