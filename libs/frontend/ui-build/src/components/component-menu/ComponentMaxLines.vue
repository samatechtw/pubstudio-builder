<template>
  <ToolbarItem
    v-if="show"
    type="button"
    class="text-options"
    :active="!!lines || expanded"
    :aria-label="t('build.more_text_options')"
    :aria-expanded="expanded"
    :tooltip="showTooltip && !lines ? t('build.more_text_options') : undefined"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    @keydown.enter.stop
    @keydown.space.stop
    @mousedown.prevent
    @click="expanded = !expanded"
  >
    <span>{{ lines ? t('build.line_count', { count: lines }, lines) : '⋯' }}</span>
  </ToolbarItem>
  <label v-if="show && expanded" class="max-lines">
    {{ t('build.max_lines') }}
    <input
      type="number"
      min="0"
      step="1"
      :value="lines ?? ''"
      :placeholder="t('build.unlimited')"
      @change="update"
      @keydown.enter="($event.target as HTMLInputElement).blur()"
    />
  </label>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import {
  addOrUpdateComponentInput,
  removeComponentInput,
} from '@pubstudio/frontend/feature-build'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import {
  getMaxLines,
  maxLinesInput,
  supportsMaxLines,
} from '@pubstudio/frontend/util-render'
import { ToolbarItem } from '@pubstudio/frontend/ui-widgets'
import { ComponentArgPrimitive, IComponent } from '@pubstudio/shared/type-site'

const props = defineProps<{ component: IComponent; source?: IComponent }>()
const { t } = useI18n()
const { site } = useSiteSource()
const expanded = ref(false)
const hovered = ref(false)
const showTooltip = ref(false)
// Keep the delay even when the pointer moves here from an already-open toolbar tooltip.
watch(hovered, (inside, _, onCleanup) => {
  showTooltip.value = false
  if (inside) {
    const timer = setTimeout(() => (showTooltip.value = true), 600)
    onCleanup(() => clearTimeout(timer))
  }
})
const show = computed(
  () =>
    supportsMaxLines(props.component.tag) &&
    !props.component.children?.length &&
    !props.source?.children?.length &&
    typeof (props.component.content ?? props.source?.content) === 'string',
)
const lines = computed(() => getMaxLines(props.component, props.source))

const update = (event: Event) => {
  const input = event.target as HTMLInputElement
  const value = input.valueAsNumber
  if (!input.validity.valid || (input.value && !Number.isSafeInteger(value))) {
    input.value = lines.value?.toString() ?? ''
    return
  }
  const next = value > 0 ? value : undefined
  if (!next) input.value = ''
  if (next === lines.value) return
  const inherited = props.source && getMaxLines(props.source)
  if (next === inherited) {
    removeComponentInput(site.value, maxLinesInput)
  } else {
    addOrUpdateComponentInput(site.value, props.component, maxLinesInput, {
      name: maxLinesInput,
      type: ComponentArgPrimitive.Number,
      is: next ?? 0,
    })
  }
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.text-options {
  @mixin title 13px;
  flex: 0 1 auto;
  width: auto;
  min-width: 32px;
  max-width: 68px;
  height: 32px;
  margin-left: 4px;
  padding: 0 5px;
  border-radius: 4px;
  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  &:focus-visible {
    outline: 2px solid $blue-500;
  }
}
.max-lines {
  flex-basis: 100%;
  @mixin title-bold 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 4px 2px;
  input {
    @mixin input;
    width: 80px;
    font-size: 12px;
  }
}
</style>
