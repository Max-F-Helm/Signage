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
          <template #header>
            Data
          </template>
          <template #icons>
            <PButton class="p-panel-header-icon mr-2" @click="onDownload">
              <span class="pi pi-cloud-download"></span>
            </PButton>
          </template>

            Data Preview to be added
        </Panel>
      </template>
    </Card>
  </div>
</template>

<script lang="ts" setup>
  import Card from "primevue/card";
  import Panel from "primevue/panel";
  import PButton from "primevue/button";
  import type {PropType} from "vue";
  import {computed} from "vue";
  import type Addendum from "@/processing/model/Addendum";
  import {download, formatDateTime} from "@/ui/utils/utils";

  const props = defineProps({
    val: {
      required: true,
      type: Object as PropType<Addendum>
    }
  });

  const formattedTimestamp = computed(() => {
    return formatDateTime(props.val.timestamp);
  });

  function onDownload() {
    //TODO infer file-extension from mime (if title has no extension)
    download(props.val.data, props.val.title);
  }
</script>

<style lang="scss">

</style>
