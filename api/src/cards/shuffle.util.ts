export function shuffle<T>(items: readonly T[]): T[] {
  const result: T[] = [...items];

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j: number = Math.floor(Math.random() * (i + 1));
    const tmp: T = result[i];
    result[i] = result[j];
    result[j] = tmp;
  }

  return result;
}
