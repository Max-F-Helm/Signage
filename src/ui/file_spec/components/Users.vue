<template>
  <div>
    <Panel :toggleable="true" header="Users">
      <DataTable :value="data" responsive-layout="scroll">
        <Column field="name" header="Username"/>
        <Column field="mail" header="E-Mail"/>
        <Column field="publicKey" header="Public Key"/>
      </DataTable>
    </Panel>
  </div>
</template>

<script lang="ts" setup>
  import DataTable from "primevue/datatable";
  import Column from "primevue/column";
  import Panel from "primevue/panel";

  import {Buffer} from "buffer";

  import type {PropType} from "vue";
  import {computed} from "vue";
  import type Author from "@/processing/model/Author";

  const props = defineProps({
    authors: {
      required: true,
      type: Array as PropType<Author[]>
    }
  });

  const data = computed(() => {
    return props.authors.map(author => {
      return {
        name: author.name,
        mail: author.mail,
        publicKey: formatPublicKey(author)
      };
    });
  });

  function formatPublicKey(author: Author): string {
    const bytes = Buffer.from(author.keypair.publicKey);
    return bytes.toString("hex").toUpperCase();
  }
</script>

<style lang="scss">

</style>
