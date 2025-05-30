<template>
  <div
    ref="tooltipRef"
    class="link-tooltip"
    :class="{ tall: editing && mode === LinkTooltipMode.ProseMirror }"
    :style="{ ...tooltipStyle, 'z-index': 3000 }"
    @mousedown.stop
  >
    <div v-if="editing" class="link-input-wrap">
      <STInput
        v-if="mode === LinkTooltipMode.ProseMirror"
        v-model="editedText"
        :label="t('text')"
        class="link-input"
        :draggable="true"
        @dragstart.stop.prevent
        @keyup.enter="updateLink"
        @keyup.esc="($event.target as HTMLInputElement)?.blur()"
      />
      <STInput
        ref="linkInput"
        v-model="editedLink"
        class="link-input"
        :datalistId="componentId"
        :datalist="linkDatalist"
        :draggable="true"
        @dragstart.stop.prevent
        @keyup.enter="updateLink"
        @keyup.esc="($event.target as HTMLInputElement)?.blur()"
      />
    </div>
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
        class="new-tab-checkbox"
        :item="{
          label: t('build.open_in_new_tab'),
          checked: openInNewTab,
        }"
        @checked="openInNewTab = $event"
      />
      <Check class="link-save" color="#009879" @click="updateLink" />
    </div>
    <div v-else class="icon-wrap">
      <IconTooltip :tip="t('edit')" class="edit-wrap">
        <Edit class="edit-link" @click="edit" />
      </IconTooltip>
      <CopyText :text="link" class="copy-text" />
      <Trash
        v-if="mode === LinkTooltipMode.ProseMirror"
        color="#b7436a"
        class="delete"
        @click="removeProsemirrorLink"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, onMounted, onUnmounted, toRaw, watch } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { STInput, useTooltip } from '@samatech/vue-components'
import { EditorView } from 'prosemirror-view'
import { EditorState, TextSelection } from 'prosemirror-state'
import { ResolvedPos } from 'prosemirror-model'
import {
  Check,
  Checkbox,
  IconTooltip,
  CopyText,
  Edit,
  Trash,
} from '@pubstudio/frontend/ui-widgets'
import {
  useBuild,
  setSelectedIsInput,
  removeComponentInput,
  addOrUpdateSelectedInput,
  getLinkDatalistOptions,
} from '@pubstudio/frontend/feature-build'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { ComponentArgPrimitive } from '@pubstudio/shared/type-site'
import { createLinkNode, schemaText } from '@pubstudio/frontend/util-edit-text'
import { LinkTooltipMode } from '../lib/enum-link-tooltip-mode'

const { t } = useI18n()
const { site, changePage } = useBuild()

const { link, componentId, defaultOpenInNewTab, mode, editView, anchor } = defineProps<{
  link: string
  componentId: string
  defaultOpenInNewTab?: boolean
  mode: LinkTooltipMode
  editView?: EditorView
  anchor?: Element
}>()

const linkInput = ref()
const editing = ref(false)
const editedLink = ref('')
const editedText = ref('')
const openInNewTab = ref(defaultOpenInNewTab)

const linkDatalist = computed(() => getLinkDatalistOptions(site.value, componentId))

const internalLink = computed(() => {
  return link?.startsWith('/') && link in site.value.pages
})

const component = computed(() => resolveComponent(site.value.context, componentId))

const componentTargetInput = computed(
  () => component.value?.inputs?.target?.is as string | undefined,
)

const gotoPage = () => {
  changePage(link)
}

const edit = async () => {
  editing.value = true
  editedLink.value = link
  if (mode === LinkTooltipMode.Component) {
    // Overwrite openInNewTab with the latest component input because inputs can be changed
    // from the component menu when LinkTooltip is already mounted.
    openInNewTab.value = componentTargetInput.value === '_blank'
  } else {
    const proseLink = getProsemirrorLink()
    if (proseLink) {
      const { state, pos } = proseLink
      editedText.value = state.doc.cut(pos[0], pos[1]).textContent
    }
  }
  await nextTick()
  linkInput.value?.inputRef?.focus()
  await updatePosition()
}

const updateLink = async () => {
  editing.value = false

  if (mode === LinkTooltipMode.Component) {
    updateComponentInputs()
  } else if (mode === LinkTooltipMode.ProseMirror) {
    updateProseMirrorLink()
  }

  editedLink.value = ''
  editedText.value = ''
  await updatePosition()
}

