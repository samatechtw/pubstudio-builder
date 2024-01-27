export const siteNameValid = (name: string) => {
  return /^[a-zA-Z0-9 ]{2,50}$/.test(name)
}
