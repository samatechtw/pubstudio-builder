<template>
  <div class="menu-row">
    <div class="label">
      {{ t('build.role') }}
      <InfoBubble :message="t('build.role_info')" :showArrow="false" class="bubble" />
    </div>
    <PSMultiselect
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
import { useI18n } from 'vue-i18n'
import { AriaRole, AriaRoleValues } from '@pubstudio/shared/type-site'
import { InfoBubble, PSMultiselect } from '@pubstudio/frontend/ui-widgets'

const props = withDefaults(
  defineProps<{
    role?: AriaRole | undefined
  }>(),
  {
    role: undefined,
  },
)
const { role } = toRefs(props)
const emit = defineEmits<{
  (e: 'setRole', value: AriaRole): void
}>()

const { t } = useI18n()

const setRole = (newRole: AriaRole) => {
  if (newRole !== role.value) {
    emit('setRole', newRole)
  }
}
</script>

<style lang="postcss" scoped>
.menu-row {
  justify-content: space-between;
}
.label {
  display: flex;
}
.bubble {
  margin-left: 8px;
}
.component-role {
  max-width: 140px;
  margin: 0 0 0 16px;
}
</style>
