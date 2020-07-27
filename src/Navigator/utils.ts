/**
 * Removes removeValues from values
 * @param {string[]} values
 * @param {string[]} removeValues
 * @returns {string[]}
 */
export function filterStringArray(
  values: string[],
  removeValues: string[]
): string[] {
  return values.filter(v => !removeValues.includes(v));
}
