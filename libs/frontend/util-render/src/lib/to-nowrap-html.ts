// Each line of text in the ProseMirror editor is wrapped inside a
// <div class="pm-p">...</div> element, causing nowrap ellipsis CSS
// properties on the component to lose effect. To maintain the desired
// ellipsis behavior, we have to extract the HTML from each `div.pm-p` node.
// This ensures that the one-line ellipsis can function correctly while
// preserving partial styles such as color, font-weight, etc.
export const toNoWrapHtml = (html: string): string => {
  const div = document.createElement('div')
  div.innerHTML = html

  let noWrapHtml = ''
  div.childNodes.forEach((pmpNode) => {
    if (pmpNode.nodeType === Node.ELEMENT_NODE) {
      noWrapHtml += (pmpNode as HTMLElement).innerHTML
    }
  })

  return noWrapHtml
}
