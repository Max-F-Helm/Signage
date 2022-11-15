<template>
  <Dialog :visible="props.modelValue" @update:visible="onUpdateVisible" :modal="true" :header="props.header">
    <div class="mb-2">{{description}}</div>

    <InputText v-if="props.mode === 'text'" v-model="text" :placeholder="props.placeholder"></InputText>
    <Password v-if="props.mode === 'password'" v-model="text" :placeholder="props.placeholder" :feedback="false"></Password>

    <div class="flex flex-row w-full mt-2">
      <div class="flex-grow-1"></div>
      <PButton @click="onSubmit">OK</PButton>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
  import {ref, watch} from "vue";
  import type {PropType} from "vue";
  import Dialog from "primevue/dialog";
  import PButton from "primevue/button";
  import InputText from "primevue/inputtext";
  import Password from "primevue/password";
  import type {InputTextDlgResult} from "@/ui/dialogs/Helpers";

  const props = defineProps({
    modelValue: {
      required: true,
      type: Boolean
    },
    mode: {
      required: false,
      type: String as PropType<"text" | "password">,
      default: "text"
    },
    header: {
      required: false,
      type: String
    },
    description: {
      required: false,
      type: String,
      default: ""
    },
    placeholder: {
      required: false,
      type: String
    }
  });

  const emit = defineEmits<{
    (event: "result", val: InputTextDlgResult): void,
    (event: "update:modelValue", val: boolean): void
  }>();

  const text = ref("");

  watch(() => props.modelValue, (show) => {
    if(show) {
      text.value = "";
    }
  });

  function onUpdateVisible(visible: boolean) {
    if(!visible) {
      emit("result", {
        ok: false,
        text: ""
      });
    }

    emit("update:modelValue", visible);
  }

  function onSubmit() {
    emit("result", {
      ok: true,
      text: text.value
    });
    emit("update:modelValue", false);
  }
</script>

<style scoped lang="scss">

</style>
