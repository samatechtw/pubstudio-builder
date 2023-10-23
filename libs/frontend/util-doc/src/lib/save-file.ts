export const saveFile = (
  filename: string,
  data: string | Uint8Array,
  fileType: string,
) => {
  const blob = new Blob([data], { type: fileType })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const navAny = window.navigator as any
  if (navAny.msSaveOrOpenBlob) {
    navAny.msSaveBlob(blob, filename)
  } else {
    const elem = window.document.createElement('a')
    elem.href = window.URL.createObjectURL(blob)
    elem.download = filename
    document.body.appendChild(elem)
    elem.click()
    document.body.removeChild(elem)
  }
}
