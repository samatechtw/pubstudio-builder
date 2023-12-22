import {
  createComponentEditorView,
  editViewTxCount,
  getProseMirrorContainerId,
  useBuild,
  useToolbar,
} from '@pubstudio/frontend/feature-build'
import {
  activeBreakpoint,
  descSortedBreakpoints,
} from '@pubstudio/frontend/feature-site-source'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { resolveThemeVariables } from '@pubstudio/frontend/util-builtin'
import { findStyles } from '@pubstudio/frontend/util-component'
import {
  firstMarkInSelection,
  prosemirrorSetup,
  schemaText,
  setOrRemoveStyleMark,
} from '@pubstudio/frontend/util-edit-text'
import { isTextGradient } from '@pubstudio/frontend/util-gradient'
import { Css, IComponent, IEditorContext } from '@pubstudio/shared/type-site'
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
  Teleport,
} from 'vue'
import LinkTooltip from './LinkTooltip.vue'
import { LinkTooltipMode } from '../lib/enum-link-tooltip-mode'

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
    const { site } = useBuild()
    const { siteStore } = useSiteSource()
    const { getStyleValue } = useToolbar()

    const container = ref<HTMLDivElement>()
    const containerId = computed(() => getProseMirrorContainerId(component.value))

    const markStrong = (state: EditorState, dispatch?: (tr: Transaction) => void) => {
      const fallbackStyle = getStyleValue(Css.FontWeight)
      const [mark] = firstMarkInSelection(state, schemaText.marks.strong)
      const newWeight = mark?.attrs[Css.FontWeight] === '700' ? '400' : '700'
      const cmd = setOrRemoveStyleMark(
        schemaText.marks.strong,
        Css.FontWeight,
        newWeight,
        fallbackStyle,
      )
      return cmd(state, dispatch)
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
        const selPlugin: Plugin = new Plugin({
          state: {
            init() {},
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
            content: selectedComponent.content || '<div class="pm-p"></div>',
            plugins,
            mapKeys: { 'Mod-b': markStrong, 'Mod-B': markStrong },
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
      el?.addEventListener('focusout', () => {
        const view = toRaw(editor.value?.editView)
        if (view) {
          const tr = view.state.tr.setMeta('selDeco', {})
          view.dispatch(tr)
        }
      })
    })

    // Use watch to re-mount ProseMirror editor so that text gradient styles can be
    // applied/removed to/from the component on the fly.
    watch(gradientColorStyle, () => {
      mountProseMirrorEditor(editor.value, container.value)
    })

    onBeforeUnmount(() => {
      siteStore.value.save(site.value)
      editor.value.editView?.destroy()
      editor.value.editView = undefined
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
            content: component.value.content ?? '',
          })
          editor.value?.editView?.updateState(newState)
        }
      },
    )

    const cursorLinkAttrs = ref()
    let linkElement: Element | undefined = undefined

    watch(editViewTxCount, () => {
      const { editView } = editor.value
      if (editView) {
        const [linkMark, element] = firstMarkInSelection(
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
          ? h(
              // Use teleport to prevent LinkTooltip from constantly changing position
              // due to the relative/absolute layout in the builder.
              Teleport,
              {
                to: 'body',
              },
              [
                h(LinkTooltip, {
                  link: cursorLinkAttrs.value.href ?? '',
                  componentId: component.value.id,
                  defaultOpenInNewTab: cursorLinkAttrs.value.target === '_blank',
                  mode: LinkTooltipMode.ProseMirror,
                  editView: editor.value.editView,
                  anchor: linkElement,
                }),
              ],
            )
          : undefined,
      )
    }
  },
})
