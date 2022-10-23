<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: "Modal2",
  props: {
    modelValue: {
      required: true,
      type: Boolean
    }
  },
  emits: ["update:modelValue"],
  computed: {
    open: {
      get(): boolean {
        return this.modelValue;
      },
      set(v: boolean) {
        this.$emit("update:modelValue", v);
      }
    }
  },
  methods:{
    closeModal(){
      this.open = false;
    }
  }
});
</script>

<template>

    <div v-if="open" class="modal">
      <p>Hello from the modal!</p>
      <button @click="closeModal">Close</button>
    </div>

</template>

<style scoped>
.modal {
  position: fixed;
  z-index: 999;
  top: 20%;
  left: 50%;
  width: 300px;
  margin-left: -150px;
}
</style>
