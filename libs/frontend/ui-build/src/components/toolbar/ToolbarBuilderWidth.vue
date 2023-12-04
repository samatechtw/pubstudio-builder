<template>
  <div class="builder-width-wrap">
    <ToolbarItem :ref="setToggleRef" :active="opened" @click="toggleMenu">
      {{ builderWidthText }}
    </ToolbarItem>
    <div
      ref="menuRef"
      class="ps-dropdown builder-width-dropdown"
      :class="{ 'ps-dropdown-opened': opened }"
      :style="menuStyle"
    >
      <div class="row">
        <div class="field-label label-title">
          {{ t('build.width') }}
        </div>
        <PSInput
          v-model="builderWidth"
          type="number"
          class="width-input"
          :placeholder="t('build.width')"
          @handle-enter="updateBuilderWidth"
        />
        <div class="field-label">
          {{ t('px') }}
        </div>
        <div class="field-label label-title">
          {{ t('build.scale') }}
        </div>
        <PSInput
          :modelValue="scaleText"
          type="number"
          class="scale-input"
          :placeholder="t('build.scale')"
          @update:modelValue="builderScale = $event"
          @handle-enter="updateBuilderScale"
        />
        <div class="field-label">
          {{ '%' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, ComponentPublicInstance, watch } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { useDropdown } from '@pubstudio/frontend/util-dropdown'
import { ToolbarItem } from '@pubstudio/frontend/ui-widgets'
import { PSInput } from '@pubstudio/frontend/ui-widgets'
import { useBuild } from '@pubstudio/frontend/feature-build'
import { setBuilderScale, setBuilderWidth } from '@pubstudio/frontend/feature-editor'

const { t } = useI18n()
const { editor } = useBuild()

const getEditorBuilderWidth = () => (editor.value?.builderWidth ?? 0).toString()
const getEditorBuilderScale = () => (editor.value?.builderScale ?? 1).toString()

const { toggleRef, menuRef, opened, menuStyle, toggleMenu } = useDropdown({
  clickawayIgnoreSelector: '.builder-width-wrap',
  placement: 'bottom',
  openChanged: (open) => {
    if (open) {
      builderScale.value = getEditorBuilderScale()
    }
  },
})

const setToggleRef = (el: ComponentPublicInstance | null | Element) => {
  if (el && '$el' in el) {
    toggleRef.value = el?.$el
  }
}

const builderWidth = ref(getEditorBuilderWidth())
const builderScale = ref(getEditorBuilderScale())

// TODO: find a way to get rid of `watch`
watch(
  () => editor.value?.builderWidth,
  () => {
    builderWidth.value = getEditorBuilderWidth()
  },
)

const builderWidthText = computed(() =>
  t('build.x_px', { x: editor.value?.builderWidth }),
)

const scaleText = computed(() => {
  const scale = editor.value?.builderScale ?? 1
  return scale * 100
})

const updateBuilderWidth = () => {
  const width = parseInt(builderWidth.value)
  if (Number.isNaN(width) || width <= 0) {
    builderWidth.value = getEditorBuilderWidth()
  } else {
    setBuilderWidth(editor.value, width)
  }
}

const updateBuilderScale = () => {
  const scale = parseInt(builderScale.value)
  if (Number.isNaN(scale) || scale <= 0) {
    builderScale.value = getEditorBuilderScale()
  } else {
    setBuilderScale(editor.value, scale / 100)
  }
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.builder-width-wrap {
  white-space: nowrap;
  .toolbar-item {
    width: auto;
  }
  .builder-width-dropdown {
    width: auto;
    padding: 8px 12px;
  }
}
.row {
  @mixin flex-row;
  align-items: center;
}
.field-label {
  @mixin title 13px;
  color: $color-text;
  text-align: right;
  margin: 0 8px;
}
.label-title {
  font-weight: 600;
}
.width-input,
.scale-input {
  width: 60px;
}
</style>
