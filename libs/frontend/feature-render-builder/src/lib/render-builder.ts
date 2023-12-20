import { setEditSvg } from '@pubstudio/frontend/feature-build'
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
import { Edit } from '@pubstudio/frontend/ui-widgets'
import { setSelectedComponent } from '@pubstudio/frontend/util-command'
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
import { IDndState } from './dnd/builder-dnd'
import { BuilderDndComponent } from './dnd/builder-dnd-component'

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

  const selected = editor?.selectedComponent?.id === component.id

  if (component.tag === Tag.Img && !data.attrs.src) {
    data.mixins.push('__image')
  }
  if (component.tag === Tag.A) {
    builderProps['onClick'] = (e: Event) => {
      e.preventDefault()
    }
  }
  if (selected) {
    if (component.tag === Tag.A) {
      extraChildren = [
        h(LinkTooltip, {
          link: data.attrs.href,
          componentId: component.id,
        }),
      ]
      data.mixins.push('__link')
      data.attrs.href = 'javascript:'
      getPosition()
      if (position !== 'absolute' && position !== 'relative') {
        builderClass.push('force-relative')
      }
    }
    if (component.tag === Tag.Ul || component.tag === Tag.Ol) {
      extraChildren = [h(ListAdd, { componentId: component.id })]
      getPosition()
      if (position !== 'absolute' && position !== 'relative') {
        builderClass.push('force-relative')
      }
    } else if (component.tag === Tag.Svg) {
      // Make sure wrapper is `position: relative;` so we can position the edit icon
      builderClass.push('svg-sel')
      // Add an icon that shows SvgEditModal on click
      extraChildren = [
        h(Edit, {
          color: 'white',
          class: 'svg-edit',
          onClick: () => setEditSvg(site.editor, { content: component.content ?? '' }),
        }),
      ]
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

  if (site.editor?.componentsHidden[component.id]) {
    builderStyle.opacity = '0'
  }

  if (selected) {
    builderStyle.border = '1.5px solid #3768FF'
  } else if (editor?.debugBounding) {
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
  const isSelected = editor?.selectedComponent?.id === component.id

  const content: IBuildContent = []
  if (component.children?.length) {
    content.push(
      ...component.children.map((child, index) => renderComponent(site, child, index)),
    )
  } else if (component.content) {
    if (component.tag === Tag.Svg) {
      content.push(
        h('div', { class: 'component-content-container', innerHTML: component.content }),
      )
    } else if (isSelected) {
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
    component.tag !== Tag.Img &&
    component.tag !== Tag.Svg &&
    component.children === undefined
  ) {
    if (isSelected) {
      content.push(h(ProseMirrorEditor, { component, editor }))
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
  const childrenLen = component.children?.length ?? 0
  return h(BuilderDndComponent, {
    site,
    component,
    renderKey: `${component.id}-${childrenLen}-${componentIndex}`,
  })
}
