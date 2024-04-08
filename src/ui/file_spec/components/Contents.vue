<template>
  <div>
    <div v-for="(frame, idx) of props.frames" :key="idx">
      <div v-if="frame.frameType === FrameType.Addendum">
        <Addendum :val="frame as AddendumFrame" />
      </div>
      <div v-if="frame.frameType === FrameType.Vote">
        <Vote :val="frame as VoteFrame" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import Addendum from "./Addendum.vue";
  import Vote from "./Vote.vue";
  import type AddendumFrame from "@/processing/model/Addendum";
  import type VoteFrame from "@/processing/model/Vote";
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
