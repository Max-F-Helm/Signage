<template>
  <Dialog
    v-model:visible="show"
    :modal="true"
    :close-on-escape="true"
    :dismissable-mask="true"
    :closable="true"
    :maximizable="true"
    header="Abut this service"
  >
    <!-- TODO -->
    <div style="max-width: 90vw;">
      Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
      dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita
      kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur
      sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
      voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata
      sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
      eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo
      duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
    </div>
  </Dialog>
</template>

<script setup lang="ts">
 import {computed} from "vue";
 import Dialog from "primevue/dialog";

 const props = defineProps({
   modelValue: {
     required: true,
     type: Boolean
   }
 });

 const emit = defineEmits(["update:modelValue"]);

 const show = computed({
   get(): boolean {
     return props.modelValue;
   },
   set(newVal: boolean) {
     emit("update:modelValue", newVal);
   }
 })
</script>

<style scoped lang="scss">

</style>
