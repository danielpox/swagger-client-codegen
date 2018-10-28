import path from 'path'
import chalk from 'chalk'

import { saveFile } from '../utils'
import { parseSwagger } from '../swagger'

import { createSchema } from './builder'

import { IGeneratorOptions } from '../interfaces'

/**
 * Generate a GraphQL API client based on a Swagger JSON file
 */
export async function generateGraphQLClient (options: IGeneratorOptions): Promise<void> {
  try {
    if (options == null) {
      throw new Error(chalk.bgBlack.red(`You must pass the required options to ${ chalk.bold.white(generateGraphQLClient.name) }!`))
    }

    if (options.pathToSwaggerJSON == null) {
      throw new Error(chalk.bgBlack.red(`You must specify a ${chalk.bold.white('\`pathToSwaggerJSON\`')}, a URL och file path to a Swagger JSON file`))
    }
    
    if (options.outputPath == null) {
      throw new Error(chalk.bgBlack.red(`You must specify an ${chalk.bold.white('\`outputPath\`')}, a file directory in which to output the generated files`))
    }

    const { types } = await parseSwagger(options.pathToSwaggerJSON)

    const interfaces = await createSchema(types)

    /** Output files */

    if (options.includeJSONOutput) {
      // Interfaces
      await saveFile(
        types,
        {
          outputFilePath: path.join(options.outputPath, 'interfaces.json'),
          isJSON: true
        }
      )
    }

    // Interfaces
    await saveFile(
      interfaces.join('\n'),
      {
        outputFilePath: path.join(options.outputPath, 'schema.graphql')
      }
    )
  } catch (thrown) {
    console.error(thrown.name, thrown.message)
  }
}
