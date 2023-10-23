import { CssUnit, IResizeData } from '@pubstudio/shared/type-site'

export const getWidthPxPerPercent = (parentRect: DOMRect, unit: CssUnit): number => {
  if (unit === CssUnit['%']) {
    return parentRect.width / 100
  } else if (unit === CssUnit.vw) {
    return window.innerWidth / 100
  } else if (unit === CssUnit.vh) {
    return window.innerHeight / 100
  } else {
    return 0
  }
}

export const getHeightPxPerPercent = (parentRect: DOMRect, unit: CssUnit): number => {
  if (unit === CssUnit['%']) {
    return parentRect.height / 100
  } else if (unit === CssUnit.vw) {
    return window.innerWidth / 100
  } else if (unit === CssUnit.vh) {
    return window.innerHeight / 100
  } else {
    return 0
  }
}

const normalize = (value: number): string => {
  const nonNaNValue = Number.isNaN(value) ? 0 : value
  return Math.max(nonNaNValue, 0).toFixed(2).replace('.00', '')
}

export const calcNextHeight = (e: MouseEvent, data: IResizeData): string => {
  let value = -1
  const offset = e.clientY - data.startY
  if (data.heightUnit === CssUnit.px) {
    value = data.startHeight + offset
  } else if ([CssUnit['%'], CssUnit.vw, CssUnit.vh].includes(data.heightUnit)) {
    value = data.startHeight + offset / data.heightPxPerPercent
  }
  return `${normalize(value)}${data.heightUnit}`
}

export const calcNextWidth = (e: MouseEvent, data: IResizeData): string => {
  let value = -1
  const offset = e.clientX - data.startX
  if (data.widthUnit === CssUnit.px) {
    value = data.startWidth + offset
  } else if ([CssUnit['%'], CssUnit.vw, CssUnit.vh].includes(data.widthUnit)) {
    value = data.startWidth + offset / data.widthPxPerPercent
  }
  return `${normalize(value)}${data.widthUnit}`
}
