<template>
  <div>
    <h4>Vote</h4>
    <div>
      Author: {{modelValue.author.name}}
    </div>
    <div>
      Time: {{new Date(modelValue.timestamp)}}
    </div>
    <div>
      Vote: {{modelValue.vote}}
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import type {PropType} from "vue";
import type Vote from "@/processing/model/Vote";

export default defineComponent({
  name: "VoteFrame",
  components: {},
  props: {
    modelValue: {
      required: true,
      type: Object as PropType<Vote>
    }
  }
});
</script>

<style scoped>

</style>
