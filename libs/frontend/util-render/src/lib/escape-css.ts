// Render style content with `innerHTML` (not a text child), because @vue/server-renderer
// HTML-escapes text children while the browser assigns them via `textContent`. `<style>`
// is a text element, so the browser never decodes its content (an escaped `&` stays `&amp;`,
// corrupting url() query strings and diverging server markup from client markup at hydration.
//
// That makes closing-tag escaping our responsibility. The only sequence that can terminate a raw
// text element is a literal `</`, so that's all we escape. `\00003c` is the CSS escape for `<`.
export const escapeCssForStyleTag = (css: string): string =>
  css.replace(/<\//g, '\\00003c/')
