#!/usr/bin/env node

'use strict'

const args = require('yargs').argv
const chalk = require('chalk')

try {
  if (args.typescript == null && args.graphql == null) {
    throw new Error(chalk.bgBlack.red(`You must select a target: ${ chalk.bold.white('\`--typescript\`') } or ${ chalk.bold.white('\`--graphql\`') }`))
  }
  
  if (args.pathToSwaggerJSON == null) {
    throw new Error(chalk.bgBlack.red(`You must specify a ${ chalk.bold.white('\`--pathToSwaggerJSON\`') }, a URL och file path to a Swagger JSON file`))
  }
  
  if (args.outputPath == null) {
    throw new Error(chalk.bgBlack.red(`You must specify an ${ chalk.bold.white('\`--outputPath\`') }, a file directory in which to output the generated files`))
  }
  
  const { generateTypeScriptClient, generateGraphQLClient } = require('../lib/swagger-client-codegen')
  
  if (args.typescript) {
    generateTypeScriptClient({
      pathToSwaggerJSON: args.pathToSwaggerJSON,
      outputPath: args.outputPath,
      includeJSONOutput: args.includeJSONOutput
    })
  } else if (args.graphql) {
    generateGraphQLClient({
      pathToSwaggerJSON: args.pathToSwaggerJSON,
      outputPath: args.outputPath,
      includeJSONOutput: args.includeJSONOutput
    })
  }
} catch (thrown) {
  console.error(thrown.name, thrown.message)
}
