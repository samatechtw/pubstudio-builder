export interface IParsedFlex {
  grow: string
  shrink: string
  basis: string
}
export const flexDefaults: IParsedFlex = {
  grow: '1',
  shrink: '1',
  basis: '0',
}

const growShrinkRegex = /^[0-9]*([.][0-9]+)?$/

export const parseFlex = (val: string | undefined): IParsedFlex => {
  if (!val) {
    return { ...flexDefaults }
  }
  const arr = val.split(' ')
  if (arr.length === 1) {
    if (growShrinkRegex.test(arr[0])) {
      return { ...flexDefaults, grow: arr[0] }
    } else {
      return { ...flexDefaults, basis: arr[0] }
    }
  } else if (arr.length === 2) {
    if (growShrinkRegex.test(arr[1])) {
      return { grow: arr[0], shrink: arr[1], basis: flexDefaults.basis }
    } else {
      return { grow: arr[0], shrink: flexDefaults.shrink, basis: arr[1] }
    }
  }
  return { grow: arr[0], shrink: arr[1], basis: arr[2] }
}
