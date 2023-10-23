<template>
  <div class="history-row-wrap" :class="{ current: isCurrent }">
    <div class="history-row" @click="handleClick">
      <div>
        {{ t(`history.command.${command.type}`) }}
      </div>
      <div v-if="isCurrent" class="check-wrap">
        <Check class="check-icon" />
      </div>
    </div>
    <div v-for="(groupCommand, index) in groupCommands" :key="index" class="group">
      {{ t(`history.command.${groupCommand.type}`) }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { Check } from '@pubstudio/frontend/ui-widgets'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { ICommandGroupData } from '@pubstudio/shared/type-command-data'

const { t } = useI18n()

const props = defineProps<{
  command: ICommand
  isCurrent?: boolean
}>()
const { isCurrent, command } = toRefs(props)

const emit = defineEmits<{
  (e: 'click'): void
}>()

const groupCommands = computed(() => {
  if (command.value?.type === CommandType.Group) {
    const cmds = command.value.data as ICommandGroupData
    return cmds.commands as ICommand[]
  }
  return []
})

const handleClick = () => {
  if (!isCurrent.value) {
    emit('click')
  }
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.history-row-wrap {
  cursor: pointer;
  color: $color-text;
  border-bottom: 1px solid $grey-300;
  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }
  &:first-child {
    border-top: 1px solid $grey-300;
  }
  &.current {
    cursor: default;
    background-color: $grey-100;
  }
}
.history-row {
  @mixin text 13px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 4px 5px 4px 4px;
}
.check-wrap {
  display: flex;
  align-items: center;
}
.check-icon {
  @mixin size 18px;
}
.group {
  @mixin text 12px;
  padding: 3px 4px 4px 16px;
}
</style>
