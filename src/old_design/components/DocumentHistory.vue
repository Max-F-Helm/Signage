<template>
  <div v-for="(frame, idx) of modelValue" :key="idx">
    <div :class="(((idx & 1) === 0) ? 'bg-white' : 'bg-gray-50') + ' px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'">
      <addendum-frame v-if="isAddendum(frame)" :model-value="frame"></addendum-frame>
      <vote-frame v-if="isVote(frame)" :model-value="frame"></vote-frame>
    </div>
  </div>
</template>

<script lang="ts">
import type {PropType} from "vue";
import {defineComponent} from "vue";
import type Frame from "@/processing/model/Frame";
import {FrameType} from "@/processing/model/Frame";
import AddendumFrame from "@/components/AddendumFrame.vue";
import VoteFrame from "@/components/VoteFrame.vue";

export default defineComponent({
  name: "DocumentHistory",
  components: {
    AddendumFrame, VoteFrame
  },
  props: {
    modelValue: {
      required: true,
      type: Array as PropType<Frame[]>
    }
  },
  data() {
    return {}
  },
  methods: {
    isAddendum(frame: Frame): boolean {
      return frame.frameType === FrameType.Addendum;
    },
    isVote(frame: Frame): boolean {
      return frame.frameType === FrameType.Vote;
    }
  }
});
</script>

<style scoped>

</style>
