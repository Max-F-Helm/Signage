<template>
  <div>
    <Card :class="cardClass">
      <template #title>
        Vote - {{ props.val.author.name }} ({{ props.val.author.mail }})
      </template>
      <template #content>
        <div class="p-inputgroup grid mx-0 mt-1">
          <div class="col-2 p-inputgroup-addon">
            Time Stamp
          </div>
          <div class="col p-inputgroup-addon justify-content-start">
            {{ formattedTimestamp }}
          </div>
        </div>
        <div class="grid p-inputgroup mx-0 mt-1">
          <div class="col-2 p-inputgroup-addon">
            Author
          </div>
          <div class="col p-inputgroup-addon justify-content-start">
            {{ props.val.author.name }}
            ({{ props.val.author.mail }})
          </div>
        </div>
        <div class="grid p-inputgroup mx-0 mt-1">
          <div class="col-2 p-inputgroup-addon">
            Vote
          </div>
          <div class="col p-inputgroup-addon justify-content-start">
            {{ props.val.vote ? "accepted" : "rejected" }}
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script lang="ts" setup>
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

  const cardClass = computed(() => {
    const classes = "mt-1 border-3 ";
    return classes + (props.val.vote ? "border-green-900" : "border-red-900");
  });
</script>

<style lang="scss">

</style>
