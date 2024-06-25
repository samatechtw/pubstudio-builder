export const replaceBackground = (currentBackground: string, assetUrl: string) => {
  const cssValue = `url("${assetUrl}")`
  if (CSS.supports('background', currentBackground)) {
    // Replace the background value and retain any non-url information.
    // Find a more efficient & comprehensive way to extract attributes from CSS value.
    const attributes = currentBackground
      .split(/([^\s]+|"[^"]+"|'[^']+')/g)
      .filter((value) => value.trim())
    const valueIndex = attributes.findIndex(
      (value) =>
        // url(...), radial-gradient(crimson, skyblue), etc.
        CSS.supports('background-image', value) ||
        // red, green, etc.
        CSS.supports('color', value),
    )
    attributes[valueIndex] = cssValue
    return attributes.join(' ')
  } else {
    return cssValue
  }
}
