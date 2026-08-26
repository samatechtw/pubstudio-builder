import { ISerializedEditorContext, ISiteContext } from '@pubstudio/shared/type-site'
import { deserializeEditor } from './deserialize-site'

const context = () => ({ components: {} }) as unknown as ISiteContext

describe('deserializeEditor', () => {
  it('defaults the record fields an empty stored editor omits', () => {
    const editor = deserializeEditor(context(), {} as ISerializedEditorContext)

    expect(editor?.componentTreeExpandedItems).toEqual({})
    expect(editor?.componentsHidden).toEqual({})
    expect(editor?.componentTab).toEqual({})
  })

  it('keeps stored expand state', () => {
    const editor = deserializeEditor(context(), {
      componentTreeExpandedItems: { 'test-c-0': true },
    } as unknown as ISerializedEditorContext)

    expect(editor?.componentTreeExpandedItems).toEqual({ 'test-c-0': true })
  })
})
