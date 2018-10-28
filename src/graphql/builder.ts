import { Field } from '../interfaces'

import { capitalize, allOrNothing } from '../utils'

export const fieldTypeBuilder = (field: string, type: string, isArray?: boolean, items?: string, uniqueItems?: boolean, required?: string[]) =>
  `${allOrNothing(isArray, '[')}${isArray ? items : capitalize(type)}${allOrNothing(uniqueItems, '!')}${allOrNothing(isArray, ']')}${allOrNothing(required && required.includes(field), '!')}`

export const typeBuilder = (name: string, fields: Field[], required: string[]) => `type ${name} {
  ${fields.map(({ name: field, type, format, readOnly, items, uniqueItems }) => {
    const isArray = type === 'array'
    
    return `${field}: ${fieldTypeBuilder(field, type, isArray, items, uniqueItems, required)}`
  }).join('\n  ')}
}
`

export async function createSchema (types: any[]) {
  const typeSchema = []

  for (let type of types) {
    typeSchema.push(typeBuilder(type.name, type.fields, type.requiredFields))
  }

  return typeSchema
}
