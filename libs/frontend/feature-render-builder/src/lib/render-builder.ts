import { setSelectedComponent } from '@pubstudio/frontend/data-access-command'
import {
  computeAttrsInputsMixins,
  computeEvents,
  IAttrsInputsMixins,
  parseI18n,
} from '@pubstudio/frontend/feature-render'
import {
  activeBreakpoint,
  descSortedBreakpoints,
} from '@pubstudio/frontend/feature-site-source'
import { builderContext, resetBuilderContext } from '@pubstudio/frontend/util-builder'
import { findStyles } from '@pubstudio/frontend/util-component'
import {
  IBuildContent,
  IPropsBuildContent,
  RenderMode,
} from '@pubstudio/frontend/util-render'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import {
  Css,
  IComponent,
  IPage,
  IRawStyle,
  ISite,
  Tag,
} from '@pubstudio/shared/type-site'
import { h, VNode } from 'vue'
import LinkTooltip from '../components/LinkTooltip.vue'
import { ListAdd } from '../components/ListAdd'
import { ProseMirrorEditor } from '../components/ProseMirrorEditor'
import SvgEdit from '../components/SvgEdit.vue'
import { IDndState } from './dnd/builder-dnd'
import { BuilderDndComponent } from './dnd/builder-dnd-component'
import { LinkTooltipMode } from './enum-link-tooltip-mode'

// Style and props for a component rendered in the builder
interface IBuilderStyleProps {
  builderStyle: IRawStyle | undefined
  builderProps: Record<string, unknown> | undefined
  extraChildren: VNode[] | undefined
  builderClass: string[]
}

const computeBuilderStyleProps = (
  site: ISite,
  component: IComponent,
  data: IAttrsInputsMixins,
  dndState: IDndState | undefined,
): IBuilderStyleProps => {
  const { editor } = site

  const builderStyle: IRawStyle = {}
  const builderProps: Record<string, unknown> = {}
  let extraChildren: VNode[] | undefined = undefined
  const builderClass: string[] = []
  let position: string | null | undefined = undefined

  const cmp = resolveComponent(site.context, component.customSourceId) ?? component

  // Cache CSS position. Must be called before using `position`
  const getPosition = (): string | null => {
    if (position !== undefined) {
      return position
    }
    position =
      findStyles(
        [Css.Position],
        site,
        cmp,
        descSortedBreakpoints.value,
        activeBreakpoint.value,
      ).position ?? null
    return position
  }
  // Force builder container to be relative position
  const forceRelative = () => {
    const pos = getPosition()
    if (!pos) {
      builderClass.push('force-relative')
    }
  }

  const selected = editor?.selectedComponent?.id === component.id

  if (component.tag === Tag.Img && !data.attrs.src) {
    data.mixins.push('__image')
  }
  if (component.tag === Tag.A) {
    builderProps['onClick'] = (e: Event) => {
      e.preventDefault()
    }
  }
  if (component.tag === Tag.Form) {
    builderProps['onSubmit'] = (e: Event) => {
      e.preventDefault()
    }
  }
  if (component.tag === Tag.Input || component.tag === Tag.Textarea) {
    builderProps['readonly'] = true
    builderStyle['cursor'] = 'default'
  }
  if (selected) {
    if (component.tag === Tag.A) {
      const display =
        findStyles(
          [Css.Display],
          site,
          cmp,
          descSortedBreakpoints.value,
          activeBreakpoint.value,
        ).display ?? null
      // Don't show the tooltip if the link isn't in the DOM
      if (display !== 'none') {
        extraChildren = [
          h(LinkTooltip, {
            link: (data.attrs.href ?? '') as string,
            componentId: component.id,
            mode: LinkTooltipMode.Component,
          }),
        ]
        data.mixins.push('__link')
        builderProps.href = 'javascript:'
        forceRelative()
      }
      // TODO -- move this to DndOverlay
    } else if (component.tag === Tag.Ul || component.tag === Tag.Ol) {
      extraChildren = [h(ListAdd, { componentId: component.id })]
      forceRelative()
    } else if (component.tag === Tag.Svg) {
      // Add an icon that shows SvgEditModal on click
      extraChildren = [h(SvgEdit, { componentId: component.id })]
      forceRelative()
    }
  }

  const hoveredInComponentTree =
    builderContext.hoveredComponentIdInComponentTree.value === component.id

  if (hoveredInComponentTree) {
    builderClass.push('hover-in-tree')
    const pos = getPosition()
    if (pos && pos !== 'relative') {
      builderClass.push(`hover-in-tree--${pos}`)
    }

    extraChildren = (extraChildren ?? []).concat(h('div', { class: 'hover-overlay' }))
  }

  if (editor?.prefs.debugBounding) {
    builderStyle.border = '1.5px dashed #999'
  }
  if (editor?.prefs.overrideOpacity) {
    builderStyle.opacity = '1'
  }
  if (editor?.prefs.overrideTransform) {
    builderStyle.transform = 'none'
  }
  if (dndState) {
    // Drag
    if (dndState.dragging) {
      builderStyle.opacity = '0.2'
    } else if (dndState.hovering) {
      builderStyle.opacity = '0.8'
    }
  }

  // Set pointer-events to auto so that components are always clickable in the builder
  // even if pointer-events: none; is set on the components.
  builderStyle['pointer-events'] = 'auto'

  if (site.editor?.componentsHidden[component.id]) {
    builderStyle.opacity = '0'
    builderStyle['pointer-events'] = 'none'
  }

  return { builderStyle, builderProps, builderClass, extraChildren }
}

