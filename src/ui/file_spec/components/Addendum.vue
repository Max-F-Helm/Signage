<template>
  <div>
    <Card class="mt-5">
      <template #title>
        Addendum - {{ props.val.title }}
      </template>
      <template #content>
        <div class="p-inputgroup grid mx-0 mt-1">
          <div class="col-2 p-inputgroup-addon">
            Time Stamp
          </div>
          <div class="col p-inputgroup-addon justify-content-start">{{ formattedTimestamp }}</div>
        </div>
        <div class="p-inputgroup grid mx-0 mt-1">
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

          <div v-if="isText">
            {{asText()}}
          </div>
          <div v-else-if="isImage" class="flex justify-content-center">
            <Image :src="asBlob()" alt="invalid image" :preview="true" imageClass="max-h-24rem"></Image>
          </div>
          <div v-else-if="isPdf">
            <!-- TODO -->
          </div>
          <div v-else class="flex justify-content-center font-bold text-xl">
            No preview available
          </div>
        </Panel>
      </template>
    </Card>
  </div>
</template>

<script lang="ts" setup>
  import Card from "primevue/card";
  import Panel from "primevue/panel";
  import PButton from "primevue/button";
  import Image from "primevue/image";
  import type {PropType} from "vue";
  import {computed} from "vue";
  import type Addendum from "@/processing/model/Addendum";
  import {download, formatDateTime} from "@/ui/utils/utils";
  import {Buffer} from "buffer";

  const props = defineProps({
    val: {
      required: true,
      type: Object as PropType<Addendum>
    }
  });

  const formattedTimestamp = computed(() => {
    return formatDateTime(props.val.timestamp);
  });

  const isText = computed(() => {
    const mime = props.val.type;
    return mime.startsWith("text/")
        || mime.startsWith("application/xml");
    //TODO add more text-like types
  });
  const isImage = computed(() => {
    const mime = props.val.type;
    return mime.startsWith("image/");
  });
  const isPdf = computed(() => {
    const mime = props.val.type;
    return mime.startsWith("application/pdf")
        || mime.startsWith("application/x-pdf");
  });

  function onDownload() {
    //TODO infer file-extension from mime (if title has no extension)
    download(props.val.data, props.val.title);
  }

  function asText(): string {
    return Buffer.from(props.val.data).toString("utf-8");
  }
  function asBlob(): string {
    const frame = props.val;
    const base64 = Buffer.from(frame.data).toString("base64");
    return `data:${frame.type};base64,${base64}`;
  }
</script>

<style lang="scss">

</style>
