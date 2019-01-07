import { Type, Endpoint, EndpointType, Field, ClientTag } from "../interfaces";
export declare const interfaceBuilder: (name: string, fields: Field[], requiredFields?: string[] | undefined) => string;
export declare function createInterfaces(types: Type[]): Promise<string[]>;
export declare function endpointInterfaceBuilder(endpoints: Endpoint[], type?: string): string;
export declare function endpointBuilder(endpoints: Endpoint[], type?: string): string;
export declare function printClientTag(tag: ClientTag, allTypes: Type[]): string;
export declare function createClient(endpointTypes: EndpointType[], types: Type[]): Promise<{
    client: string;
    tags: {
        name: string;
        output: string;
    }[];
}>;
