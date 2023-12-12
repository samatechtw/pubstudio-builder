<template>
  <div ref="tooltipRef" class="link-tooltip" :style="tooltipStyle" @mousedown.stop>
    <PSInput
      v-if="editing"
      ref="linkInput"
      v-model="editedLink"
      class="link-input"
      :datalistId="componentId"
      :datalist="linkDatalist"
      :draggable="true"
      @dragstart.stop.prevent
      @keyup.enter="updateLink"
      @keyup.esc="$event.srcElement.blur()"
    />
    <div v-else-if="internalLink" class="link-view" @click="gotoPage">
      {{ link }}
    </div>
    <a v-else-if="link" :href="link" target="_blank" class="link-view" @click.stop>
      {{ link }}
    </a>
    <div v-else class="empty">
      {{ t('build.no_link') }}
    </div>
    <Check v-if="editing" class="link-save" color="#009879" @click="updateLink" />
    <div v-else class="icon-wrap">
      <IconTooltip :tip="t('edit')">
        <Edit class="edit-link" @click="edit" />
      </IconTooltip>
      <CopyText :text="link" class="copy-text" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, toRefs, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import {
  Check,
  IconTooltip,
  CopyText,
  Edit,
  PSInput,
} from '@pubstudio/frontend/ui-widgets'
import { useBuild, getLinkDatalistOptions } from '@pubstudio/frontend/feature-build'
import { useTooltip } from '@pubstudio/frontend/util-tooltip'

const { t } = useI18n()
const { site, changePage, setSelectedIsInput } = useBuild()

const props = defineProps<{
  link: string
  componentId: string
}>()
const { link, componentId } = toRefs(props)

const linkInput = ref()
const editing = ref(false)
const editedLink = ref('')

const linkDatalist = computed(() => getLinkDatalistOptions(site.value, componentId.value))

const internalLink = computed(() => {
  return link.value?.startsWith('/') && link.value in site.value.pages
})

const gotoPage = () => {
  changePage(link.value)
}

const edit = async () => {
  editing.value = true
  editedLink.value = link.value
  await nextTick()
  linkInput.value?.inputRef?.focus()
}

const updateLink = () => {
  setSelectedIsInput('href', editedLink.value)
  editing.value = false
  editedLink.value = ''
}

const { itemRef, tooltipRef, tooltipStyle, tooltipMouseEnter, tooltipMouseLeave } =
  useTooltip({
    placement: 'top-start',
    shift: true,
    flip: true,
  })

onMounted(() => {
  itemRef.value = document.getElementById(componentId.value)
  tooltipMouseEnter()
})

onUnmounted(() => {
  tooltipMouseLeave()
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.edit {
  @mixin size 28px;
  cursor: pointer;
  filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.8));
  position: absolute;
  top: -20px;
  right: -20px;
}
.empty {
  @mixin title-medium 14px;
  color: $grey-500;
}
.link-tooltip {
  display: flex;
  background-color: white;
  border-radius: 2px;
  justify-content: space-between;
  align-items: center;
  user-select: none;
  padding: 4px 6px 3px;
  height: 36px;
  min-width: 240px;
  z-index: 1000;
  cursor: default;
}
.link-view {
  @mixin truncate;
  @mixin title-normal 14px;
  max-width: 200px;
  margin-right: 6px;
  cursor: pointer;
  color: $color-text;
}
.link-input {
  height: 100%;
  width: 100%;
  margin-right: 6px;
  :deep(.ps-input) {
    height: 100%;
    width: 100%;
  }
}
.icon-wrap {
  margin-left: auto;
  display: flex;
}
.link-save,
.edit-link {
  @mixin size 22px;
  cursor: pointer;
}
.copy-wrap {
  display: flex;
  align-items: center;
}
.copy {
  @mixin size 18px;
  margin-left: 8px;
  flex-shrink: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  &:hover :deep(path) {
    fill: $color-toolbar-button-active;
    stroke: $color-toolbar-button-active;
  }
}

.arrow {
  position: absolute;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid white;
  bottom: 10px;
  left: calc(50% - 6px);
}
</style>
