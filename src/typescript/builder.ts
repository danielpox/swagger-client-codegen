import {
  Type,
  Endpoint,
  EndpointType,
  Field,
  Param,
  ClientTag
} from "../interfaces";

import { allOrNothing } from "../utils";
import camelCase from "camelcase";

const isNumber = (type?: string) =>
  type && ["number", "integer"].includes(type) ? "number" : type;

const toCamelCase = (text?: string) => camelCase(text || "");

const fieldInterfaceBuilder = (
  type: string,
  isArray: boolean,
  enumerator?: string[] | number[],
  items?: string,
  requiredFields?: string[]
) => {
  if (enumerator) {
    if (type === "string") {
      return `'${enumerator.join("' | '")}'`;
    }
    return `${enumerator.join(" | ")}`;
  }
  return `${isArray ? items : isNumber(type)}${allOrNothing(isArray, "[]")}`;
};

export const interfaceBuilder = (
  name: string,
  fields: Field[],
  requiredFields?: string[]
) => `export interface ${name} {
  ${fields
    .map(({ name: field, type, format, enum: enumerator, readOnly, items }) => {
      const isArray = type === "array";
      return `${allOrNothing(readOnly, "readonly ")}${toCamelCase(
        field
      )}${allOrNothing(
        !(requiredFields && requiredFields.includes(field)),
        "?"
      )}: ${fieldInterfaceBuilder(
        type,
        isArray,
        enumerator,
        items,
        requiredFields
      )}`;
    })
    .join("\n  ")}
}
`;

export async function createInterfaces(types: Type[]) {
  const typeInterface = [];

  for (let type of types) {
    typeInterface.push(
      interfaceBuilder(type.name, type.fields, type.requiredFields)
    );
  }

  return typeInterface;
}

function retrieveEndpointParams({
  pathParams,
  queryParams,
  bodyParams,
  includeType = true
}: {
  pathParams?: Param[];
  queryParams?: Param[];
  bodyParams?: Param[];
  includeType?: boolean;
}) {
  return [
    pathParams &&
      allOrNothing(
        pathParams.length,
        pathParams
          .map(
            param =>
              `${param.name}${allOrNothing(
                includeType,
                `${allOrNothing(!param.required, "?")}: ${isNumber(
                  param.type!.type
                )}`
              )}`
          )
          .join(", ")
      ),
    queryParams &&
      allOrNothing(
        queryParams.length,
        `queryParams${allOrNothing(
          includeType,
          `: {
    ${allOrNothing(
      queryParams.length,
      queryParams
        .map(
          param =>
            `${param.name}${allOrNothing(!param.required, "?")}: ${isNumber(
              param.type!.type
            )}${allOrNothing(param.type!.array, "[]")}`
        )
        .join(",\n    ")
    )}
  }`
        )}`
      ),
    bodyParams &&
      allOrNothing(
        bodyParams.length,
        `bodyParams${allOrNothing(
          includeType,
          `${allOrNothing(
            !(bodyParams.length && bodyParams[0].required),
            "?"
          )}: ${bodyParams.length && bodyParams[0].type!.type}`
        )}`
      )
  ]
    .filter(str => str.length)
    .join(", ");
}

function printInterfaceDocumentation(
  description: string | undefined,
  actionType: string,
  endpointPath: string
) {
  return `/**
  * ${[
    description ? description + "\n  * " : undefined,
    `${actionType.toUpperCase()} ${endpointPath}`
  ]
    .filter(line => !!line)
    .join("\n  * ")}
  */`;
}

export function endpointInterfaceBuilder(endpoints: Endpoint[], type?: string) {
  return `
export interface I${toCamelCase(type)}Endpoints {${endpoints
    .map(endpoint =>
      endpoint.actions
        .map(action => {
          const responseDataType = action.responseDataType
            ? allOrNothing(
                action.responseDataType.dataType,
                `Promise<${
                  action.responseDataType.array
                    ? `${action.responseDataType.dataType}[]`
                    : action.responseDataType.dataType
                } | void>`
              )
            : "void";

          return `
  ${printInterfaceDocumentation(action.description, action.type, endpoint.path)}
  ${action.name} (${retrieveEndpointParams({
            pathParams: action.pathParams,
            queryParams: action.queryParams,
            bodyParams: action.bodyParams
          })}): ${responseDataType}`;
        })
        .join("\n  ")
    )
    .join("\n  ")}
}
`.trim();
}

