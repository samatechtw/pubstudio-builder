<template>
  <div class="menu-row">
    <STMultiselect
      ref="multiselectRef"
      :value="mixin?.id"
      class="edit-item"
      :placeholder="t('style.select')"
      :options="mixinOptions"
      :searchable="true"
      :clearable="false"
      :disabled="isInherited"
      @select="
        emit('set', { oldMixinId: mixin?.id, newMixinId: $event?.value as string })
      "
      @click.stop
    />

    <IconTooltipDelay ref="flattenRef" :tip="t('style.flatten')" class="flatten">
      <ScaleOut v-if="!isNew" class="out-icon" @click="flatten" />
    </IconTooltipDelay>
    <Edit v-if="mixin?.id" class="edit-icon" @click="emit('edit', mixin.id)" />
    <InfoBubble v-if="isInherited" class="inherited-from" :message="inheritedMessage" />
    <Minus v-else class="item-delete" @click.stop="emit('remove', mixin?.id)" />
  </div>
</template>

<script lang="ts">
export interface ISetMixinEmit {
  oldMixinId?: string
  newMixinId: string
}
</script>

<script lang="ts" setup>
import { computed, ref, toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { STMultiselect } from '@samatech/vue-components'
import { IStyle } from '@pubstudio/shared/type-site'
import {
  Edit,
  IconTooltipDelay,
  InfoBubble,
  Minus,
  ScaleOut,
} from '@pubstudio/frontend/ui-widgets'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'

const { t } = useI18n()

const props = defineProps<{
  isNew?: boolean
  mixin?: IStyle | undefined
  mixinOptions: { label: string; value: string }[]
  sourceCustomComponentId?: string
}>()

const { sourceCustomComponentId } = toRefs(props)

const isInherited = computed(() => !!sourceCustomComponentId.value)

const emit = defineEmits<{
  (e: 'set', data: ISetMixinEmit): void
  (e: 'edit', mixinId: string): void
  (e: 'remove', mixinId: string | undefined): void
  (e: 'flatten'): void
}>()

const { site } = useSiteSource()

const flattenRef = ref()
const multiselectRef = ref()

const flatten = () => {
  flattenRef.value?.cancelHoverTimer()
  emit('flatten')
}

const inheritedMessage = computed(() => {
  if (sourceCustomComponentId.value) {
    const sourceName = site.value.context.components[sourceCustomComponentId.value]?.name
    return t('style.inherited_source', {
      source: `${sourceName}#${sourceCustomComponentId.value}`,
    })
  }
  return undefined
})

defineExpose({ multiselectRef })
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.menu-row {
  :deep(.st-multiselect) {
    width: 100%;
    margin-right: 16px;
    max-width: 200px;
  }
  .out-icon {
    @mixin size 20px;
    margin-left: auto;
  }
  .edit-icon {
    margin-left: 6px;
  }
}
.flatten {
  &:hover :deep(path) {
    fill: $color-toolbar-button-active;
  }
}
</style>
