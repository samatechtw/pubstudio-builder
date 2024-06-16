// Get the offset of the a component from the build content window
export const computeComponentOffset = (
  componentId: string | undefined,
): number | undefined => {
  if (componentId === undefined) {
    return undefined
  }
  const editorWindow = document
    .getElementById('build-content-window')
    ?.getBoundingClientRect()
  const component = document.getElementById(componentId)?.getBoundingClientRect()
  if (editorWindow && component) {
    const pushDown = component.top - editorWindow.top < 30
    return pushDown ? component.height - 20 : -28
  }
}
