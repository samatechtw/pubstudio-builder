export const scrollAnchor = (id: string): void => {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({
      behavior: 'smooth',
    })
  }
}

export const copy = (text: string): void => {
  const copyTextArea = document.createElement('textarea')
  copyTextArea.value = text
  document.body.appendChild(copyTextArea)
  copyTextArea.select()
  document.execCommand('copy')
  document.body.removeChild(copyTextArea)
}
