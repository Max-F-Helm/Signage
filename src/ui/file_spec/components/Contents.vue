<template>
  <div>
    <div v-for="(frame, idx) of props.frames" :key="idx">
      <div v-if="frame.frameType === FrameType.Addendum">
        <Addendum :val="frame"></Addendum>
      </div>
      <div v-if="frame.frameType === FrameType.Vote">
        <Vote :val="frame"></Vote>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import Addendum from "./Addendum.vue";
  import Vote from "./Vote.vue";
  import type {PropType} from "vue";
  import type Frame from "@/processing/model/Frame";
  import {FrameType} from "@/processing/model/Frame";

  const props = defineProps({
    frames: {
      required: true,
      type: Array as PropType<Frame[]>
    }
  });
</script>

<style lang="scss">
    
</style>
