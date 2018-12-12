"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
exports.capitalize = (string) => string.charAt(0).toUpperCase() + string.slice(1);
exports.decapitalize = (string) => string.charAt(0).toLowerCase() + string.slice(1);
exports.allOrNothing = (bool, char) => bool ? char || bool : '';
function saveFile(data, options) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!fs.existsSync(path.dirname(options.outputFilePath))) {
                fs.mkdirSync(path.dirname(options.outputFilePath), { recursive: true });
            }
            fs.writeFile(options.outputFilePath, options.isJSON
                ? JSON.stringify(data, null, 2)
                : data, (err) => {
                if (err)
                    throw new Error(err);
            });
        }
        catch (thrown) {
            throw new Error(thrown);
        }
    });
}
exports.saveFile = saveFile;
//# sourceMappingURL=utils.js.map