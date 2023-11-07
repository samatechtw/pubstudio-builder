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
import LinkTooltip from '../components/build-render/LinkTooltip.vue'
import ProseMirrorEditor from '../components/build-render/ProseMirrorEditor.vue'
import { IDndState } from './dnd/builder-dnd'
import { BuilderDndComponent } from './dnd/builder-dnd-component'

// Style and props for a component rendered in the builder
export interface IBuilderStyleProps {
  builderStyle: IRawStyle | undefined
  builderProps: Record<string, string> | undefined
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
  const builderProps: Record<string, string> = {}
  let extraChildren: VNode[] | undefined = undefined
  const builderClass: string[] = []

  if (data.attrs.href !== undefined && component.tag === Tag.A) {
    extraChildren = [h(LinkTooltip, { link: data.attrs.href, text: component.content })]
    data.mixins.push('__link')
    data.attrs.href = 'javascript:'
  }
  if (component.tag === Tag.Img && !data.attrs.src) {
    data.mixins.push('__image')
  }

  const hoveredInComponentTree =
    runtimeContext.hoveredComponentIdInComponentTree.value === component.id

  if (hoveredInComponentTree) {
    builderClass.push('hover-in-tree')

    const { position } = findStyles(
      [Css.Position],
      site,
      component,
      descSortedBreakpoints.value,
      activeBreakpoint.value,
    )
    if (position === 'absolute') {
      builderClass.push('hover-in-tree--absolute')
    }

    extraChildren = (extraChildren ?? []).concat(h('div', { class: 'hover-overlay' }))
  }

  const hoveredInEditor = editor?.hoveredComponent?.id === component.id

  if (hoveredInEditor) {
    builderClass.push('hover')

    const { position } = findStyles(
      [Css.Position],
      site,
      component,
      descSortedBreakpoints.value,
      activeBreakpoint.value,
    )
    if (position === 'absolute') {
      builderClass.push('hover-absolute')
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

  const selected = editor?.selectedComponent?.id === component.id
  if (selected) {
    builderStyle.border = '1.5px solid #3768FF'
  } else if (editor?.debugBounding) {
    builderStyle.border = '1.5px dashed #999'
  }
  if (component?.inputs?.href?.is !== undefined) {
    builderProps.target = '__blank'
  }
  if (dndState) {
    // Drag
    if (dndState.dragging) {
      builderStyle.opacity = '0.2'
    } else if (dndState.hovering) {
      builderStyle.opacity = '0.8'
    }

    if (dndState.hoverSelf) {
      builderStyle.border = '1.5px solid #F82389'
    }

    // Drop
    if (dndState.hoverTop) {
      builderStyle['border-top'] = '8px solid black'
      builderStyle['border-top-left-radius'] = '0'
      builderStyle['border-top-right-radius'] = '0'
    }
    if (dndState.hoverRight) {
      builderStyle['border-right'] = '8px solid black'
      builderStyle['border-top-right-radius'] = '0'
      builderStyle['border-bottom-right-radius'] = '0'
    }
    if (dndState.hoverBottom) {
      builderStyle['border-bottom'] = '8px solid black'
      builderStyle['border-bottom-left-radius'] = '0'
      builderStyle['border-bottom-right-radius'] = '0'
    }
    if (dndState.hoverLeft) {
      builderStyle['border-left'] = '8px solid black'
      builderStyle['border-top-left-radius'] = '0'
      builderStyle['border-bottom-left-radius'] = '0'
    }
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
  const data = computeAttrsInputsMixins(site.context, component, { renderMode })
  // TODO -- should we inherit events?
  const events = computeEvents(site, component)

  const { editor } = site
  const content: IBuildContent = []

  if (component.children?.length) {
    content.push(
      ...component.children.map((child, index) => renderComponent(site, child, index)),
    )
  } else if (component.content) {
    const isSelected = editor?.selectedComponent?.id === component.id
    if (isSelected) {
      content.push(h(ProseMirrorEditor, { component, editor }))
    } else {
      content.push(
        h('div', {
          class: 'component-content-container',
          innerHTML: parseI18n(site, component.content),
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
    ...events.native,
    class: data.mixins.concat(builderStyleProps?.builderClass ?? []),
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
  if (component.state?.hide) {
    return undefined
  }
  const childrenLen = component.children?.length ?? 0
  return h(BuilderDndComponent, {
    site,
    component,
    renderKey: `${component.id}-${childrenLen}-${componentIndex}`,
  })
}
