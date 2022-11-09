<template>
  <div>
    <Card class="mt-5">
      <template #title>
        Addendum - {{ props.val.title }}
      </template>
      <template #content>
        <div class="p-inputgroup grid mt-1">
          <div class="col-2 p-inputgroup-addon">
            Time Stamp
          </div>
          <div class="col p-inputgroup-addon justify-content-start">{{ formattedTimestamp }}</div>
        </div>
        <div class="p-inputgroup grid mt-1">
          <div class="col-2 p-inputgroup-addon">
            User
          </div>
          <div class="col p-inputgroup-addon justify-content-start">{{ props.val.author.name }}</div>
        </div>
        <Panel :collapsed="true" :toggleable="true" class="mt-3">
          <template #title>
            Data
            <!-- TODO download btn -->
          </template>
          <template #content>
            Data Preview to be added
          </template>
        </Panel>
      </template>
    </Card>
  </div>
</template>

<script lang="ts" setup>
  import Card from "primevue/card";
  import Panel from "primevue/panel";
  import type {PropType} from "vue";
  import {computed} from "vue";
  import type Addendum from "@/processing/model/Addendum";
  import {formatDateTime} from "@/ui/utils/utils";

  const props = defineProps({
    val: {
      required: true,
      type: Object as PropType<Addendum>
    }
  });

  const formattedTimestamp = computed(() => {
    return formatDateTime(props.val.timestamp);
  });
</script>

<style lang="scss">

</style>