const updateComponentInputs = () => {
  setSelectedIsInput(site.value, 'href', editedLink.value)

  if (openInNewTab.value) {
    addOrUpdateSelectedInput(site.value, 'target', {
      type: ComponentArgPrimitive.String,
      name: 'target',
      attr: true,
      is: '_blank',
    })
  } else if (componentTargetInput.value === '_blank') {
    removeComponentInput(site.value, 'target')
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
  // Check nodes after the cursor to get the link's end pos
  let nodeOffset = 1
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const node = parent.maybeChild(idx + nodeOffset)
    const link = linkMark.isInSet(node?.marks ?? [])
    if (nodeOffset >= parent.childCount || !node || !link || link.attrs?.href !== href) {
      break
    }
    nodeOffset += 1
    end = end + node.nodeSize || 0
  }
  // Check nodes before the cursor to get the link's start pos
  nodeOffset = 1
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const node = parent.maybeChild(pos.index() - nodeOffset)
    const link = linkMark.isInSet(node?.marks ?? [])
    if (nodeOffset < 0 || !node || !link || link.attrs?.href !== href) {
      break
    }
    nodeOffset += 1
    start = start - node.nodeSize || 0
  }
  return [start, end]
}

interface IProsemirrorLink {
  pos: number[]
  state: EditorState
}
const getProsemirrorLink = (): IProsemirrorLink | undefined => {
  // toRaw is necessary because ProseMirror doesn't behave well when proxied
  // eslint-disable-next-line max-len
  // https://discuss.prosemirror.net/t/getting-rangeerror-applying-a-mismatched-transaction-even-with-trivial-code/4948/6
  const { state } = toRaw(editView) ?? {}
  if (state) {
    const { $anchor } = state.selection as TextSelection
    if ($anchor) {
      const pos = getLinkPosition($anchor)
      return { state, pos }
    }
  }
  return undefined
}

const updateProseMirrorLink = () => {
  const proseLink = getProsemirrorLink()
  if (proseLink) {
    const [start, end] = proseLink.pos
    const target = openInNewTab.value ? '_blank' : undefined
    // TODO: is it possible to keep other marks? (color, font-weight, font-family, etc)
    // We could check each node and retain it instead of replacing, if the part of the text
    // it contains is unchanged
    const newLinkNode = createLinkNode(
      schemaText,
      editedText.value,
      editedLink.value,
      target,
    )
    editView?.dispatch(proseLink.state.tr.replaceWith(start, end, newLinkNode))
  }
}

const removeProsemirrorLink = () => {
  const proseLink = getProsemirrorLink()
  if (proseLink) {
    const [start, end] = proseLink.pos
    const tr = proseLink.state.tr.removeMark(start, end, schemaText.marks.link)
    editView?.dispatch(tr.removeMark(start, end, schemaText.marks.u))
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

const getAnchor = () => {
  return anchor ?? document.getElementById(componentId)
}

onMounted(() => {
  itemRef.value = getAnchor()
  tooltipMouseEnter()
})

watch(
  () => anchor,
  () => {
    itemRef.value = getAnchor()
    updatePosition()
  },
)

onUnmounted(() => {
  tooltipMouseLeave()
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.edit {
  @mixin size 28px;
  font-family: $font-text;
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
  padding: 0 6px 2px;
  height: 34px;
  min-width: 240px;
  z-index: 1000;
  cursor: default;
  box-shadow: 0 1px 6px 1px rgba(0, 0, 0, 0.1);
  &.tall {
    height: 70px;
    .editing-wrap {
      flex-direction: column;
      .link-save {
        margin-top: 6px;
      }
    }
  }
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
  margin: 3px 8px 0 0;
  :deep(.st-input) {
    height: 100%;
    width: 100%;
    padding: 6px 8px 5px;
  }
  :deep(.st-input-label) {
    margin-top: -4px;
  }
}

.editing-wrap {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  .new-tab-checkbox {
    margin: 0 8px 0 6px;
    color: $color-text;
    flex-shrink: 0;
    :deep(.checkmark) {
      margin: 2px 4px 0 0;
    }
  }
}
.icon-wrap {
  margin-left: auto;
  display: flex;
  align-items: center;
}
.link-save,
.edit-link {
  @mixin size 22px;
  cursor: pointer;
  flex-shrink: 0;
}
.delete {
  @mixin size 21px;
  margin-left: 6px;
  cursor: pointer;
}
.edit-wrap {
  display: flex;
  align-items: center;
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
