import * as fs from 'fs'
import * as path from 'path'

export const capitalize = (string: string) =>
  string.charAt(0).toUpperCase() + string.slice(1)

export const decapitalize = (string: string) =>
  string.charAt(0).toLowerCase() + string.slice(1)

export const allOrNothing = (bool: any, char: string) => bool ? char || bool : ''

/**
 * Saves a file to a path, and optionally formats to JSON
 * @param data The data to save
 */
export async function saveFile(data: {}, options: {
  outputFilePath: string,
  isJSON?: boolean
}) {
  try {
    if (!fs.existsSync(path.dirname(options.outputFilePath))) {
      fs.mkdirSync(path.dirname(options.outputFilePath), { recursive: true })
    }

    fs.writeFile(
      options.outputFilePath,
      options.isJSON
        ? JSON.stringify(data, null, 2)
        : data,
      (err: any) => {
        if (err) throw new Error(err)
      }
    )
  } catch (thrown) {
    throw new Error(thrown)
  }
}
