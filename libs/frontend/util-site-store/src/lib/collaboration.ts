import {
  DocumentSection,
  ExpectedValue,
  IAcceptedOperation,
  ISetWireCommand,
  WireCommand,
  WirePathSegment,
} from '@pubstudio/shared/type-command'
import { IStoredSite } from '@pubstudio/shared/type-site'

type JsonObject = Record<string, unknown>

const sections: Array<{ key: keyof IStoredSite; section: DocumentSection }> = [
  { key: 'name', section: 'name' },
  { key: 'version', section: 'version' },
  { key: 'context', section: 'context' },
  { key: 'defaults', section: 'defaults' },
  { key: 'pages', section: 'pages' },
  { key: 'pageOrder', section: 'page_order' },
]

const isObject = (value: unknown): value is JsonObject =>
  !!value && typeof value === 'object' && !Array.isArray(value)

const clone = <T>(value: T): T => structuredClone(value)

// serde_json map serialization is not required to preserve the frontend's property
// insertion order. Compare JSON structurally so an accepted add remains idempotent
// after its object keys make a Rust round trip.
const jsonEqual = (left: unknown, right: unknown): boolean => {
  if (left === right) return true
  if (Array.isArray(left) || Array.isArray(right)) {
    return (
      Array.isArray(left) &&
      Array.isArray(right) &&
      left.length === right.length &&
      left.every((value, index) => jsonEqual(value, right[index]))
    )
  }
  if (isObject(left) && isObject(right)) {
    const leftKeys = Object.keys(left)
    const rightKeys = Object.keys(right)
    return (
      leftKeys.length === rightKeys.length &&
      leftKeys.every((key) => key in right && jsonEqual(left[key], right[key]))
    )
  }
  return false
}

const parseSection = (stored: IStoredSite, key: keyof IStoredSite): unknown => {
  const value = stored[key]
  if (key === 'name' || key === 'version') {
    return value
  }
  if (typeof value !== 'string') {
    return value
  }
  return JSON.parse(value)
}

const serializeSection = (
  stored: IStoredSite,
  key: keyof IStoredSite,
  value: unknown,
) => {
  if (key === 'name' || key === 'version') {
    stored[key] = value as never
  } else {
    stored[key] = JSON.stringify(value) as never
  }
}

export const stableItemId = (item: unknown): string | undefined => {
  if (typeof item === 'string') {
    return item
  }
  if (isObject(item) && typeof item.id === 'string') {
    return item.id
  }
  return undefined
}

const stableArray = (value: unknown[]): boolean => {
  const ids = value.map(stableItemId)
  return (
    ids.every((id): id is string => id !== undefined) && new Set(ids).size === ids.length
  )
}

const expectedValue = (value: unknown): ExpectedValue => ({
  kind: 'value',
  value: clone(value),
})

const diffValue = (
  section: DocumentSection,
  path: WirePathSegment[],
  previous: unknown,
  next: unknown,
  output: WireCommand[],
) => {
  if (jsonEqual(previous, next)) {
    return
  }
  if (isObject(previous) && isObject(next)) {
    for (const key of Object.keys(previous)) {
      if (!(key in next)) {
        output.push({
          type: 'delete',
          section,
          path: [...path, key],
          expected: clone(previous[key]),
        })
      }
    }
    for (const key of Object.keys(next)) {
      if (!(key in previous)) {
        output.push({
          type: 'set',
          section,
          path: [...path, key],
          expected: { kind: 'missing' },
          value: clone(next[key]),
        })
      } else {
        diffValue(section, [...path, key], previous[key], next[key], output)
      }
    }
    return
  }
  if (
    Array.isArray(previous) &&
    Array.isArray(next) &&
    stableArray(previous) &&
    stableArray(next)
  ) {
    diffStableArray(section, path, previous, next, output)
    return
  }
  output.push({
    type: 'set',
    section,
    path,
    expected: expectedValue(previous),
    value: clone(next),
    ...(isCounter(section, path) ? { merge: 'max' as const } : {}),
  })
}

const isCounter = (section: DocumentSection, path: WirePathSegment[]): boolean =>
  section === 'context' && path.length === 1 && path[0] === 'nextId'

