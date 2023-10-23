export const validateBillingName = (name: string): boolean => {
  // Allows alphanumeric characters, Chinese characters, spaces, and only the special characters ,.()/-
  return /^[\p{Script=Han}a-zA-Z,.()/\- ]*$/gu.test(name)
}
