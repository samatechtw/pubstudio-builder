import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-defaults'
import { svgId, svgStyleId } from '@pubstudio/frontend/util-ids'
import { IComponent, IStyle, Tag } from '@pubstudio/shared/type-site'

export const svgStyle: IStyle = {
  id: svgStyleId,
  name: 'SvgStyle',
  breakpoints: {
    [DEFAULT_BREAKPOINT_ID]: {
      default: {
        width: '32px',
        height: '32px',
      },
    },
  },
}

export const svg: IComponent = {
  id: svgId,
  name: 'Svg',
  tag: Tag.Svg,
  style: {
    custom: {},
    mixins: [svgStyle.id],
  },
}
