import { getProseMirrorContainerId } from '@pubstudio/frontend/data-access-command'
import { store } from '@pubstudio/frontend/data-access-web-store'
import {
  createComponentEditorView,
  editViewTxCount,
  useBuild,
  useToolbar,
} from '@pubstudio/frontend/feature-build'
import {
  activeBreakpoint,
  descSortedBreakpoints,
} from '@pubstudio/frontend/feature-site-source'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { findStyles } from '@pubstudio/frontend/util-component'
import {
  firstMarkInSelection,
  markSelected,
  prosemirrorSetup,
  schemaText,
  setOrRemoveStyleMark,
} from '@pubstudio/frontend/util-edit-text'
import { resolveComponent, resolveThemeVariables } from '@pubstudio/frontend/util-resolve'
import { Css, IComponent, IEditorContext } from '@pubstudio/shared/type-site'
import { DOMSerializer, Fragment, Slice } from 'prosemirror-model'
import { EditorState, Plugin, TextSelection, Transaction } from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'
import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  PropType,
  ref,
  toRaw,
  toRefs,
  watch,
} from 'vue'
import { isTextGradient } from '@samatech/vue-color-picker'
import { LinkTooltipMode } from '../lib/enum-link-tooltip-mode'
import LinkTooltip from './LinkTooltip.vue'

