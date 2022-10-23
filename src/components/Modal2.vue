<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: "Modal2",
  props: {
    modelValue: {
      required: true,
      type: Boolean
    }
  },
  emits: ["update:modelValue"],
  computed: {
    open: {
      get(): boolean {
        return this.modelValue;
      },
      set(v: boolean) {
        this.$emit("update:modelValue", v);
      }
    }
  },
  methods:{
    closeModal(){
      this.open = false;
    },
    saveFile() {
      // TODO: this data should be the document state
      let x = Uint8Array.from([91,68,101,115,107,116,111,112,32,69]);
      let blob = new Blob([x], {type: 'application/octet-stream'});
      let url = URL.createObjectURL(blob);
      this.download(url, 'myDocument.signage')
      //this.download(url, 'patch.sdoc')
      URL.revokeObjectURL(url);

      this.closeModal();
    },
    download(path, filename) {
      // TODO: move this to some util file later
      let anchor = document.createElement('a');
      anchor.href = path;
      anchor.download = filename;

      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    }
  }
});
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <!--
        Background backdrop, show/hide based on modal state.

        Entering: "ease-out duration-300"
          From: "opacity-0"
          To: "opacity-100"
        Leaving: "ease-in duration-200"
          From: "opacity-100"
          To: "opacity-0"
      -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm😛-0">
          <!--
            Modal panel, show/hide based on modal state.

            Entering: "ease-out duration-300"
              From: "opacity-0 translate-y-4 sm:translate-y-0 sm😒cale-95"
              To: "opacity-100 translate-y-0 sm😒cale-100"
            Leaving: "ease-in duration-200"
              From: "opacity-100 translate-y-0 sm😒cale-100"
              To: "opacity-0 translate-y-4 sm:translate-y-0 sm😒cale-95"
          -->
          <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <div class="bg-white px-4 pt-5 pb-4 sm😛-6 sm😛b-4">
              <div class="sm:flex sm:items-start">
                <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <!-- Heroicon name: outline/exclamation-triangle -->
                  <svg class="h-6 w-6 text-red-600" xmlns="
    http://www.w3.org/2000/svg
    " fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 10.5v3.75m-9.303 3.376C1.83 19.126 2.914 21 4.645 21h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 4.88c-.866-1.501-3.032-1.501-3.898 0L2.697 17.626zM12 17.25h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 class="text-lg font-medium leading-6 text-gray-900" id="modal-title">Gesamtzustand abspeichern</h3>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">Du solltest deinen neuen Gesamtzustand speichern, wenn.... browser.... bla...</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm😛x-6">
              <button type="button" @click="saveFile" class="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus😮utline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm">Datei speichern</button>
              <button type="button" @click="closeModal" class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus😮utline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Abbrechen</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/*.modal {
  position: fixed;
  z-index: 999;
  top: 20%;
  left: 50%;
  width: 300px;
  margin-left: -150px;
}*/

.inset-0 {
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
}
.bg-opacity-75 {
  --tw-bg-opacity: 0.75 !important;
}
.transition-opacity {
  transition-property: opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
.z-10 {
  z-index: 10;
}
.items-end {
  align-items: flex-end;
}
.justify-center {
  justify-content: center;
}
@media (min-width: 640px) {
  .sm\:items-center {
    align-items: center;
  }
  .sm\:max-w-lg {
    max-width: 32rem;
  }
  .sm\:items-start {
    align-items: flex-start;
  }
  .sm\:h-10 {
    height: 2.5rem !important;
  }
  .sm\:w-10 {
    width: 2.5rem !important;
  }
  .sm\:my-8 {
    margin-top: 2rem !important;
    margin-bottom: 2rem !important;
  }
}
.transform {
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}
.rounded-lg {
  border-radius: 0.5rem;
}
.text-left {
  text-align: left;
}
.shadow-xl {
  --tw-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --tw-shadow-colored: 0 20px 25px -5px var(--tw-shadow-color), 0 8px 10px -6px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}
.h-12 {
  height: 3rem;
}
.items-center {
  align-items: center;
}
.justify-center {
  justify-content: center;
}
.rounded-full {
  border-radius: 9999px;
}
.h-6 {
  height: 1.5rem;
}
.leading-6 {
  line-height: 1.5rem;
}
.bg-gray-500 {
  --tw-bg-opacity: 1;
  background-color: rgb(107 114 128 / var(--tw-bg-opacity)) !important;
}
.rounded-md {
  border-radius: 0.375rem;
}
.border {
  border-width: 1px;
}
.shadow-sm {
  --tw-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --tw-shadow-colored: 0 1px 2px 0 var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}
.focus\:ring-offset-2:focus {
  --tw-ring-offset-width: 2px;
}
.focus\:ring-red-500:focus {
  --tw-ring-opacity: 1;
  --tw-ring-color: rgb(239 68 68 / var(--tw-ring-opacity));
}
.focus\:ring-2:focus {
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
}
</style>
