<template>
  <div class="behavior-menu">
    <div class="top">
      <div class="title">
        {{ t('build.behaviors') }}
      </div>
      <Plus class="new" @click="showNewBehavior" />
    </div>
    <div v-for="behavior in behaviors" :key="behavior.id" class="behavior-row">
      <div>
        {{ behavior.name }}
      </div>
      <div class="item edit-item" @click="showEditBehavior(behavior.id)">
        <Edit class="edit-icon" />
      </div>
    </div>
    <div v-if="behaviors.length === 0" class="no-behaviors">
      {{ t('build.no_custom_behaviors') }}
    </div>
    <BehaviorModal />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { setEditBehavior } from '@pubstudio/frontend/feature-editor'
import { Edit, Plus } from '@pubstudio/frontend/ui-widgets'
import { useBuild } from '@pubstudio/frontend/feature-build'
import BehaviorModal from '../component-menu/BehaviorModal.vue'

const { t } = useI18n()
const { editor, site } = useBuild()

const showEditBehavior = (id: string) => {
  setEditBehavior(editor.value, site.value.context.behaviors?.[id])
}

const showNewBehavior = () => {
  setEditBehavior(editor.value, {
    name: '',
  })
}

const behaviors = computed(() => {
  return Object.values(site.value.context.behaviors ?? {})
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.behavior-menu {
  @mixin flex-col;
  height: 100%;
  width: 200px;
  padding-top: 24px;
  background-color: white;
  align-items: center;
  padding: 24px 8px 0;
  .top {
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 8px;
  }
  .behavior-row {
    @mixin text 16px;
    color: $color-text;
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding: 7px 6px 4px 0;
  }
  .title {
    @mixin title-semibold 15px;
  }
  .new {
    @mixin size 22px;
    cursor: pointer;
  }
  > div:not(:first-child) {
    margin-top: 4px;
  }
  .no-behaviors {
    @mixin title-medium 15px;
    color: $grey-500;
  }
}
</style>