export const ProseMirrorEditor = defineComponent({
  name: 'ProseMirrorEditor',
  props: {
    component: {
      type: Object as PropType<IComponent>,
      required: true,
    },
    editor: {
      type: Object as PropType<IEditorContext>,
      required: true,
    },
  },
  setup(props) {
    const { component, editor } = toRefs(props)
    const { site, editSelectedComponent, duplicateComponent } = useBuild()
    const { siteStore } = useSiteSource()
    const { getStyleValue } = useToolbar()

    const container = ref<HTMLDivElement>()
    const containerId = computed(() => getProseMirrorContainerId(component.value))

    const getContent = (component: IComponent, defaultContent = ''): string => {
      if (component.content) {
        return component.content
      }
      const custom = resolveComponent(site.value.context, component.customSourceId)
      return custom?.content ?? defaultContent
    }

    const markStrong = (state: EditorState, dispatch?: (tr: Transaction) => void) => {
      const fallbackStyle = getStyleValue(Css.FontWeight)
      const mark = firstMarkInSelection(state, schemaText.marks.strong)
      const newWeight = mark?.attrs[Css.FontWeight] === '700' ? '400' : '700'
      const cmd = setOrRemoveStyleMark(
        schemaText.marks.strong,
        Css.FontWeight,
        newWeight,
        fallbackStyle,
      )
      return cmd(state, dispatch)
    }

    const fragmentContent = (state: EditorState, fragment: Fragment): string => {
      const selection = new Slice(fragment, 0, 0)

      const serialized = DOMSerializer.fromSchema(state.schema).serializeFragment(
        selection.content,
      )
      return [].map.call(serialized.children, (e: HTMLElement) => e.outerHTML).join('')
    }

    const splitComponent = (
      state: EditorState,
      _dispatch?: (tr: Transaction) => void,
    ) => {
      const { $head } = state.selection as TextSelection
      const content1 = state.doc.content.cut(0, $head.pos)
      const content2 = state.doc.content.cut($head.pos, state.doc.content.size)
      const text1 = fragmentContent(state, content1)
      const text2 = fragmentContent(state, content2)
      editSelectedComponent({ content: text1 })
      duplicateComponent(text2)
      return true
    }

    const exitProsemirror = () => {
      if (store.version.editingEnabled.value) {
        siteStore.save(site.value)
      }
      editor.value.editView?.destroy()
      editor.value.editView = undefined
      return true
    }

    const mountProseMirrorEditor = (
      editor: IEditorContext | undefined,
      container: HTMLElement | null | undefined,
    ) => {
      const { selectedComponent } = editor ?? {}
      if (editor && container && selectedComponent) {
        const plugins: Plugin[] = [
          new Plugin({
            props: {
              attributes: { style: gradientColorStyle.value },
              transformPastedHTML: (html) => {
                const element = document.createElement('div')
                element.innerHTML = html
                return element.textContent ?? ''
              },
            },
          }),
        ]
        // Helps retain the current selection if the editor is unfocused
        // Used for setting selection text size
        const selPlugin: Plugin = new Plugin({
          state: {
            init() {
              // No initialization
            },
            apply(tr, _state) {
              if (tr.getMeta('selDeco')) {
                const sel = tr.selection as TextSelection
                if (!sel || sel.empty || sel.$cursor) {
                  return undefined
                }
                const decorations: Decoration[] = [
                  Decoration.inline(sel.$from.pos, sel.$to.pos, { class: 'sel' }),
                ]
                return DecorationSet.create(tr.doc, decorations)
              }
            },
          },
          props: {
            decorations(state) {
              return selPlugin.getState(state)
            },
          },
        })
        plugins.push(selPlugin)

        editor.editView?.destroy()
        editor.editView = createComponentEditorView(
          {
            content: getContent(selectedComponent, '<div class="pm-p"></div>'),
            plugins,
            mapKeys: {
              'Mod-b': markStrong,
              'Mod-B': markStrong,
              'Mod-/': splitComponent,
              //Escape: exitProsemirror,
              Escape: () => {
                return false
              },
            },
          },
          container,
        )
      }
    }

    const gradientColorStyle = computed(() => {
      const gradientColorStyles = findStyles(
        [Css.WebkitTextFillColor, Css.WebkitBackgroundClip, Css.Background],
        site.value,
        component.value,
        descSortedBreakpoints.value,
        activeBreakpoint.value,
      )

      const background = resolveThemeVariables(
        site.value.context,
        gradientColorStyles[Css.Background] ?? '',
      )
      const backgroundClip = gradientColorStyles[Css.WebkitBackgroundClip]
      const textFillColor = gradientColorStyles[Css.WebkitTextFillColor]

      const textGradientApplied = isTextGradient(
        background,
        backgroundClip,
        textFillColor,
      )

      if (textGradientApplied) {
        return [
          [Css.Background, background],
          [Css.WebkitBackgroundClip, backgroundClip],
          [Css.WebkitTextFillColor, textFillColor],
        ]
          .map(([prop, value]) => `${prop}:${value}`)
          .join(';')
      } else {
        return ''
      }
    })

    onMounted(() => {
      mountProseMirrorEditor(editor.value, container.value)
      const el = container.value
      el?.addEventListener('focusout', (e) => {
        const tag = (e.relatedTarget as HTMLElement)?.tagName?.toLowerCase()
        // Only set selection when an input is focused (e.g. text size), otherwise
        // the browser will scroll back to the editor component when the transaction is dispatched
        if (tag === 'input') {
          const view = toRaw(editor.value?.editView)
          if (view) {
            const tr = view.state.tr.setMeta('selDeco', {})
            view.dispatch(tr)
          }
        }
      })
    })

    // Use watch to re-mount ProseMirror editor so that text gradient styles can be
    // applied/removed to/from the component on the fly.
    watch(gradientColorStyle, () => {
      mountProseMirrorEditor(editor.value, container.value)
    })

    onBeforeUnmount(() => {
      exitProsemirror()
    })

    watch(
      () => editor.value?.selectedComponent?.content,
      () => {
        // This is to update ProseMirror editor state when the editor is active (which
        // means this Vue component is alive), and the corresponding component content
        // is being updated from somewhere else (e.g. redo/undo/component-menu).
        // We should only update ProseMirror editor state when the editor is not focused
        // because `updateState()` will cause the editor to lose its' focus and selection.
        const proseMirrorFocused =
          document.activeElement?.classList.contains('ProseMirror')
        if (!proseMirrorFocused) {
          const newState = prosemirrorSetup({
            schema: schemaText,
            content: getContent(component.value),
          })
          editor.value?.editView?.updateState(newState)
        }
      },
    )

    const cursorLinkAttrs = ref()
    let linkElement: Element | undefined = undefined

    watch(editViewTxCount, () => {
      // TODO -- it might be better to track selectionSet in dispatchTransaction, so we only need to
      // check for links when the user selects text
      const { editView } = editor.value
      if (editView) {
        const [linkMark, element] = markSelected(
          editView.state,
          schemaText.marks.link,
          editView,
        )
        cursorLinkAttrs.value = linkMark?.attrs
        linkElement = element
      }
    })

    return () => {
      return h(
        'div',
        {
          id: containerId.value,
          ref: container,
          class: 'prose-mirror-editor-container',
        },
        cursorLinkAttrs.value
          ? h(LinkTooltip, {
              link: cursorLinkAttrs.value.href ?? '',
              componentId: component.value.id,
              defaultOpenInNewTab: cursorLinkAttrs.value.target === '_blank',
              mode: LinkTooltipMode.ProseMirror,
              editView: editor.value.editView,
              anchor: linkElement,
            })
          : undefined,
      )
    }
  },
})
