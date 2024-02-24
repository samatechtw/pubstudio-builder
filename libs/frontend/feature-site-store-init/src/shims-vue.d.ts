interface ImportMeta {
  readonly hot?: ViteHotContext
}

interface ViteHotContext {
  decline(): void
}
