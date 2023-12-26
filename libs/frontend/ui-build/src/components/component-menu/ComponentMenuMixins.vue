<template>
  <div class="component-menu-mixins">
    <div class="wrap">
      <EditMenuTitle :title="t('style.reusable')" @add="showNewMixin = true" />
      <div v-if="showNewMixin" class="mixin new-mixin">
        <MixinSelect
          :mixin="undefined"
          :mixinOptions="mixinOptions"
          :isNew="true"
          @set="setMixin($event.oldMixinId, $event.newMixinId)"
          @remove="showNewMixin = false"
        />
      </div>
      <MixinSelect
        v-for="mixin in mixins"
        :key="mixin.id"
        :mixin="mixin"
        :mixinOptions="mixinOptions"
        class="mixin"
        @set="setMixin($event.oldMixinId, $event.newMixinId)"
        @edit="edit"
        @remove="removeMixin($event)"
        @flatten="flattenMixin(mixin.id)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { IStyle } from '@pubstudio/shared/type-site'
import { resolveStyle } from '@pubstudio/frontend/util-builtin'
import { builtinStyles } from '@pubstudio/frontend/util-builtin'
import { useReusableStyleMenu, useBuild } from '@pubstudio/frontend/feature-build'
import EditMenuTitle from '../EditMenuTitle.vue'
import MixinSelect from './MixinSelect.vue'

const props = defineProps<{
  mixinIds: string[]
}>()
const { mixinIds } = toRefs(props)

const { t } = useI18n()
const {
  site,
  editor,
  addComponentMixin,
  replaceComponentMixin,
  removeComponentMixin,
  flattenComponentMixin,
} = useBuild()
const { setEditingStyle } = useReusableStyleMenu()

const showNewMixin = ref(false)

const mixinOptions = computed(() => {
  const values = Object.values(site.value.context.styles)
  for (const builtinStyle of Object.values(builtinStyles)) {
    if (!resolveStyle(site.value.context, builtinStyle.id)) {
      values.push(builtinStyle)
    }
  }
  return values.map((style) => ({
    label: style.name,
    value: style.id,
  }))
})

const mixins = computed(() => {
  const mixins: IStyle[] = []
  for (const id of mixinIds.value) {
    const style = resolveStyle(site.value.context, id)
    if (style) {
      mixins.push(style)
    }
  }
  return mixins
})

const setMixin = (oldMixinId: string | undefined, newMixinId: string) => {
  if (oldMixinId) {
    replaceComponentMixin(oldMixinId, newMixinId)
  } else {
    showNewMixin.value = false
    addComponentMixin(newMixinId)
  }
}

const edit = (mixinId: string) => {
  setEditingStyle(mixinId)
}

const flattenMixin = (mixinId: string) => {
  const component = editor.value?.selectedComponent
  if (component) {
    flattenComponentMixin(component.id, mixinId)
  }
}

const removeMixin = (mixinId: string | undefined) => {
  if (mixinId) {
    removeComponentMixin(mixinId)
  }
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.component-menu-mixins {
  background-color: $menu-bg2;
  width: 100%;
  padding: 0 16px 4px;
}
.edit-icon {
  margin-left: auto;
  flex-shrink: 0;
}
.edit-item {
  margin-right: 16px;
}
.mixin {
  padding: 0 0 8px 0;
}
</style>