const diffStableArray = (
  section: DocumentSection,
  path: WirePathSegment[],
  previous: unknown[],
  next: unknown[],
  output: WireCommand[],
) => {
  const previousById = new Map(
    previous.map((item) => [stableItemId(item) as string, item]),
  )
  const nextById = new Map(next.map((item) => [stableItemId(item) as string, item]))
  const working = previous.map((item) => stableItemId(item) as string)
  const desired = next.map((item) => stableItemId(item) as string)

  for (const item of previous) {
    const id = stableItemId(item) as string
    if (!nextById.has(id)) {
      output.push({
        type: 'remove',
        section,
        path,
        item_id: id,
        expected: clone(item),
      })
      working.splice(working.indexOf(id), 1)
    }
  }

  for (let index = 0; index < desired.length; index += 1) {
    const id = desired[index]
    if (!previousById.has(id)) {
      output.push({
        type: 'insert',
        section,
        path,
        item_id: id,
        item: clone(nextById.get(id)),
        after_id: index > 0 ? (working[index - 1] ?? null) : null,
        before_id: working[index] ?? null,
      })
      working.splice(index, 0, id)
    }
  }

  for (let index = 0; index < desired.length; index += 1) {
    const id = desired[index]
    const currentIndex = working.indexOf(id)
    if (currentIndex !== index) {
      const expectedAfter = currentIndex > 0 ? working[currentIndex - 1] : null
      const expectedBefore = working[currentIndex + 1] ?? null
      working.splice(currentIndex, 1)
      output.push({
        type: 'move',
        section,
        path,
        item_id: id,
        expected_after_id: expectedAfter,
        expected_before_id: expectedBefore,
        after_id: index > 0 ? (working[index - 1] ?? null) : null,
        before_id: working[index] ?? null,
      })
      working.splice(index, 0, id)
    }
  }

  for (const id of desired) {
    if (previousById.has(id)) {
      diffValue(
        section,
        [...path, { id }],
        previousById.get(id),
        nextById.get(id),
        output,
      )
    }
  }
}

export const diffStoredSites = (
  previous: IStoredSite,
  next: IStoredSite,
): WireCommand[] => {
  const output: WireCommand[] = []
  for (const { key, section } of sections) {
    diffValue(section, [], parseSection(previous, key), parseSection(next, key), output)
  }
  return output
}

const sectionInfo = (section: DocumentSection) => {
  const info = sections.find((entry) => entry.section === section)
  if (!info) {
    throw new Error(`Unknown document section: ${section}`)
  }
  return info
}

const itemIndex = (array: unknown[], id: string): number =>
  array.findIndex((item) => stableItemId(item) === id)

const resolve = (root: unknown, path: WirePathSegment[]): unknown => {
  let current = root
  for (const segment of path) {
    if (typeof segment === 'string' && isObject(current)) {
      current = current[segment]
    } else if (typeof segment !== 'string' && Array.isArray(current)) {
      current = current[itemIndex(current, segment.id)]
    } else {
      return undefined
    }
  }
  return current
}

const parentAndLast = (root: unknown, path: WirePathSegment[]) => ({
  parent: resolve(root, path.slice(0, -1)),
  last: path[path.length - 1],
})

const getChild = (parent: unknown, segment: WirePathSegment): unknown => {
  if (typeof segment === 'string' && isObject(parent)) {
    return parent[segment]
  }
  if (typeof segment !== 'string' && Array.isArray(parent)) {
    return parent[itemIndex(parent, segment.id)]
  }
  return undefined
}

const expectedMatches = (current: unknown, expected: ExpectedValue): boolean =>
  expected.kind === 'missing' ? current === undefined : jsonEqual(current, expected.value)

const mergeValue = (current: unknown, command: ISetWireCommand): unknown => {
  if (
    command.merge === 'max' &&
    typeof current === 'number' &&
    typeof command.value === 'number'
  ) {
    return Math.max(current, command.value)
  }
  return command.value
}

const insertionIndex = (
  array: unknown[],
  afterId: string | null,
  beforeId: string | null,
): number => {
  if (beforeId) {
    const index = itemIndex(array, beforeId)
    if (index >= 0) return index
  }
  if (afterId) {
    const index = itemIndex(array, afterId)
    if (index >= 0) return index + 1
  }
  if (!afterId && !beforeId) return array.length
  throw new Error('Collaboration insertion anchors no longer exist')
}