export function endpointBuilder(endpoints: Endpoint[], type?: string) {
  return `
export const ${toCamelCase(type)}Endpoints: I${toCamelCase(type)}Endpoints = {
  ${endpoints
    .map(endpoint =>
      endpoint.actions
        .map(action => {
          const responseDataType =
            action.responseDataType &&
            allOrNothing(
              action.responseDataType.dataType,
              `<${
                action.responseDataType.array
                  ? `${action.responseDataType.dataType}[]`
                  : action.responseDataType.dataType
              }>`
            );

          return `
  ${action.name}: async function (${retrieveEndpointParams({
            pathParams: action.pathParams,
            queryParams: action.queryParams,
            bodyParams: action.bodyParams,
            includeType: false
          })}) {
    try {
      const response = await API.http.${action.type}${allOrNothing(
            responseDataType,
            responseDataType
          )}(\`${endpoint.path.replace(
            /({\w+})/g,
            (_, param) => `$${param}`
          )}\`${allOrNothing(
            action.queryParams.length,
            ", queryParams"
          )}${allOrNothing(action.bodyParams.length, ", bodyParams")})

      if (response.ok) {
        return ${responseDataType ? "response.data" : "response.ok"}
      } else {
        throw new Error(response.originalError.message)
      }
    } catch (thrown) {
      console.error(thrown)
    }
  }
  `.trim();
        })
        .join(",\n\n  ")
    )
    .join(",\n\n  ")}
}
`.trim();
}

function filterAllUsedTypes(endpoints: Endpoint[]) {
  let usedDataTypes: string[] = [];

  endpoints.forEach(endpoint => {
    endpoint.actions.forEach(action => {
      if (action.responseDataType && action.responseDataType.dataType)
        usedDataTypes.push(action.responseDataType.dataType);

      action.queryParams.forEach(param => {
        if (param.type) usedDataTypes.push(param.type.type!);
      });

      action.pathParams.forEach(param => {
        if (param.type) usedDataTypes.push(param.type.type!);
      });

      action.bodyParams.forEach(param => {
        if (param.type) usedDataTypes.push(param.type.type!);
      });
    });
  });

  return usedDataTypes;
}

function printUsedTypes(allTypes: Type[], usedDataTypes: string[]) {
  return allTypes
    .map(type => type.name)
    .filter(typeName => usedDataTypes.includes(typeName));
}

export function printClientTag(tag: ClientTag, allTypes: Type[]) {
  return `
import { API } from './'

import {
  ${printUsedTypes(allTypes, tag.types).join(",\n  ")}
} from './interfaces.d'

/* INTERFACES */

${tag.interfaces}

/* IMPLEMENTATION */

${tag.endpoints}
`.trim();
}

function printAPI(tags: ClientTag[]) {
  const tagNames = tags.map(({ name }) => camelCase(name));
  return `
import { create, ApisauceInstance, ApisauceConfig } from 'apisauce'

${tagNames
    .map(
      name => `import { I${name}Endpoints, ${name}Endpoints } from './${name}'`
    )
    .join("\n")}

interface SwaggerAPIConfig extends ApisauceConfig {
  baseURL: string
}

interface ISwaggerAPI {
  http: ApisauceInstance
  addAuthTokenToHeaders (authToken: string): void
  removeAuthTokenFromHeaders (): void
  ${tagNames.map(name => `${name}: I${name}Endpoints`).join("\n  ")}
}

class SwaggerAPI implements ISwaggerAPI {
  public http: ApisauceInstance

  constructor (config: SwaggerAPIConfig) {
    if (!config.baseURL) throw new Error('You must provide a baseURL to the API client')

    this.http = create(config)
  }

  public addAuthTokenToHeaders (authToken: string) {
    this.http.setHeader('Authorization', \`Bearer \${ authToken }\`)
  }

  public removeAuthTokenFromHeaders () {
    this.http.setHeader('Authorization', '')
  }

  ${tagNames.map(name => `public ${name} = ${name}Endpoints`).join("\n\n  ")}
}

export default SwaggerAPI
`.trim();
}

export async function createClient(
  endpointTypes: EndpointType[],
  types: Type[]
) {
  let clientTags: ClientTag[] = [];

  for (let endpointType of endpointTypes) {
    clientTags.push({
      name: camelCase(endpointType.type!),
      interfaces: endpointInterfaceBuilder(
        endpointType.endpoints,
        endpointType.type
      ),
      endpoints: endpointBuilder(endpointType.endpoints, endpointType.type),
      types: [...new Set(filterAllUsedTypes(endpointType.endpoints))]
    });
  }

  const client = printAPI(clientTags);
  const tags = clientTags.map(tag => ({
    name: tag.name,
    output: printClientTag(tag, types)
  }));

  return {
    client,
    tags
  };
}
