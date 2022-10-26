<template>
  <Dialog v-model:visible="open" header="Open or Create a Document" :modal="true" :closable="false" contentClass="big-dlg">
    <Steps v-model:value="currentStep" :steps="steps" :readonly="true">
      <template #od-id_choice>
        <div class="flex flex-column row-gap-3">
          <div>
            <RadioButton value="upload" v-model="idChoice_mode" name="idChoice_mode" inputId="idChoice_mode_upl" />
            <label for="idChoice_mode_upl" class="ml-2">Upload</label>
          </div>
          <div>
            <RadioButton value="new" v-model="idChoice_mode" name="idChoice_mode" inputId="idChoice_mode_new" />
            <label for="idChoice_mode_upl" class="ml-2">New</label>
          </div>
        </div>
      </template>

      <template #od-id_upl>
        <div class="flex flex-column row-gap-3">
          <div>
            <FileUpload mode="advanced" :multiple="false" :fileLimit="1"
                        :showUploadButton="false" :showCancelButton="false"
                        @select="idUplSetFile" @remove="idUplClearFile"></FileUpload>
          </div>
          <div class="p-inputgroup">
            <span class="p-inputgroup-addon">
              <i class="pi pi-lock"></i>
            </span>
            <Password v-model="idUplPwd" :feedback="false" placeholder="Password"/>
          </div>
          <div>
            <PButton @click="idUplLoad" :disabled="idUplLoadDisabled">Load</PButton>
            <div class="flex-grow-1"></div>
          </div>

          <div v-show="idUplErr.length !== 0" class=" p-inline-message p-inline-message-error">
            {{idUplErr}}
          </div>
          <div v-show="idUplSuccess" class="p-inline-message p-inline-message-success">
            Identity loaded
          </div>
        </div>
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
import RadioButton from "primevue/radiobutton";
import PButton from "primevue/button";
import FileUpload from "primevue/fileupload";
import type {FileUploadSelectEvent} from "primevue/fileupload";
import Password from "primevue/password";
import Steps from "./utils/Steps.vue";
import type {StepsItem} from "@/ui/utils/Steps-exports";
import {Buffer} from "buffer";
import IdentityProcessor from "@/processing/identity-processor";
import Bill from "@/processing/bill";
import BufferReader from "@/processing/buffer-reader";
import FileProcessorWrapper from "@/FileProcessorWrapper";

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

//region id_choice
const idChoice_mode = ref("upload");
const idModeUpl = computed(() => idChoice_mode.value === "upload");
const idModeNew = computed(() => idChoice_mode.value === "new");
//endregion

//region id_upl
const idUplFile = ref<File | null>(null);
const idUplPwd = ref("");
const idUplSuccess = ref(false);
const idUplErr = ref("");

const idUplLoadDisabled = computed(() => {
  return idUplFile.value === null || idUplPwd.value.length === 0;
});

function idUplSetFile(e: FileUploadSelectEvent) {
  idUplFile.value = e.files[0];
}
function idUplClearFile() {
  idUplFile.value = null;
}

async function idUplLoad() {
  idUplSuccess.value = false;
  idUplErr.value = "";

  const reader = new FileReader();
  const filePromise = new Promise<ArrayBuffer>((resolve, reject) => {
    reader.onload = (e) => {
      resolve(e.target!.result as ArrayBuffer);
    }
    reader.onerror = (e) => {
      reject(e.target!.error);
    }
  });
  reader.readAsArrayBuffer(idUplFile.value!);

  try {
    try {
      const key = await Bill.digest_pwd(idUplPwd.value);
      const data = Buffer.from(await filePromise);
      const dataDec = Buffer.from(await Bill.decrypt(data, key));

      try {
        const identity = await IdentityProcessor.loadIdentity(new BufferReader(dataDec));
        FileProcessorWrapper.INSTANCE.setIdentity(identity);

        idUplSuccess.value = true;
      }catch (e) {
        console.error("unable to load identity from file: load failed", e);
        idUplErr.value = "there was an error while loading the identity (the file seems corrupted)";
      }
    } catch (e) {
      console.error("unable to load identity from file: decryption failed", e);
      idUplErr.value = "there was an error while loading the identity (was the password correct?)";
    }
  } catch (e) {
    console.error("unable to load identity from file: open failed", e);
    idUplErr.value = "there was an error while loading the identity (unable to open the file)";
  }
}
//endregion

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

const backDisabled = computed(() => {
  return currentStep.value === steps.value[0].id;
});
const nextDisabled = computed(() => {
  switch(currentStep.value){
    case "od-id_choice":
      return false;
    case "od-id_upl":
      return !idUplSuccess.value;
    case "od-id_new":
      return false;
    default:
      throw new Error();
  }
});

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
