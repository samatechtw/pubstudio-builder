<template>
  <div class="component-menu-mixins">
    <div class="wrap">
      <EditMenuTitle :title="t('style.reusable_styles')" @add="addMixin" />
      <div v-if="showNewMixin" class="mixin new-mixin">
        <MixinSelect
          ref="newMixinRef"
          :mixin="undefined"
          :mixinOptions="mixinOptions"
          :isNew="true"
          @set="setMixin($event.oldMixinId, $event.newMixinId)"
          @remove="showNewMixin = false"
        />
      </div>
      <MixinSelect
        v-for="mixin in resolvedMixins"
        :key="`${mixin.id}-${mixin.sourceCustomComponentId}`"
        :mixin="mixin.style"
        :mixinOptions="mixinOptions"
        :sourceCustomComponentId="mixin.sourceCustomComponentId"
        class="mixin"
        @set="setMixin($event.oldMixinId, $event.newMixinId)"
        @edit="openMixinMenu(site, $event, true)"
        @remove="removeMixin($event)"
        @flatten="flattenMixin(mixin.id)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { resolveComponent, resolveStyle } from '@pubstudio/frontend/util-resolve'
import { builtinStyles } from '@pubstudio/frontend/util-builtin'
import { openMixinMenu, useBuild } from '@pubstudio/frontend/feature-build'
import { IComponent } from '@pubstudio/shared/type-site'
import EditMenuTitle from '../EditMenuTitle.vue'
import MixinSelect from './MixinSelect.vue'
import { IComponentMixin, IResolvedComponentMixin } from './i-component-mixin'

const props = defineProps<{
  component: IComponent
}>()
const { component } = toRefs(props)

const { t } = useI18n()
const {
  site,
  editor,
  addComponentMixin,
  replaceComponentMixin,
  removeComponentMixin,
  flattenComponentMixin,
} = useBuild()

const showNewMixin = ref(false)
const newMixinRef = ref()

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
  // Keep track of used mixins so that mixins with the same id
  // will only be displayed once.
  // Key: mixinId, value: sourceCustomComponentId
  const mixinSources = new Map<string, string | undefined>()

  const customCmp = resolveComponent(site.value.context, component.value.customSourceId)

  if (customCmp) {
    // Append mixins from custom component
    customCmp.style.mixins?.forEach((mixinId) => {
      mixinSources.set(mixinId, customCmp.id)
    })
  }

  // Append mixins from component
  component.value.style.mixins?.forEach((mixinId) => {
    mixinSources.set(mixinId, undefined)
  })

  const mixins: IComponentMixin[] = Array.from(mixinSources).map(
    ([mixinId, sourceCustomComponentId]) => ({
      id: mixinId,
      sourceCustomComponentId,
    }),
  )

  return mixins
})

const mixinCompare = (a: IComponentMixin, b: IComponentMixin): number => {
  const order = site.value.context.styleOrder
  const indexA = order.indexOf(a.id)
  const indexB = order.indexOf(b.id)
  if (indexA === -1) {
    return -1
  } else if (indexB === -1) {
    return 1
  }
  if (a.sourceCustomComponentId && b.sourceCustomComponentId) {
    return indexA - indexB
  } else if (a.sourceCustomComponentId) {
    return -1
  } else if (b.sourceCustomComponentId) {
    return 1
  }
  return indexA - indexB
}

const resolvedMixins = computed(() => {
  const resolvedMixins: IResolvedComponentMixin[] = []
  const sortedMixins = [...mixins.value].sort(mixinCompare)
  for (const mixin of sortedMixins) {
    const style = resolveStyle(site.value.context, mixin.id)
    if (style) {
      resolvedMixins.push({
        ...mixin,
        style,
      })
    }
  }
  return resolvedMixins
})

const addMixin = async () => {
  showNewMixin.value = true
  setTimeout(() => newMixinRef.value?.multiselectRef?.toggleDropdown(), 1)
}

const setMixin = (oldMixinId: string | undefined, newMixinId: string) => {
  if (oldMixinId) {
    replaceComponentMixin(oldMixinId, newMixinId)
  } else {
    showNewMixin.value = false
    addComponentMixin(newMixinId)
  }
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
  padding: 0 16px;
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
