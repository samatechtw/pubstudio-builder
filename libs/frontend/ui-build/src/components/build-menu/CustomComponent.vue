<template>
  <div
    ref="elementRef"
    class="custom-component"
    :class="{ dragging: dndState?.dragging }"
    :title="text"
    :draggable="true"
    @mouseenter.stop="mouseEnter"
    @mouseleave.stop="mouseLeave"
    @dragstart="dragstart"
    @dragend="dragend"
    @drag="drag"
  >
    <div class="custom-label" @click="addInstance">
      <div class="custom-name">{{ customComponent.name }}</div>
      <div class="custom-usage">{{ usageText }}</div>
    </div>
    <Edit class="custom-action edit" @click.stop="editComponent" />
    <Trash
      class="custom-action delete"
      :class="{ disabled: usageCount > 0 }"
      :title="usageCount ? t('build.custom_in_use', { count: usageCount }) : t('delete')"
      @click.stop="removeComponent"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { addInstanceAtSelection, useBuild } from '@pubstudio/frontend/feature-build'
import { useDragDrop } from '@pubstudio/frontend/feature-render-builder'
import { IComponent } from '@pubstudio/shared/type-site'
import { BuilderDragDataType } from '@pubstudio/frontend/type-builder'
import { builderContext } from '@pubstudio/frontend/util-builder'
import { customComponentUsage } from '@pubstudio/frontend/util-component'
import { enterComponentEdit } from '@pubstudio/frontend/data-access-command'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { Edit, Trash } from '@pubstudio/frontend/ui-widgets'

const props = defineProps<{
  customComponent: IComponent
}>()

const { customComponent } = toRefs(props)

const { t } = useI18n()
const { site } = useSiteSource()
const { removeCustomComponent } = useBuild()

const usageCount = computed(
  () => customComponentUsage(site.value, customComponent.value.id).instances.length,
)

const usageText = computed(() => t('build.custom_usage', { count: usageCount.value }))

const addInstance = () => {
  addInstanceAtSelection(site.value, customComponent.value.id)
}

const editComponent = () => {
  enterComponentEdit(site.value, customComponent.value.id)
}

const removeComponent = () => {
  removeCustomComponent(customComponent.value.id)
}

const { dndState, elementRef, dragstart, drag, dragend } = useDragDrop({
  site: site.value,
  componentId: customComponent.value.id,
  getParentId: () => undefined,
  getComponentIndex: () => 0,
  isParent: false,
  addData: {
    id: customComponent.value.id,
    type: BuilderDragDataType.CustomComponent,
  },
})

const mouseEnter = () => {
  builderContext.hoveredComponentIdInComponentTree.value = customComponent.value.id
}

const mouseLeave = () => {
  builderContext.hoveredComponentIdInComponentTree.value = undefined
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.custom-component {
  @mixin title-medium 13px;
  @mixin flex-row;
  align-items: center;
  width: 100%;
  padding: 8px;
  color: $color-text;
  border-top: 1px solid $border1;
  border-bottom: 1px solid $border1;
  transition: color 0.2s;
  word-break: break-all;
  &.dragging {
    opacity: 0.3;
  }
  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
}
.custom-label {
  flex-grow: 1;
  min-width: 0;
  cursor: pointer;
  &:hover {
    color: $color-toolbar-button-active;
  }
}
.custom-name {
  @mixin truncate;
}
.custom-usage {
  @mixin text 11px;
  color: $grey-500;
}
.custom-action {
  @mixin size 16px;
  flex-shrink: 0;
  margin-left: 6px;
  cursor: pointer;
  &.disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
}
</style>
