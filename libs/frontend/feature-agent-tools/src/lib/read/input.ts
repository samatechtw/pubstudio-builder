import { anyOf, arr, bool, Infer, num, obj, oneOf, str } from '../schema/schema'

export const DEFAULT_TREE_DEPTH = 4
export const MAX_COMPONENTS = 25

export const COMPONENT_INCLUDES = [
  'style',
  'overrides',
  'inputs',
  'events',
  'editorEvents',
  'state',
  'children',
] as const

export type ComponentInclude = (typeof COMPONENT_INCLUDES)[number]

export const READ_INPUT_SCHEMA = obj({
  site: bool()
    .optional()
    .desc(
      'Set true for site orientation, pages, breakpoints, theme variables and counts.',
    ),
  tree: obj({
    page: str()
      .optional()
      .desc('Page route. Defaults to the active page; ignored when componentId is set.'),
    componentId: str()
      .optional()
      .desc('Component id to use as the tree root instead of a page root.'),
    depth: num().dflt(DEFAULT_TREE_DEPTH).desc('Maximum descendant depth to return.'),
  })
    .optional()
    .desc('Read a compact component tree. Use an empty object for the active page.'),
  components: arr(str())
    .optional()
    .desc(`Read detailed views for up to ${MAX_COMPONENTS} component ids.`),
  include: arr(oneOf(COMPONENT_INCLUDES))
    .optional()
    .desc(
      'Fields to include with components. Defaults to style, inputs and events; only used with components.',
    ),
  styles: obj({
    componentId: str().desc('Component id.'),
    breakpointId: str()
      .optional()
      .desc(
        'Limit raw custom styles to this breakpoint, or choose the effective breakpoint when resolved is true.',
      ),
    resolved: bool()
      .dflt(false)
      .desc(
        'Set true to include effective values and the mixin or breakpoint each came from.',
      ),
  })
    .optional()
    .desc('Read raw or resolved styles for one component.'),
  find: obj({
    tag: str().optional().desc('Match this exact HTML tag.'),
    name: str().optional().desc('Case-insensitive component-name substring.'),
    text: str().optional().desc('Case-insensitive content substring.'),
    hasMixin: str().optional().desc('Match components using this mixin id.'),
    page: str().optional().desc('Limit matches to this page route.'),
  })
    .optional()
    .desc('Find components. All supplied filters must match.'),
  mixins: anyOf(bool(), arr(str()))
    .optional()
    .desc('Set true to list mixin summaries, or pass mixin ids for full definitions.'),
  theme: bool().optional().desc('Set true to read theme variables and fonts.'),
  behaviors: anyOf(bool(), arr(str()))
    .optional()
    .desc(
      'Set true to list behavior summaries, or pass behavior ids for full definitions.',
    ),
  i18n: anyOf(bool(), arr(str()))
    .optional()
    .desc(
      'Set true to list language summaries, or pass language codes for translations.',
    ),
  head: obj({
    page: str().optional().desc('Page route. Defaults to the active page.'),
  })
    .optional()
    .desc('Read page head entries together with site-wide defaults.'),
  builtins: bool().optional().desc('Set true to list builtin components and behaviors.'),
  html: obj({
    componentId: str().desc('Id of a component rendered on the active builder canvas.'),
  })
    .optional()
    .desc('Read the rendered outerHTML for one component.'),
  history: obj({
    n: num().dflt(10).desc('Number of recent undo entries to return.'),
  })
    .optional()
    .desc('Read undo/redo depth and recent command types.'),
})

export type IReadInput = Infer<typeof READ_INPUT_SCHEMA>
