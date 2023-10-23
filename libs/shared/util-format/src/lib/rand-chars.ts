export const randChars = (len: number) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let s = ''
  for (let i = 0; i < len; i += 1) {
    s += chars[Math.floor(Math.random() * chars.length)]
  }
  return s
}
