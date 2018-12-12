import { Type, EndpointType, SwaggerPath } from '../interfaces';
export declare function parseTypes(typeEntries: any[]): Type[];
export declare function parsePaths(paths: SwaggerPath[]): EndpointType[];
export declare function parseSwagger(pathToSwaggerJSON: string): Promise<{
    types: Type[];
    endpoints: EndpointType[];
}>;
