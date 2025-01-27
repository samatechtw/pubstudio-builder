<template>
  <div class="menu-row">
    <div class="label">
      {{ t('build.role') }}
      <InfoBubble :message="t('build.role_info')" :showArrow="false" class="bubble" />
    </div>
    <STMultiselect
      :value="role"
      class="component-role"
      :placeholder="t('build.no_role')"
      :options="AriaRoleValues"
      :clearable="true"
      @select="setRole"
      @click.stop
    />
  </div>
</template>

<script lang="ts" setup>
import { toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { STMultiselect } from '@samatech/vue-components'
import { AriaRole, AriaRoleType } from '@pubstudio/shared/type-site'
import { InfoBubble } from '@pubstudio/frontend/ui-widgets'

const AriaRoleValues: AriaRole[] = Object.values(AriaRole)

const props = withDefaults(
  defineProps<{
    role?: AriaRoleType | undefined
  }>(),
  {
    role: undefined,
  },
)
const { role } = toRefs(props)
const emit = defineEmits<{
  (e: 'setRole', value: AriaRole | undefined): void
}>()

const { t } = useI18n()

const setRole = (newRole: AriaRole | undefined) => {
  if (newRole !== role.value) {
    emit('setRole', newRole)
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
  display: flex;
  align-items: center;
}
.bubble {
  margin-left: 8px;
}
.component-role {
  max-width: 140px;
  margin: 0 0 0 4px;
}
</style>
