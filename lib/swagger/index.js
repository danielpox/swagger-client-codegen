"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
const utils_1 = require("../utils");
function parseTypes(typeEntries) {
    let types = [];
    for (let typeName in typeEntries) {
        const type = typeEntries[typeName];
        const typeObj = {
            name: typeName,
            description: type.description || undefined,
            requiredFields: type.required || undefined,
            fields: []
        };
        for (let fieldName in type.properties) {
            const field = type.properties[fieldName];
            const fieldObj = {
                name: fieldName,
                type: field.type || field.$ref.match(/([A-Z])\w+/g)[0] || undefined,
                format: field.format || undefined,
                enum: field.enum || undefined,
                readOnly: field.readOnly || undefined,
                items: field.items && field.items.$ref && field.items.$ref.match(/([A-Z])\w+/g)[0] || undefined,
                uniqueItems: field.uniqueItems || undefined,
            };
            typeObj.fields.push(fieldObj);
        }
        types.push(typeObj);
    }
    return types;
}
exports.parseTypes = parseTypes;
function parsePaths(paths) {
    let endpointActions = [];
    for (let endpointName in paths) {
        const endpoint = paths[endpointName];
        const endpointObj = {
            path: endpointName,
            type: undefined,
            actions: []
        };
        for (let actionName in endpoint) {
            const action = endpoint[actionName];
            const actionObj = {
                type: actionName,
                description: action.summary,
                name: utils_1.decapitalize(actionName + action.operationId.replace(new RegExp(`Api|${action.tags[0]}|${utils_1.capitalize(actionName)}`, 'g'), '')),
                queryParams: [],
                bodyParams: [],
                pathParams: [],
                responseDataType: undefined,
                responses: []
            };
            for (let parameterKey in action.parameters) {
                const { name, type, in: within, required, description, schema, items } = action.parameters[parameterKey];
                const isArray = type === 'array';
                const param = {
                    name,
                    type: isArray ? { type: items && items.type, array: true } : { type: schema ? (schema.$ref && schema.$ref.match(/([A-Z])\w+/g)[0]) : type },
                    required,
                    description
                };
                actionObj[within === 'query' ? 'queryParams' : within === 'body' ? 'bodyParams' : 'pathParams'].push(param);
            }
            for (let responseCode in action.responses) {
                const { description, schema } = action.responses[responseCode];
                const dataType = schema && (schema.type || schema.$ref && schema.$ref.match(/([A-Z])\w+/g)[0]) || undefined;
                const isArray = dataType === 'array';
                if (responseCode === '200') {
                    actionObj.responseDataType = isArray ? { array: true, dataType: schema && schema.items && (schema.items.type || schema.items.$ref.match(/([A-Z])\w+/g)[0]) } : { dataType };
                }
                actionObj.responses.push({
                    code: responseCode,
                    description,
                    dataType
                });
            }
            endpointObj.type = action.tags[0];
            endpointObj.actions.push(actionObj);
        }
        endpointActions.push(endpointObj);
    }
    const types = [...new Set(endpointActions.map((action) => action.type))];
    return types.map(typeName => ({
        type: typeName,
        endpoints: endpointActions.filter((action) => action.type === typeName)
    }));
}
exports.parsePaths = parsePaths;
function parseSwagger(pathToSwaggerJSON) {
    return __awaiter(this, void 0, void 0, function* () {
        const isRemoteFile = pathToSwaggerJSON.startsWith('http');
        const jsonFile = isRemoteFile
            ? yield axios_1.default.get(pathToSwaggerJSON)
            : yield fs_1.default.readFileSync(pathToSwaggerJSON, { encoding: 'utf8' });
        const { info, paths, definitions, security } = isRemoteFile
            ? jsonFile.data
            : JSON.parse(jsonFile);
        const types = parseTypes(definitions);
        const endpoints = parsePaths(paths);
        return {
            types,
            endpoints
        };
    });
}
exports.parseSwagger = parseSwagger;
//# sourceMappingURL=index.js.map