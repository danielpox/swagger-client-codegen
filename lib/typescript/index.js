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
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const utils_1 = require("../utils");
const swagger_1 = require("../swagger");
const builder_1 = require("./builder");
function generateTypeScriptClient(options) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (options == null) {
                throw new Error(chalk_1.default.bgBlack.red(`You must pass the required options to ${chalk_1.default.bold.white(generateTypeScriptClient.name)}!`));
            }
            if (options.pathToSwaggerJSON == null) {
                throw new Error(chalk_1.default.bgBlack.red(`You must specify a ${chalk_1.default.bold.white('\`pathToSwaggerJSON\`')}, a URL och file path to a Swagger JSON file`));
            }
            if (options.outputPath == null) {
                throw new Error(chalk_1.default.bgBlack.red(`You must specify an ${chalk_1.default.bold.white('\`outputPath\`')}, a file directory in which to output the generated files`));
            }
            const { types, endpoints } = yield swagger_1.parseSwagger(options.pathToSwaggerJSON);
            const interfaces = yield builder_1.createInterfaces(types);
            const { client, tags } = yield builder_1.createClient(endpoints, types);
            if (options.includeJSONOutput) {
                yield utils_1.saveFile(types, {
                    outputFilePath: path_1.default.join(options.outputPath, 'interfaces.json'),
                    isJSON: true
                });
                yield utils_1.saveFile(endpoints, {
                    outputFilePath: path_1.default.join(options.outputPath, 'client.json'),
                    isJSON: true
                });
            }
            yield utils_1.saveFile(interfaces.join('\n'), {
                outputFilePath: path_1.default.join(options.outputPath, 'interfaces.d.ts')
            });
            yield utils_1.saveFile(client, {
                outputFilePath: path_1.default.join(options.outputPath, 'client.ts')
            });
            yield utils_1.saveFile(`export * from './client'`, {
                outputFilePath: path_1.default.join(options.outputPath, 'index.ts')
            });
            tags.forEach((tag) => __awaiter(this, void 0, void 0, function* () {
                yield utils_1.saveFile(tag.output, {
                    outputFilePath: path_1.default.join(options.outputPath, `${tag.name}.ts`)
                });
            }));
        }
        catch (thrown) {
            console.error(thrown.name, thrown.message);
        }
    });
}
exports.generateTypeScriptClient = generateTypeScriptClient;
//# sourceMappingURL=index.js.map