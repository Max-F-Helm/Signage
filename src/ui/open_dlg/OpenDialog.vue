<template>
  <Dialog v-model:visible="open" header="Open or Create a Document" :modal="true" :closable="false" contentClass="big-dlg">
    <Steps v-model:value="currentStep" :steps="steps" :readonly="true">
      <template #od-id_choice>
        <IdChoice @update:choice="onIdUpdateChoice"></IdChoice>
      </template>

      <template #od-id_upl>
        <IdUpload @update:valid="v => onUpdateStepValid('od-id_upl', v)"></IdUpload>
      </template>

      <template #od-id_new>
        <div class="flex flex-column row-gap-3">

        </div>
      </template>
    </Steps>

    <template #footer>
      <div class="flex flex-row">
        <PButton :disabled="backDisabled" @click="onBack">Back</PButton>
        <div class="flex-grow-1"></div>
        <PButton :disabled="nextDisabled" @click="onNext">Next</PButton>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import {computed, ref} from "vue";
import Dialog from "primevue/dialog";
import PButton from "primevue/button";
import Steps from "@/ui/utils/Steps.vue";
import type {StepsItem} from "@/ui/utils/Steps-exports";
import {fold} from "@/ui/utils/utils";
import IdUpload from "@/ui/open_dlg/IdUpload.vue";
import IdChoice from "@/ui/open_dlg/IdChoice.vue";

const emit = defineEmits(["update:modelValue"]);

const props = defineProps({
  modelValue: {
    required: true,
    type: Boolean
  }
});

const open = computed({
  get(): boolean {
    return props.modelValue;
  },
  set(val: boolean) {
    emit("update:modelValue", val);
  }
});

const idModeUpl = ref(false);
const idModeNew = ref(false);

const currentStep = ref("od-id_choice");
const steps = ref<StepsItem[]>([
  {
    id: "od-id_choice",
    label: "Identity Source"
  },
  {
    id: "od-id_upl",
    label: "Open Identity",
    hidden: idModeNew as unknown as boolean
  },
  {
    id: "od-id_new",
    label: "Create Identity",
    hidden: idModeUpl as unknown as boolean
  }
]);

const stepValid = ref<Record<string, boolean>>(fold(steps.value, {}, (obj: Record<string, boolean>, step) => {
  obj[step.id] = false;
  return obj;
}));

const backDisabled = computed(() => {
  return currentStep.value === steps.value[0].id;
});
const nextDisabled = computed(() => {
  return !stepValid.value[currentStep.value];
});

function onUpdateStepValid(stepId: string, valid: boolean) {
  stepValid.value[stepId] = valid;
}

function onIdUpdateChoice(choice: string) {
  switch (choice) {
    case "upload":
      idModeUpl.value = true;
      idModeNew.value = false;
      break;
    case "new":
      idModeUpl.value = false;
      idModeNew.value = true;
      break;
    default:
      throw new Error();
  }

  stepValid.value["od-id_choice"] = true;
}

function onNext() {
  let idx = steps.value.findIndex(s => s.id === currentStep.value) + 1;
  while(idx < steps.value.length && steps.value[idx].hidden)
    idx++;
  if(idx < steps.value.length)
    currentStep.value = steps.value[idx].id;
}
function onBack() {
  let idx = steps.value.findIndex(s => s.id === currentStep.value) - 1;
  while(idx >= 0 && steps.value[idx].hidden)
    idx--;
  if(idx >= 0)
    currentStep.value = steps.value[idx].id;
}
</script>

<style scoped lang="scss">

</style>
