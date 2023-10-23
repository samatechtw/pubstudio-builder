export const scrollTop = () => {
  const scrollContainer = document.getElementById('scroll-container')
  if (scrollContainer) {
    scrollContainer.scrollIntoView()
  }
}
