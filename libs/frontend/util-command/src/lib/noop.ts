import { ISite } from '@pubstudio/shared/type-site'

export const noop = (_site: ISite, _data: unknown) => {
  console.log(
    'applyCommand should not be called with Undo or Redo.\n' +
      'Use undoCommand and redoCommand instead.',
  )
}
