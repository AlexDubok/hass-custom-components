/**
 * Converts a Python-style dictionary string to valid JSON
 * @param pythonDict - String representation of a Python dictionary
 * @returns Parsed JavaScript object
 */
export function parsePythonDict(pythonDict = '{}'): Record<string, unknown> {
  if (!pythonDict) return {};

  try {
    // Replace single quotes with double quotes
    const jsonString = pythonDict
      .replace(/'/g, '"')
      // Handle any other Python-specific syntax if needed
      .replace(/None/g, 'null')
      .replace(/True/g, 'true')
      .replace(/False/g, 'false');

    return JSON.parse(jsonString) as Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: unknown) {
    return {};
  }
}
