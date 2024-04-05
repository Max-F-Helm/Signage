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
          <div v-else-if="isPdf" class="flex justify-content-center">
            <iframe :src="asBlob()" class="pdfViewer"></iframe>
          </div>
          <div v-else-if="isAudio" class="flex justify-content-center">
            <audio :src="asBlob()" controls class="w-full mx-2"></audio>
          </div>
          <div v-else-if="isVideo" class="flex justify-content-center">
            <video :src="asBlob()" controls class="max-h-24rem"></video>
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
  import {computed, onUnmounted} from "vue";
  import type Addendum from "@/processing/model/Addendum";
  import {download, formatDateTime} from "@/ui/utils/utils";
  import {Buffer} from "buffer";
  import mime from "mime/lite";

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
        || mime.startsWith("application/xml")
        || mime.startsWith("application/json")
        || mime.startsWith("application/ld+json")
        || mime.startsWith("application/x-httpd-php")
        || mime.startsWith("application/x-sh")
        || mime.startsWith("application/xhtml+xml");
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
  const isAudio = computed(() => {
    return props.val.type.startsWith("audio/");
  });
  const isVideo = computed(() => {
    return props.val.type.startsWith("video/");
  });

  let blobUrl: string | null = null;

  function onDownload() {
    // infer file-extension from mime (if title has no extension)
    let filename = props.val.title;
    if(props.val.type !== "") {
      let hasExtension = true;
      const dotIdx = filename.lastIndexOf(".");
      if(dotIdx > 0 && dotIdx < filename.length - 1) {
        // do not count long extensions
        if((filename.length - (dotIdx + 1)) > 6)
          hasExtension = false;
      } else {
        hasExtension = false;
      }

      if(!hasExtension) {
        const extension = mime.getExtension(props.val.type);
        if(extension !== null)
          filename += "." + extension;
      }
    }

    download(props.val.data, filename);
  }

  function asText(): string {
    return Buffer.from(props.val.data).toString("utf-8");
  }
  function asBlob(): string {
    if(blobUrl !== null)
      URL.revokeObjectURL(blobUrl);

    const addendum = props.val;
    const blob = new Blob([addendum.data], {
      type: addendum.type
    });
    blobUrl = URL.createObjectURL(blob);
    return blobUrl;
  }

  onUnmounted(() => {
    if(blobUrl !== null)
      URL.revokeObjectURL(blobUrl);
  });
</script>

<style lang="scss">
  @import "primeflex/primeflex";

  .pdfViewer {
    @extend .w-full;
    @extend .mx-2;

    height: 90vh;
  }
</style>
