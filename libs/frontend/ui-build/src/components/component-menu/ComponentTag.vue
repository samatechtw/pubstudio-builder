<template>
  <div class="menu-row">
    <div class="label">
      {{ t('tag') }}
    </div>
    <STMultiselect
      :value="tag"
      class="component-tag"
      :options="TagValues"
      :clearable="false"
      @select="setTag"
      @click.stop
    />
  </div>
</template>

<script lang="ts" setup>
import { toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { STMultiselect } from '@samatech/vue-components'
import { Tag, TagType } from '@pubstudio/shared/type-site'

const TagValues: Tag[] = Object.values(Tag)

const props = defineProps<{
  tag: TagType
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
  z-index: $z-index-toolbar-dropdown1;
}
</style>
