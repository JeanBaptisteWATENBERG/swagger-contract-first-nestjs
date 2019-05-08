<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>
  
# NestJS - Swagger contract first approach sample

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository with NestSwaggerContractFirst middleware.

NestSwaggerContractFirst middleware provides a way to bind your NestJS controllers to your swagger repository. It replaces NestJS 
router by reading the Swagger specification and routing requests to corresponding methods.

The binding is provided by [swagger-tools](https://github.com/apigee-127/swagger-tools) and rely on `x-swagger-router-controller` 
swagger extensions to link with NestJS controllers.

## Motivation

This project is motivated by the idea to use contract first approach to develop API with NestJS.

As opposed to [code first approach](https://docs.nestjs.com/recipes/swagger), the goal is to let teams design their API firstly using 
swagger and then implement it iteratively thanks to stubbing. 

This approach ease team communication and in most cases it brings a better API design. 
It also eases `controllers` maintenance by removing all boilerplate decorators needed to generate the documentation in code first approach. 

You can find other great reasons to adopt contract/design first approach in this [article](https://swagger.io/blog/api-design/design-first-or-code-first-api-development/).

## How does it works ?

```typescript
// 1. Load your swagger specification
const swagger = yaml.safeLoad(fs.readFileSync(path.join(__dirname, './swagger/swagger.yaml'), 'utf8'));

const options = {
  swagger,// 2. Provide it in options
  controllers: '**/*.controller.ts',// 3. Indicate where to find your controller classes
  useStubs: true,// You can optionnaly ask the library to stub missing controllers (usefull if some routes defined in your swagger specification are not yet implemented)
  useSwaggerValidator: true,// You can optionnaly validates request parameters against specification to handle bad request with ease
  validateResponse: true// You can even validate responses 
}

const app = await NestFactory.create(AppModule);//Bootstrap NestJS application
await registerSwaggerContractFirstMiddleware(app, options);//Register NestSwaggerContractFirst middlewares
await app.listen(3000);//Start the API
```

`registerSwaggerContractFirstMiddleware` will first reads `options.controllers` option to fetch all your controllers.
For each of those controllers it will find among exported members the first one that ends up with `Controller` and will assume this your controller class object.

Once done it will compute available methods on this object and build a map indexed by controller name and method name linking to `app` controller instance method (it uses `app.get(controllerName)` to fetch `app` controller instance).

Then this map is given to [swagger-tools router middleware](https://github.com/apigee-127/swagger-tools) that route the requests on demand.

It finally uses NestJS RouterResponseController to keep underlying http framework abstraction as much as possible.

## Installation


```bash
$ yarn
```

or 

```bash
$ npm install
```

## Running the app

```bash
# development
$ yarn start
# OR
$ npm run start

# watch mode
$ yarn start:dev
# OR
$ npm run start:dev

# production mode
$ yarn start:prod
# OR
$ npm run start:prod
```

## Test

```bash
# unit tests
$ yarn test
# OR
$ npm run test

# e2e tests
$ yarn test:e2e
# OR
$ npm run test:e2e

# test coverage
$ yarn test:cov
# OR
$ npm run test:cov
```

## Stay in touch

- Author - [Jean-Baptiste WATENBERG](https://twitter.com/JBWatenberg)

## License

  This project is [MIT licensed](LICENSE).
