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
        :key="`${mixin.id}-${mixin.sourceReusableComponentId}`"
        :mixin="mixin.style"
        :mixinOptions="mixinOptions"
        :sourceReusableComponentId="mixin.sourceReusableComponentId"
        class="mixin"
        @set="setMixin($event.oldMixinId, $event.newMixinId)"
        @edit="openMixinMenu($event, true)"
        @remove="removeMixin($event)"
        @flatten="flattenMixin(mixin.id)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { resolveStyle } from '@pubstudio/frontend/util-resolve'
import { builtinStyles } from '@pubstudio/frontend/util-builtin'
import { useBuild, useMixinMenuUi } from '@pubstudio/frontend/feature-build'
import EditMenuTitle from '../EditMenuTitle.vue'
import MixinSelect from './MixinSelect.vue'
import { IComponentMixin, IResolvedComponentMixin } from './i-component-mixin'

const props = defineProps<{
  mixins: IComponentMixin[]
}>()
const { mixins } = toRefs(props)

const { t } = useI18n()
const {
  site,
  editor,
  addComponentMixin,
  replaceComponentMixin,
  removeComponentMixin,
  flattenComponentMixin,
} = useBuild()
const { openMixinMenu } = useMixinMenuUi()

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

const resolvedMixins = computed(() => {
  const resolvedMixins: IResolvedComponentMixin[] = []
  for (const mixin of mixins.value) {
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
