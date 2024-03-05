<template>
  <div class="menu-row">
    <div class="label">
      {{ t('tag') }}
    </div>
    <PSMultiselect
      :value="tag"
      class="component-tag"
      :options="TagValues"
      :disabled="disabled"
      :clearable="false"
      @select="setTag"
      @click.stop
    />
  </div>
</template>

<script lang="ts" setup>
import { toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { Tag, TagValues } from '@pubstudio/shared/type-site'
import { PSMultiselect } from '@pubstudio/frontend/ui-widgets'

const props = defineProps<{
  tag: Tag
  disabled?: boolean
}>()
const { tag } = toRefs(props)
const emit = defineEmits<{
  (e: 'setTag', value: Tag | undefined): void
}>()

const { t } = useI18n()

const setTag = (newTag: Tag | undefined) => {
  if (newTag !== tag.value) {
    emit('setTag', newTag)
  }
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.menu-row {
  justify-content: space-between;
}
.label {
  @mixin title-bold 13px;
}
.component-tag {
  max-width: 140px;
  margin: 0 16px 0 0;
}
</style>
