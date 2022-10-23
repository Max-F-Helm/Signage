<template>
  <div>
    <h3>Addendum</h3>
    <div>
      Author: {{modelValue.author.name}}
    </div>
    <div>
      Time: {{new Date(modelValue.timestamp)}}
    </div>
    <div>
      Content: {{contentStr}}
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import type {PropType} from "vue";
import type Addendum from "@/processing/model/Addendum";
import {Buffer} from "buffer";

export default defineComponent({
  name: "AddendumFrame",
  components: {},
  props: {
    modelValue: {
      required: true,
      type: Object as PropType<Addendum>
    }
  },
  computed: {
    contentStr(): string {
      return Buffer.from(this.modelValue.data).toString("hex");
    }
  }
});
</script>

<style scoped>

</style>
