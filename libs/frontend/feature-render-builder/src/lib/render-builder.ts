import { setSelectedComponent } from '@pubstudio/frontend/data-access-command'
import {
  computeAttrsInputsMixins,
  computeEvents,
  IAttrsInputsMixins,
  IBuildContent,
  IPropsBuildContent,
  parseI18n,
} from '@pubstudio/frontend/feature-render'
import {
  activeBreakpoint,
  descSortedBreakpoints,
} from '@pubstudio/frontend/feature-site-source'
import { findStyles } from '@pubstudio/frontend/util-component'
import { RenderMode } from '@pubstudio/frontend/util-render'
import { resetRuntimeContext, runtimeContext } from '@pubstudio/frontend/util-runtime'
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
export interface IBuilderStyleProps {
  builderStyle: IRawStyle | undefined
  builderProps: Record<string, unknown> | undefined
  extraChildren: VNode[] | undefined
  builderClass: string[]
}

export const computeBuilderStyleProps = (
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

  // Cache the CSS position. Must be called before using `position`
  const getPosition = (): string | null => {
    if (position !== undefined) {
      return position
    }
    position =
      findStyles(
        [Css.Position],
        site,
        component,
        descSortedBreakpoints.value,
        activeBreakpoint.value,
      ).position ?? null
    return position
  }
  // Force builder container to be relative position
  const forceRelative = () => {
    const pos = getPosition()
    if (pos !== 'absolute' && pos !== 'relative') {
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
          component,
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
        data.attrs.href = 'javascript:'
        forceRelative()
      }
    }
    if (component.tag === Tag.Ul || component.tag === Tag.Ol) {
      extraChildren = [h(ListAdd, { componentId: component.id })]
      forceRelative()
    } else if (component.tag === Tag.Svg) {
      // Add an icon that shows SvgEditModal on click
      extraChildren = [h(SvgEdit, { componentId: component.id })]
      forceRelative()
    }
  }

  const hoveredInComponentTree =
    runtimeContext.hoveredComponentIdInComponentTree.value === component.id

  if (hoveredInComponentTree) {
    builderClass.push('hover-in-tree')

    if (getPosition() === 'absolute') {
      builderClass.push('hover-in-tree--absolute')
    }

    extraChildren = (extraChildren ?? []).concat(h('div', { class: 'hover-overlay' }))
  }

  const hoveredInEditor = editor?.hoveredComponent?.id === component.id

  if (hoveredInEditor) {
    builderClass.push('hover')

    getPosition()
    if (position !== 'absolute' && position !== 'relative') {
      builderClass.push('force-relative')
    }

    const onDragstart = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }
    extraChildren = (extraChildren ?? []).concat([
      h('div', {
        class: 'hover-edge right',
        /* When resizing an absolute-position img, both div.hover-wrap and img (first child of hover-wrap)
          are absolute-position, and we haven't found a way match hover-wrap to the component size in CSS.
          So, `data-component-id` is used to adjust the size of the wrapper on mousemove events.
          */
        'data-component-id': component.id,
        draggable: true,
        onDragstart,
      }),
      h('div', {
        class: 'hover-edge bottom',
        'data-component-id': component.id,
        draggable: true,
        onDragstart,
      }),
      h('div', {
        class: 'hover-edge bottom-right',
        'data-component-id': component.id,
        draggable: true,
        onDragstart,
      }),
      // h('div', { class: 'hover-edge left' }),
      // h('div', { class: 'hover-edge top', draggable: true, onDragstart }),
    ])
  }

  if (editor?.debugBounding) {
    builderStyle.border = '1.5px dashed #999'
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
  resetRuntimeContext()
  const rootNode = renderComponent(site, page.root, 0)
  return rootNode
}

export const computePropsContent = (
  site: ISite,
  component: IComponent,
  renderMode: RenderMode,
  dndState?: IDndState,
): IPropsBuildContent => {
  // TODO -- handle inputs
  const data = computeAttrsInputsMixins(site.context, component, {
    renderMode,
    editor: site.editor,
  })
  const events = computeEvents(site, component)

  const { editor } = site
  const isSelected = editor?.selectedComponent?.id === component.id

  const content: IBuildContent = []
  const hasChildren = (component.children?.length ?? 0) > 0

  if (hasChildren) {
    content.push(
      ...component.children!.map((child, index) => renderComponent(site, child, index)),
    )
  } else if (component.content) {
    if (component.tag === Tag.Svg) {
      content.push(
        h('div', { class: 'component-content-container', innerHTML: component.content }),
      )
    } else if (
      isSelected &&
      component.tag !== Tag.Input &&
      component.tag !== Tag.Textarea
    ) {
      content.push(h(ProseMirrorEditor, { component, editor }))
    } else {
      content.push(
        h('div', {
          class: 'component-content-container',
          innerHTML: parseI18n(site, component.content),
        }),
      )
    }
  } else if (
    ![Tag.Img, Tag.Svg, Tag.Input, Tag.Textarea].includes(component.tag) &&
    !hasChildren
  ) {
    if (isSelected) {
      content.push(h(ProseMirrorEditor, { component, editor }))
      if (component.tag === Tag.A) {
        content.push(
          h('div', { class: '__link-placeholder' }, 'Add text or drop components'),
        )
      }
    } else {
      content.push(
        h('div', {
          class: 'pm-p pm-p-placeholder',
          onclick: () => setSelectedComponent(site, component),
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
    customEventHandlers: events.custom,
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
