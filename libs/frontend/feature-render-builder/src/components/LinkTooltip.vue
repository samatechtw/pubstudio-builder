<template>
  <Teleport to="body">
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
      <div v-if="editing" class="editing-wrap">
        <Checkbox
          class="open-in-new-tab-checkbox"
          :item="{
            label: t('build.open_in_new_tab'),
            checked: openInNewTab,
          }"
          @checked="openInNewTab = $event"
        />
        <Check class="link-save" color="#009879" @click="updateLink" />
      </div>
      <div v-else class="icon-wrap">
        <IconTooltip :tip="t('edit')">
          <Edit class="edit-link" @click="edit" />
        </IconTooltip>
        <CopyText :text="link" class="copy-text" />
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import {
  computed,
  nextTick,
  ref,
  toRefs,
  onMounted,
  onUnmounted,
  toRaw,
  watch,
} from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { EditorView } from 'prosemirror-view'
import { TextSelection } from 'prosemirror-state'
import {
  Check,
  Checkbox,
  IconTooltip,
  CopyText,
  Edit,
  PSInput,
} from '@pubstudio/frontend/ui-widgets'
import { useBuild, getLinkDatalistOptions } from '@pubstudio/frontend/feature-build'
import { useTooltip } from '@pubstudio/frontend/util-tooltip'
import { resolveComponent } from '@pubstudio/frontend/util-builtin'
import { ComponentArgPrimitive } from '@pubstudio/shared/type-site'
import { createLinkNode, schemaText } from '@pubstudio/frontend/util-edit-text'
import { LinkTooltipMode } from '../lib/enum-link-tooltip-mode'
import { Node, ResolvedPos } from 'prosemirror-model'

const { t } = useI18n()
const {
  site,
  changePage,
  setSelectedIsInput,
  addOrUpdateComponentInput,
  removeComponentInput,
} = useBuild()

const props = withDefaults(
  defineProps<{
    link: string
    componentId: string
    defaultOpenInNewTab?: boolean
    mode: LinkTooltipMode
    editView?: EditorView
    anchor?: Element
  }>(),
  {
    editView: undefined,
    defaultOpenInNewTab: false,
    anchor: undefined,
  },
)
const { link, componentId, defaultOpenInNewTab, mode, editView, anchor } = toRefs(props)

const linkInput = ref()
const editing = ref(false)
const editedLink = ref('')
const openInNewTab = ref(defaultOpenInNewTab.value)

const linkDatalist = computed(() => getLinkDatalistOptions(site.value, componentId.value))

const internalLink = computed(() => {
  return link.value?.startsWith('/') && link.value in site.value.pages
})

const component = computed(() => resolveComponent(site.value.context, componentId.value))

const componentTargetInput = computed(
  () => component.value?.inputs?.target?.is as string | undefined,
)

const gotoPage = () => {
  changePage(link.value)
}

const edit = async () => {
  editing.value = true
  editedLink.value = link.value
  if (mode.value === LinkTooltipMode.Component) {
    // Overwrite openInNewTab with the latest component input because inputs can be changed
    // from the component menu when LinkTooltip is already mounted.
    openInNewTab.value = componentTargetInput.value === '_blank'
  }
  await nextTick()
  linkInput.value?.inputRef?.focus()
  await updatePosition()
}

const updateLink = async () => {
  editing.value = false

  if (mode.value === LinkTooltipMode.Component) {
    updateComponentInputs()
  } else if (mode.value === LinkTooltipMode.ProseMirror) {
    updateProseMirrorLink()
  }

  editedLink.value = ''
  await updatePosition()
}

const updateComponentInputs = () => {
  setSelectedIsInput('href', editedLink.value)

  if (openInNewTab.value) {
    addOrUpdateComponentInput('target', {
      type: ComponentArgPrimitive.String,
      name: 'target',
      attr: true,
      is: '_blank',
    })
  } else if (componentTargetInput.value === '_blank') {
    removeComponentInput('target')
  }
}

// Gets the link absolute start and end by traversing nodes around `cursor` to see if they
// have the same link mark
const getLinkPosition = (pos: ResolvedPos): number[] => {
  const linkMark = schemaText.marks.link
  const parent = pos.parent
  const idx = pos.index()
  const selNode = parent.child(idx)
  const href = linkMark.isInSet(selNode?.marks ?? [])?.attrs?.href
  let start = pos.pos - pos.textOffset
  let end = start + parent.child(idx).nodeSize
  if (!href) {
    return [start, end]
  }
  // Check nodes after the cursor to get the link's end pos
  let nodeOffset = 1
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const node = parent.child(idx + nodeOffset)
    if (nodeOffset >= parent.childCount || !linkMark.isInSet(node.marks ?? [])) {
      break
    }
    nodeOffset += 1
    end = end + node.nodeSize ?? 0
  }
  // Check nodes before the cursor to get the link's start pos
  nodeOffset = 1
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const node = parent.child(pos.index() - nodeOffset)
    if (nodeOffset < 0 || !linkMark.isInSet(node.marks ?? [])) {
      break
    }
    nodeOffset += 1
    start = start - node.nodeSize ?? 0
  }
  return [start, end]
}

const updateProseMirrorLink = () => {
  // toRaw is necessary because ProseMirror doesn't behave well when proxied
  // eslint-disable-next-line max-len
  // https://discuss.prosemirror.net/t/getting-rangeerror-applying-a-mismatched-transaction-even-with-trivial-code/4948/6
  const { state } = toRaw(editView.value) ?? {}
  if (state) {
    const { $cursor } = state.selection as TextSelection
    if ($cursor) {
      const [start, end] = getLinkPosition($cursor)
      const target = openInNewTab.value ? '_blank' : undefined
      // TODO: is it possible to keep other marks? (color, font-weight, font-family, etc)
      // We could check each node and retain it instead of replacing, if the part of the text
      // it contains is unchanged
      const newLinkNode = createLinkNode(schemaText, editedLink.value, target)
      editView.value?.dispatch(state.tr.replaceWith(start, end, newLinkNode))
    }
  }
}

const {
  itemRef,
  tooltipRef,
  tooltipStyle,
  updatePosition,
  tooltipMouseEnter,
  tooltipMouseLeave,
} = useTooltip({
  placement: 'top-start',
  shift: true,
  flip: true,
})

const getAnchor = () => anchor.value ?? document.getElementById(componentId.value)

onMounted(() => {
  itemRef.value = getAnchor()
  tooltipMouseEnter()
})

watch(anchor, () => {
  itemRef.value = getAnchor()
  updatePosition()
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
  box-shadow: 0 1px 6px 1px rgba(0, 0, 0, 0.1);
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

.editing-wrap {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  .open-in-new-tab-checkbox {
    margin: 0 8px 0 4px;
    color: $color-text;
    flex-shrink: 0;
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
  flex-shrink: 0;
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
