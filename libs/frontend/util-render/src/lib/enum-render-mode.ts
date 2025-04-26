export enum RenderMode {
  // Rendering to editor on /build page
  Build = 'build',
  // Preview page (Referenced from editor, hosted on platform)
  Preview = 'preview',
  // Preview embedded in the platform, e.g. template preview modal
  PreviewEmbed = 'previewEmbed',
  // Live page
  Release = 'release',
}

export type RenderModeType = `${RenderMode}`
