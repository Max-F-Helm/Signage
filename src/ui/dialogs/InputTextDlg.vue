<template>
  <Dialog
    :visible="props.modelValue"
    :modal="true"
    :header="props.header"
    @update:visible="onUpdateVisible"
  >
    <div class="mb-2">
      {{ description }}
    </div>

    <InputText
      v-if="props.mode === 'text'"
      v-model="text"
      :placeholder="props.placeholder"
    />
    <Password
      v-if="props.mode === 'password'"
      v-model="text"
      :placeholder="props.placeholder"
      :feedback="false"
    />

    <div class="flex flex-row w-full mt-2">
      <div class="flex-grow-1" />
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
      type: String,
      default: undefined
    },
    description: {
      required: false,
      type: String,
      default: ""
    },
    placeholder: {
      required: false,
      type: String,
      default: undefined
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
