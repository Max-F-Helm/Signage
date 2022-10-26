<template>
  <!-- mostly taken from https://github.com/primefaces/primevue/blob/master/src/components/steps/Steps.vue -->

  <div>
    <Card class="w-full">
      <template #content>
        <nav :class="navClass">
          <ol ref="listRef" class="p-steps-list">
            <template v-for="(item, index) of steps" :key="index">
              <li v-if="isVisible(item)" :class="getItemClass(item)">
                <span v-if="!isItemDisabled(item)"
                      @click="onItemClick(item, $event)" @keydown="onItemKeydown(item, $event)">
                  <a :class="getLinkClass(item)" :tabindex="-1">
                    <span class="p-steps-number">{{ getItemEffectiveIdx(item) }}</span>
                    <span class="p-steps-title">{{ item.label }}</span>
                  </a>
                </span>
                <span v-else :class="getLinkClass(item)" @keydown="onItemKeydown(item, $event)">
                      <span class="p-steps-number">{{ getItemEffectiveIdx(item) }}</span>
                      <span class="p-steps-title">{{ item.label }}</span>
                  </span>
              </li>
            </template>
          </ol>
        </nav>
      </template>
    </Card>
    <div class="h-1rem"></div>
    <Card class="content-container">
      <template #content>
          <div v-for="(item, index) of steps" :key="index" v-show="isActive(item)">
            <slot :name="item.id"></slot>
          </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import {computed, getCurrentInstance, ref} from "vue";
import type {PropType} from "vue";
import type {StepsItem} from "@/ui/utils/Steps-exports";
import {DomHandler} from "primevue/utils";
import Card from "primevue/card";
import {findParent} from "@/ui/utils/utils";

const props = defineProps({
  steps: {
    required: true,
    type: Array as PropType<StepsItem[]>
  },
  value: {
    required: true,
    type: String
  },
  readonly: {
    required: false,
    type: Boolean,
    default: false
  }
}); 

const emit = defineEmits(["update:value"]);

const listRef = ref<HTMLElement | null>(null);

const currentStep = computed({
  get(): StepsItem {
    return props.steps.find(s => s.id === props.value)!;
  },
  set(val: StepsItem) {
    emit("update:value", val.id);
  }
});

const navClass = computed(() => ['p-steps p-component', { 'p-readonly': props.readonly }]);

function isVisible(step: StepsItem): boolean {
  if(step.hidden !== undefined)
    return !step.hidden;
  return true;
}
function isItemDisabled(step: StepsItem) {
  if(step.disabled !== undefined)
    return step.disabled;
  return false;
}
function isActive(step: StepsItem) {
  return step.id === currentStep.value.id;
}
function getItemClass(step: StepsItem) {
  return [
    'p-steps-item',
    {
      'p-highlight p-steps-current': isActive(step),
      'p-disabled': isItemDisabled(step)
    }
  ];
}
function getLinkClass(step: StepsItem) {
  return [
    'p-menuitem-link',
    {
      'router-link-active': isActive(step),
    }
  ];
}
function getItemEffectiveIdx(step: StepsItem) {
  let idx = props.steps.indexOf(step);
  for(let i = idx; i >= 0; i--)
    if(!isVisible(props.steps[i]))
      idx--;
  return idx + 1;
}

function onItemClick(step: StepsItem, event: MouseEvent | null) {
  if(isItemDisabled(step) || props.readonly){
    if(event !== null)
      event.preventDefault();
    return;
  }

  currentStep.value = step;
}
function onItemKeydown(step: StepsItem, event: KeyboardEvent) {
  if(props.readonly)
    return;

  switch (event.code) {
    case 'ArrowRight': {
      event.preventDefault();

      const target = (event.target as HTMLElement);
      const nextItem = findParent(target, "p-steps-item")?.nextElementSibling as HTMLElement;
      if(nextItem != null){
        const nextItemLink = DomHandler.findSingle(nextItem, ".p-menuitem-link");
        switchFocus(target, nextItemLink);
      }

      break;
    }
    case 'ArrowLeft': {
      event.preventDefault();

      const target = (event.target as HTMLElement);
      const nextItem = findParent(target, "p-steps-item")?.previousElementSibling as HTMLElement;
      if(nextItem != null){
        const nextItemLink = DomHandler.findSingle(nextItem, ".p-menuitem-link");
        switchFocus(target, nextItemLink);
      }

      break;
    }
    case 'Home': {
      event.preventDefault();

      const target = (event.target as HTMLElement);
      const firstSibling = DomHandler.findSingle(listRef.value!, '.p-steps-item');
      if(firstSibling != null){
        const nextItemLink = DomHandler.findSingle(firstSibling, ".p-menuitem-link");
        switchFocus(target, nextItemLink);
      }

      break;
    }
    case 'End': {
      event.preventDefault();

      const target = (event.target as HTMLElement);
      const siblings = DomHandler.find(listRef.value!, '.p-steps-item');
      if(siblings != null){
        const lastSibling = siblings[siblings.length - 1];
        const nextItemLink = DomHandler.findSingle(lastSibling, ".p-menuitem-link");
        switchFocus(target, nextItemLink);
      }

      break;
    }
    case 'Tab':
      //no op
      break;
    case 'Enter':
    case 'NumpadEnter':
    case 'Space': {
      event.preventDefault();
      onItemClick(step, null);
      break;
    }
    default:
      break;
  }
}

function switchFocus(oldEl: HTMLElement, newEl: HTMLElement) {
  oldEl.tabIndex = -1;
  newEl.tabIndex = 0;
  newEl.focus();
}
</script>

<style scoped lang="scss">
@import "primeflex/primeflex";

.content-container {
  @extend .w-full;
  @extend .pt-2, .pl-2, .pr-2;
  @extend .overflow-x-scroll;

  overflow-x: scroll;
}

.p-steps {
  position: relative;
}
.p-steps .p-steps-list {
  padding: 0;
  margin: 0;
  list-style-type: none;
  display: flex;
}
.p-steps-item {
  position: relative;
  display: flex;
  justify-content: center;
  flex: 1 1 auto;
}
.p-steps-item .p-menuitem-link {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  text-decoration: none;
}
.p-steps.p-steps-readonly .p-steps-item {
  cursor: auto;
}
.p-steps-item.p-steps-current .p-menuitem-link {
  cursor: default;
}
.p-steps-title {
  white-space: nowrap;
}
.p-steps-number {
  display: flex;
  align-items: center;
  justify-content: center;
}
.p-steps-title {
  display: block;
}
</style>
