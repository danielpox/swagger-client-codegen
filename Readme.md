# swagger-client-codegen

Generate a TypeScript API client or GraphQL schema based on a Swagger JSON file

## Installation

```console
$ npm install swagger-client-codegen --save-dev
```

```console
$ yarn add swagger-client-codegen --dev
```

## Usage

### CLI (Primary)

```console
$ npx swagger-client-codegen --typescript --pathToSwaggerJSON 'https://some.url/path.json' --outputPath 'some/file/path'
```

```console
$ yarn swagger-client-codegen --graphql --pathToSwaggerJSON '../some/file/path.json' --outputPath './some/file/path/' --includeJSONOutput
```

You can also use `swagger-client-codegen` directly from your code, if that suits you, as mentioned in the following *JavaScript* and *TypeScript* sections.

### JavaScript

```javascript
const { generateTypeScriptClient, generateGraphQLClient } = require('swagger-client-codegen')

generateTypeScriptClient({
  pathToSwaggerJSON: 'https://some.url/path.json',
  outputPath: 'some/file/path'
})

generateGraphQLClient({
  pathToSwaggerJSON: '../some/file/path.json',
  outputPath: './some/file/path/',
  includeJSONOutput: true
})
```

### TypeScript

```typescript
import { generateTypeScriptClient, generateGraphQLClient } from 'swagger-client-codegen'

generateTypeScriptClient({
  pathToSwaggerJSON: 'https://some.url/path.json',
  outputPath: 'some/file/path'
})

generateGraphQLClient({
  pathToSwaggerJSON: '../some/file/path.json',
  outputPath: './some/file/path/',
  includeJSONOutput: true
})
```

## Development

### Build

```console
$ npm run build # 1. Builds TypeScript to JavaScript
```

### Run

```console
$ npm run start # 2. Runs actual codegen
```
