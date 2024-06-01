export function diff<T>(a: T[], b: T[]): {
  adds: T[]
  dels: T[]
  exist: [oldIndex: number, newIndex: number, T][]
} {
  const adds: T[] = []
  const dels: T[] = []
  const exist: [number, number, T][] = []
  const map = new Map<T, number>()
  a.forEach((v, i) => map.set(v, i))
  b.forEach((v, i) => {
    const oldIndex = map.get(v)
    if (oldIndex === undefined) {
      adds.push(v)
    } else {
      exist.push([oldIndex, i, v])
    }
  })
  a.forEach(v => {
    if (!b.includes(v)) dels.push(v)
  })
  return { adds, dels, exist }
}
