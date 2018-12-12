export interface IGeneratorOptions {
    pathToSwaggerJSON: string;
    outputPath: string;
    includeJSONOutput?: boolean;
}
export interface SwaggerPathParameter {
    name: string;
    in: 'body' | 'path' | 'query';
    description?: string;
    required: boolean;
    type?: string;
    format?: string;
    minLength?: number;
    maxLength?: number;
    schema?: {
        $ref?: string;
    };
    items?: {
        type: string;
    };
}
export interface SwaggerPathResponse {
    description: string;
    schema?: {
        uniqueItems?: boolean;
        type?: string;
        $ref?: string;
        items?: {
            $ref?: string;
            type?: string;
        };
    };
}
export interface SwaggerPath {
    [verb: string]: {
        tags: string[];
        summary?: string;
        operationId: string;
        consumes: string[];
        produces: string[];
        parameters: SwaggerPathParameter[];
        responses: {
            [code: string]: SwaggerPathResponse;
        };
    };
}
export interface SwaggerDefinitionProperty {
    description?: string;
    type: string;
    format?: string;
    uniqueItems?: boolean;
    items?: {
        type?: string;
        $ref?: string;
    };
    readOnly?: boolean;
    $ref?: string;
}
export interface SwaggerDefinition {
    [name: string]: {
        description: string;
        required?: string[];
        type: string;
        properties: {
            [propertyName: string]: SwaggerDefinitionProperty;
        };
    };
}
export interface Field {
    name: string;
    type: string;
    format?: string;
    enum?: number[];
    readOnly?: boolean;
    items?: string;
    uniqueItems?: boolean;
}
export interface Type {
    name: string;
    description?: string;
    requiredFields?: string[];
    fields: Field[];
}
export interface Param {
    name: string;
    type?: {
        type?: string;
        array?: boolean;
    };
    required: boolean;
    description?: string;
}
export interface EndpointResponse {
    code: string;
    description?: string;
    dataType?: string;
}
export interface EndpointResponseDataType {
    dataType?: string;
    array?: boolean;
}
export interface EndpointAction {
    type: string;
    description?: string;
    name: string;
    queryParams: Param[];
    bodyParams: Param[];
    pathParams: Param[];
    responseDataType?: EndpointResponseDataType;
    responses: EndpointResponse[];
}
export interface Endpoint {
    path: string;
    type?: string;
    actions: EndpointAction[];
}
export interface EndpointType {
    type?: string;
    endpoints: Endpoint[];
}
export interface ClientTag {
    name: string;
    interfaces: string;
    endpoints: string;
    types: string[];
}
