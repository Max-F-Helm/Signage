<template>
  <Dialog v-model:visible="open" :closable="false" :modal="true" contentClass="big-dlg"
          header="Open or Create a Document">
    <Steps v-model:value="currentStep" :readonly="true" :steps="steps">
      <template #od-id_choice>
        <IdChoice @update:choice="onIdUpdateChoice"></IdChoice>
      </template>

      <template #od-id_upl>
        <IdUpload @update:ready="v => onUpdateStepReady('od-id_upl', v)"></IdUpload>
      </template>

      <template #od-id_new>
        <IdNew @update:ready="v => onUpdateStepReady('od-id_new', v)"></IdNew>
      </template>

      <template #od-doc_choice>
        <DocChoice @update:choice="onDocUpdateChoice"></DocChoice>
      </template>

      <template #od-doc_upl>
        <DocUpload @update:ready="v => onUpdateStepReady('od-doc_upl', v)"></DocUpload>
      </template>

      <template #od-doc_new>
        <DocNew @update:ready="v => onUpdateStepReady('od-doc_new', v)"></DocNew>
      </template>

      <template #od-doc_new_addendum>
        <DocInitialAddendum @update:ready="v => onUpdateStepReady('od-doc_new_addendum', v)"></DocInitialAddendum>
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

<script lang="ts" setup>
  import {computed, ref} from "vue";
  import Dialog from "primevue/dialog";
  import PButton from "primevue/button";
  import Steps from "@/ui/utils/Steps.vue";
  import type {StepsItem} from "@/ui/utils/Steps-exports";
  import {fold} from "@/ui/utils/utils";
  import IdUpload from "@/ui/open_dlg/IdUpload.vue";
  import IdChoice from "@/ui/open_dlg/IdChoice.vue";
  import IdNew from "@/ui/open_dlg/IdNew.vue";
  import DocChoice from "@/ui/open_dlg/DocChoice.vue";
  import DocUpload from "@/ui/open_dlg/DocUpload.vue";
  import DocNew from "@/ui/open_dlg/DocNew.vue";
  import DocInitialAddendum from "@/ui/open_dlg/DocInitialAddendum.vue";

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
  const docModeUpl = ref(false);
  const docModeNew = ref(false);

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
    },
    {
      id: "od-doc_choice",
      label: "Proposal Source"
    },
    {
      id: "od-doc_upl",
      label: "Open Proposal",
      hidden: docModeNew as unknown as boolean
    },
    {
      id: "od-doc_new",
      label: "Create Proposal",
      hidden: docModeUpl as unknown as boolean
    },
    {
      id: "od-doc_new_addendum",
      label: "Add Initial Addendum",
      hidden: docModeUpl as unknown as boolean
    }
  ]);

  const stepReady = ref<Record<string, boolean>>(fold(steps.value, {}, (obj: Record<string, boolean>, step) => {
    obj[step.id] = false;
    return obj;
  }));

  const backDisabled = computed(() => {
    return currentStep.value === steps.value[0].id;
  });
  const nextDisabled = computed(() => {
    return !stepReady.value[currentStep.value];
  });

  function onUpdateStepReady(stepId: string, valid: boolean) {
    stepReady.value[stepId] = valid;
    if(valid)
      onNext();
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

    stepReady.value["od-id_choice"] = true;
  }

  function onDocUpdateChoice(choice: string) {
    switch (choice) {
      case "upload":
        docModeUpl.value = true;
        docModeNew.value = false;
        break;
      case "new":
        docModeUpl.value = false;
        docModeNew.value = true;
        break;
      default:
        throw new Error();
    }

    stepReady.value["od-doc_choice"] = true;
  }

  function onNext() {
    let idx = steps.value.findIndex(s => s.id === currentStep.value) + 1;

    // skip hidden steps
    while (idx < steps.value.length && steps.value[idx].hidden)
      idx++;

    if (idx < steps.value.length)
      currentStep.value = steps.value[idx].id;
    else
      open.value = false;
  }

  function onBack() {
    let idx = steps.value.findIndex(s => s.id === currentStep.value) - 1;

    // skip hidden steps
    while (idx >= 0 && steps.value[idx].hidden)
      idx--;

    if (idx >= 0)
      currentStep.value = steps.value[idx].id;
  }
</script>

<style lang="scss" scoped>

</style>
