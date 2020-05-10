import fs from 'fs'
import axios, { AxiosResponse } from 'axios'

import { capitalize, decapitalize } from '../utils'

import { Type, EndpointType, SwaggerDefinition, SwaggerPath, Field, Endpoint, EndpointAction, Param } from '../interfaces'

export function parseTypes (typeEntries: any[]) {
  let types = []

  for (let typeName in typeEntries) {
    const type = typeEntries[typeName]

    const typeObj: Type = {
      name: typeName,
      description: type.description || undefined,
      requiredFields: type.required || undefined,
      fields: []
    }

    for (let fieldName in type.properties) {
      const field = type.properties[fieldName]

      const fieldObj: Field = {
        name: fieldName,
        type: field.type || (field.$ref && field.$ref.match(/([A-Z])\w+/g)[0]) || undefined,
        format: field.format || undefined,
        enum: field.enum || undefined,
        readOnly: field.readOnly || undefined,
        items: field.items && (field.items.$ref && field.items.$ref.match(/([A-Z])\w+/g)[0]) || undefined,
        uniqueItems: field.uniqueItems || undefined,
      }

      typeObj.fields.push(fieldObj)
    }

    types.push(typeObj)
  }
  
  return types
}

export function parsePaths (paths: SwaggerPath[]): EndpointType[] {
  let endpointActions: any = []

  for (let endpointName in paths) {
    const endpoint: SwaggerPath = paths[endpointName]

    const endpointObj: Endpoint = {
      path: endpointName,
      type: undefined,
      actions: []
    }

    const parameters: any = []

    for (let actionName in endpoint) {
      const action = endpoint[actionName]

      if (actionName === 'parameters') {
        parameters.push(...action as any)

        continue;
      }

      const actionObj: EndpointAction = {
        type: actionName,
        description: action.summary,
        name: decapitalize(actionName + action.operationId.replace(new RegExp(`Api|${ action.tags[0] }|${ capitalize(actionName) }`, 'g'), '')), // Transform ex. 'ApiProductsByNameGet' to 'getByName'
        queryParams: [],
        bodyParams: [],
        pathParams: [],
        responseDataType: undefined,
        responses: []
      }

      for (let parameterKey in action.parameters) {
        const { name, type, in: within, required, description, schema, items } = action.parameters[parameterKey]
        const isArray = type === 'array'

        const param: Param = {
          name,
          type: isArray ? { type: items && items.type, array: true } : { type: schema ? (schema.$ref && schema.$ref.match(/([A-Z])\w+/g)![0]) : type },
          required,
          description
        }

        actionObj[within === 'query' ? 'queryParams' : within === 'body' ? 'bodyParams' : 'pathParams'].push(param)
      }

      for (let responseCode in action.responses) {
        const { description, schema } = action.responses[responseCode]

        const dataType = schema && (schema.type || (schema.$ref && schema.$ref.match(/([A-Z])\w+/g)![0])) || undefined
        const isArray = dataType === 'array'

        if (responseCode === '200') {
          actionObj.responseDataType = dataType
            ? (isArray
              ? {
                  array: true,
                  dataType: schema && schema.items && (schema.items.type || (schema.items.$ref && schema.items.$ref!.match(/([A-Z])\w+/g)![0])) || undefined
                }
              : { dataType })
            : undefined
        }

        actionObj.responses.push({
          code: responseCode,
          description,
          dataType
        })
      }

      endpointObj.type = action.tags[0]

      endpointObj.actions.push(actionObj)
    }

    for (let parameterKey in parameters) {
      const { name, type, in: within, required, description, schema, items } = parameters[parameterKey]
      const isArray = type === 'array'

      const param: Param = {
        name,
        type: isArray ? { type: items && items.type, array: true } : { type: schema ? (schema.$ref && schema.$ref.match(/([A-Z])\w+/g)![0]) : type },
        required,
        description
      }

      for (let endpointKey in endpointObj.actions) {
        if (!endpointObj.actions[endpointKey][within === 'query' ? 'queryParams' : within === 'body' ? 'bodyParams' : 'pathParams'].find(p => p.name === name))
          endpointObj.actions[endpointKey][within === 'query' ? 'queryParams' : within === 'body' ? 'bodyParams' : 'pathParams'].push(param)
      }
    }
    
    if (endpointObj.actions.length === 0) continue;

    endpointObj.actions = [...new Set(endpointObj.actions)]

    endpointActions.push(endpointObj)
  }

  const types = <string[]>[...new Set(endpointActions.map((action: EndpointAction) => action.type))]

  return types.map(typeName => ({
    type: typeName,
    endpoints: endpointActions.filter((action: EndpointAction) => action.type === typeName)
  }))
}

/**
 * Parses a given Swagger JSON file and returns the types and endpoints
 * @param pathToSwaggerJSON URL or file path to a Swagger JSON file
 */
export async function parseSwagger (pathToSwaggerJSON: string): Promise<{ types: Type[], endpoints: EndpointType[] }> {
  const isRemoteFile = pathToSwaggerJSON.startsWith('http')

  const jsonFile = isRemoteFile
    ? await axios.get(pathToSwaggerJSON)
    : await fs.readFileSync(pathToSwaggerJSON, { encoding: 'utf8' })

  const { info, paths, definitions, security }: { info: any, paths: SwaggerPath[], definitions: SwaggerDefinition[], security: any } =
    isRemoteFile
      ? (jsonFile as AxiosResponse).data
      : JSON.parse(jsonFile as string)

  const types = parseTypes(definitions)
  const endpoints = parsePaths(paths)

  return {
    types,
    endpoints
  }
}
