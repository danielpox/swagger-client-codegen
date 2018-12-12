import { Field } from '../interfaces';
export declare const fieldTypeBuilder: (field: string, type: string, isArray?: boolean | undefined, items?: string | undefined, uniqueItems?: boolean | undefined, required?: string[] | undefined) => string;
export declare const typeBuilder: (name: string, fields: Field[], required: string[]) => string;
export declare function createSchema(types: any[]): Promise<string[]>;