export const renderPage = (site: ISite, page: IPage): VNode | undefined => {
  resetBuilderContext()
  const rootNode = renderComponent(site, page.root, 0)
  return rootNode
}

export const computePropsContent = (
  site: ISite,
  component: IComponent,
  renderMode: RenderMode,
  dndState?: IDndState,
): IPropsBuildContent => {
  const data = computeAttrsInputsMixins(site.context, component, {
    renderMode,
    editor: site.editor,
  })
  computeEvents(site, component)

  const { editor } = site
  const isSelected = editor?.selectedComponent?.id === component.id
  const customCmp = resolveComponent(site.context, component.customSourceId)

  const cmpContent = component.content ?? customCmp?.content

  const content: IBuildContent = []
  const hasChildren = (component.children?.length ?? 0) > 0
  const customCmpHasChildren = (customCmp?.children?.length ?? 0) > 0

  if (hasChildren) {
    content.push(
      ...(component.children?.map((child, index) =>
        renderComponent(site, child, index),
      ) ?? []),
    )
  } else if (customCmpHasChildren) {
    content.push(
      ...(customCmp?.children?.map((child, index) =>
        renderComponent(site, child, index),
      ) ?? []),
    )
  } else if (cmpContent) {
    if (component.tag === Tag.Svg) {
      content.push(h('div', { class: 'svg-container', innerHTML: cmpContent }))
    } else if (isSelected && component.tag !== 'input' && component.tag !== 'textarea') {
      const cmpWithDefaultContent: IComponent = { ...component, content: cmpContent }
      content.push(h(ProseMirrorEditor, { component: cmpWithDefaultContent, editor }))
    } else {
      const active = site.editor?.editorI18n ?? 'en'

      content.push(
        h('div', {
          class: 'component-content-container',
          innerHTML: parseI18n(site.context.i18n, active, cmpContent),
        }),
      )
    }
  } else if (
    !['img', 'svg', 'input', 'textarea'].includes(component.tag) &&
    !hasChildren &&
    !customCmpHasChildren
  ) {
    if (isSelected) {
      const cmpWithDefaultContent: IComponent = { ...component, content: cmpContent }
      content.push(h(ProseMirrorEditor, { component: cmpWithDefaultContent, editor }))
      if (component.tag === Tag.A) {
        content.push(
          h('div', { class: '__link-placeholder' }, 'Add text or drop components'),
        )
      }
    } else {
      content.push(
        h('div', {
          class: 'pm-p pm-p-placeholder',
          onclick: () => {
            setSelectedComponent(site, component)
          },
        }),
      )
    }
  }

  let builderStyleProps: IBuilderStyleProps | undefined = undefined
  if (editor?.active) {
    builderStyleProps = computeBuilderStyleProps(site, component, data, dndState)
    const { extraChildren } = builderStyleProps
    if (extraChildren) {
      content.push(...extraChildren)
    }
  }

  // TODO -- improve efficiency by avoiding unnecessary input/attr computation
  // in computeAttrsInputsMixins
  // Ignore HTML attrs in builder
  const attrs: Record<string, unknown> = {}
  if (component.tag === Tag.Input || component.tag === Tag.Textarea) {
    for (const att of ['placeholder', 'rows', 'type']) {
      if (data.attrs[att]) {
        attrs[att] = data.attrs[att]
      }
    }
  }
  if (data.attrs.src) {
    attrs.src = data.attrs.src
  }
  data.attrs = attrs

  const props = {
    ...data.attrs,
    ...builderStyleProps?.builderProps,
    // TODO -- should all native events really be disabled in the builder?
    // ...events.native,
    class: data.mixins.concat(component.id, builderStyleProps?.builderClass ?? []),
    style: builderStyleProps?.builderStyle,
    id: component.id,
  }

  return {
    content,
    props,
  }
}

export const renderComponent = (
  site: ISite,
  component: IComponent,
  componentIndex: number,
): VNode | undefined => {
  const childrenLen = component.children?.length ?? 0
  return h(BuilderDndComponent, {
    site,
    component,
    renderKey: `${component.id}-${childrenLen}-${componentIndex}`,
  })
}
