"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.fieldTypeBuilder = (field, type, isArray, items, uniqueItems, required) => `${utils_1.allOrNothing(isArray, '[')}${isArray ? items : utils_1.capitalize(type)}${utils_1.allOrNothing(uniqueItems, '!')}${utils_1.allOrNothing(isArray, ']')}${utils_1.allOrNothing(required && required.includes(field), '!')}`;
exports.typeBuilder = (name, fields, required) => `type ${name} {
  ${fields.map(({ name: field, type, format, readOnly, items, uniqueItems }) => {
    const isArray = type === 'array';
    return `${field}: ${exports.fieldTypeBuilder(field, type, isArray, items, uniqueItems, required)}`;
}).join('\n  ')}
}
`;
function createSchema(types) {
    return __awaiter(this, void 0, void 0, function* () {
        const typeSchema = [];
        for (let type of types) {
            typeSchema.push(exports.typeBuilder(type.name, type.fields, type.requiredFields));
        }
        return typeSchema;
    });
}
exports.createSchema = createSchema;
//# sourceMappingURL=builder.js.map