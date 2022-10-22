<script>
export default {
  data() {
    return {
      open: false
    }
  },
  methods:{
    openModal(){
      this.open = true;
    },
    closeModal(){
      this.open = false;
    }
  },
  props: ["modalStatus"],
  watch:{
    modalStatus: function(newVal){
      this.open = newVal
      window.alert("angekommen")
    }
  }
}
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