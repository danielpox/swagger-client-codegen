export declare const capitalize: (string: string) => string;
export declare const decapitalize: (string: string) => string;
export declare const allOrNothing: (bool: any, char: string) => any;
export declare function saveFile(data: {}, options: {
    outputFilePath: string;
    isJSON?: boolean;
}): Promise<void>;
