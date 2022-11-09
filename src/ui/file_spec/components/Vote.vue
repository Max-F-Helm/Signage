<template>
  <div>
    <Card class="mt-5"><!-- TODO make header background matching vote (red / green) -->
      <template #title>
        Vote - {{props.val.author.name}} ({{props.val.author.mail}})
      </template>
      <template #content>
        <div class="p-inputgroup grid mt-1">
          <div class="col-2 p-inputgroup-addon">
            Time Stamp
          </div>
          <div class="col p-inputgroup-addon justify-content-start">{{ formattedTimestamp }}</div>
        </div>
        <div class="grid p-inputgroup mt-1">
          <div class="col-2 p-inputgroup-addon">
            Author
          </div>
          <div class="col p-inputgroup-addon justify-content-start">{{props.val.author.name}} ({{props.val.author.mail}})</div>
        </div>
        <div class="grid p-inputgroup mt-1">
          <div class="col-2 p-inputgroup-addon">
            Vote
          </div>
          <div class="col p-inputgroup-addon justify-content-start">{{props.val.vote ? "accepted" : "rejected"}}</div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
  import Card from "primevue/card";
  import type {PropType} from "vue";
  import {computed} from "vue";
  import {formatDateTime} from "@/ui/utils/utils";
  import type Vote from "@/processing/model/Vote";

  const props = defineProps({
    val: {
      required: true,
      type: Object as PropType<Vote>
    }
  });

  const formattedTimestamp = computed(() => {
    return formatDateTime(props.val.timestamp);
  });
</script>

<style lang="scss">

</style>
