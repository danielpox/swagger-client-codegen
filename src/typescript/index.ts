import path from 'path'
import chalk from 'chalk'

import { saveFile } from '../utils'
import { parseSwagger } from '../swagger'

import { createClient, createInterfaces } from './builder'

import { IGeneratorOptions } from '../interfaces'

/**
 * Generate a TypeScript API client based on a Swagger JSON file
 */
export async function generateTypeScriptClient (options: IGeneratorOptions): Promise<void> {
  try {
    if (options == null) {
      throw new Error(chalk.bgBlack.red(`You must pass the required options to ${ chalk.bold.white(generateTypeScriptClient.name) }!`))
    }

    if (options.pathToSwaggerJSON == null) {
      throw new Error(chalk.bgBlack.red(`You must specify a ${chalk.bold.white('\`pathToSwaggerJSON\`')}, a URL och file path to a Swagger JSON file`))
    }
    
    if (options.outputPath == null) {
      throw new Error(chalk.bgBlack.red(`You must specify an ${chalk.bold.white('\`outputPath\`')}, a file directory in which to output the generated files`))
    }

    const { types, endpoints } = await parseSwagger(options.pathToSwaggerJSON)

    const interfaces = await createInterfaces(types)
    const { client, tags } = await createClient(endpoints, types)

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
  
      // Client
      await saveFile(
        endpoints,
        {
          outputFilePath: path.join(options.outputPath, 'client.json'),
          isJSON: true
        }
      )
    }

    // Interfaces
    await saveFile(
      interfaces.join('\n'), 
      {
        outputFilePath: path.join(options.outputPath, 'interfaces.d.ts')
      }
    )

    // Client
    await saveFile(
      client, 
      {
        outputFilePath: path.join(options.outputPath, 'client.ts')
      }
    )
    
    await saveFile(
      `export * from './client'`, 
      {
        outputFilePath: path.join(options.outputPath, 'index.ts')
      }
    )

    tags.forEach(async tag => {
      await saveFile(
        tag.output,
        {
          outputFilePath: path.join(options.outputPath, `${tag.name}.ts`)
        }
      )
    })
  } catch (thrown) {
    console.error(thrown.name, thrown.message)
  }
}