const itemAnchors = (array: unknown[], index: number) => ({
  after: index > 0 ? (stableItemId(array[index - 1]) ?? null) : null,
  before: stableItemId(array[index + 1]) ?? null,
})

export const applyWireCommand = (stored: IStoredSite, command: WireCommand): boolean => {
  const { key } = sectionInfo(command.section)
  const root = parseSection(stored, key)
  let changed = false

  if (command.type === 'set') {
    if (!command.path.length) {
      if (jsonEqual(root, command.value)) return false
      if (!expectedMatches(root, command.expected)) {
        throw new Error('Collaboration scalar precondition failed')
      }
      serializeSection(stored, key, clone(command.value))
      return true
    }
    const { parent, last } = parentAndLast(root, command.path)
    const current = getChild(parent, last)
    const value = mergeValue(current, command)
    if (jsonEqual(current, value)) return false
    if (!command.merge && !expectedMatches(current, command.expected)) {
      throw new Error('Collaboration scalar precondition failed')
    }
    if (typeof last === 'string' && isObject(parent)) {
      parent[last] = clone(value)
    } else if (typeof last !== 'string' && Array.isArray(parent)) {
      const index = itemIndex(parent, last.id)
      if (index < 0) throw new Error('Collaboration target no longer exists')
      parent[index] = clone(value)
    } else {
      throw new Error('Collaboration parent no longer exists')
    }
    changed = true
  } else if (command.type === 'delete') {
    const { parent, last } = parentAndLast(root, command.path)
    const current = getChild(parent, last)
    if (current === undefined) return false
    if (!jsonEqual(current, command.expected)) {
      throw new Error('Collaboration delete precondition failed')
    }
    if (typeof last === 'string' && isObject(parent)) {
      delete parent[last]
    } else if (typeof last !== 'string' && Array.isArray(parent)) {
      parent.splice(itemIndex(parent, last.id), 1)
    } else {
      throw new Error('Collaboration parent no longer exists')
    }
    changed = true
  } else {
    const array = resolve(root, command.path)
    if (!Array.isArray(array)) throw new Error('Collaboration array no longer exists')
    const currentIndex = itemIndex(array, command.item_id)
    if (command.type === 'insert') {
      if (currentIndex >= 0) {
        if (jsonEqual(array[currentIndex], command.item)) return false
        throw new Error('Collaboration inserted ID already exists')
      }
      array.splice(
        insertionIndex(array, command.after_id, command.before_id),
        0,
        clone(command.item),
      )
      changed = true
    } else if (command.type === 'remove') {
      if (currentIndex < 0) return false
      if (!jsonEqual(array[currentIndex], command.expected)) {
        throw new Error('Collaboration remove precondition failed')
      }
      array.splice(currentIndex, 1)
      changed = true
    } else {
      if (currentIndex < 0) throw new Error('Collaboration moved item no longer exists')
      const currentAnchors = itemAnchors(array, currentIndex)
      if (
        currentAnchors.after === command.after_id &&
        currentAnchors.before === command.before_id
      ) {
        return false
      }
      if (
        currentAnchors.after !== command.expected_after_id ||
        currentAnchors.before !== command.expected_before_id
      ) {
        throw new Error('Collaboration move precondition failed')
      }
      const [item] = array.splice(currentIndex, 1)
      array.splice(insertionIndex(array, command.after_id, command.before_id), 0, item)
      changed = true
    }
  }

  if (changed) serializeSection(stored, key, root)
  return changed
}

export const applyWireCommands = (
  stored: IStoredSite,
  commands: WireCommand[],
): IStoredSite => {
  const result = clone(stored)
  commands.forEach((command) => applyWireCommand(result, command))
  return result
}

export const applyAcceptedOperations = (
  stored: IStoredSite,
  operations: IAcceptedOperation[],
): IStoredSite => {
  let result = clone(stored)
  for (const operation of operations) {
    result = applyWireCommands(result, operation.commands)
    result.revision = operation.revision
  }
  return result
}
