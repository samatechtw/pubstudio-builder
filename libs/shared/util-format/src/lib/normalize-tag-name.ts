export function normalizeTagName(name: string): string {
  return name.toLowerCase().split(' ').join('_')
}
