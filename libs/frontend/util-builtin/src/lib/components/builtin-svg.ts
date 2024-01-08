import { DEFAULT_BREAKPOINT_ID, svgId, svgStyleId } from '@pubstudio/frontend/util-ids'
import { IComponent, IStyle, Tag } from '@pubstudio/shared/type-site'

export const svgStyle: IStyle = {
  id: svgStyleId,
  name: 'SvgStyle',
  breakpoints: {
    [DEFAULT_BREAKPOINT_ID]: {
      default: {
        width: '32px',
        height: '32px',
        fill: '${color-text}',
        stroke: '${color-text}',
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
