<template>
  <div v-if="child" class="instance-child">
    <div class="instance-child-title">
      {{ t('build.instance_child', { name: child.name }) }}
      <InfoBubble :message="t('build.instance_child_info')" placement="top" />
    </div>
    <MenuRowSimple
      :label="t('content')"
      :value="resolvedContent"
      :editable="true"
      :editing="editing"
      class="instance-child-content"
      @edit="editContent"
      @update="setContent"
    />
    <PSButton
      v-if="hasOverride"
      class="instance-child-reset"
      size="small"
      :secondary="true"
      :text="t('build.reset_override')"
      @click="reset"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { pushCommand } from '@pubstudio/frontend/data-access-command'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { InfoBubble, PSButton } from '@pubstudio/frontend/ui-widgets'
import { CommandType } from '@pubstudio/shared/type-command'
import { ISetInstanceOverrideData } from '@pubstudio/shared/type-command-data'
import { IComponent } from '@pubstudio/shared/type-site'
import MenuRowSimple from '../MenuRowSimple.vue'

const props = defineProps<{
  component: IComponent
}>()
const { component } = toRefs(props)

const { t } = useI18n()
const { site, editor } = useSiteSource()
const editing = ref(false)

const childId = computed(() => editor.value?.selectedInstanceChildId)

const child = computed(() =>
  childId.value ? resolveComponent(site.value.context, childId.value) : undefined,
)

const override = computed(() =>
  childId.value ? component.value.instanceOverrides?.[childId.value] : undefined,
)

const hasOverride = computed(() => !!override.value)

const resolvedContent = computed(() => override.value?.content ?? child.value?.content)

const editContent = () => {
  editing.value = true
}

const push = (newOverride: ISetInstanceOverrideData['newOverride']) => {
  if (!childId.value) {
    return
  }
  const data: ISetInstanceOverrideData = {
    componentId: component.value.id,
    childId: childId.value,
    oldOverride: override.value ? { ...override.value } : undefined,
    newOverride,
  }
  pushCommand(site.value, CommandType.SetInstanceOverride, data)
}

const setContent = (value: string | undefined) => {
  editing.value = false
  push({ ...override.value, content: value })
}

const reset = () => {
  push(undefined)
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.instance-child {
  padding: 8px 16px;
  background-color: $menu-bg2;
}
.instance-child-title {
  @mixin title-semibold 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}
.instance-child-reset {
  margin-top: 8px;
}
</style>
