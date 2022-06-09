# NestJS ![build](https://github.com/dltxio/nextjs-template/actions/workflows/build-project.yml/badge.svg)
Template for Back End repos using NodeJS and Typescript

## Technology
- [NodeJs](https://nodejs.org/en/) -\
Recommend installing Node Version Manager (NVM) to allow using multiple versions of Node on your machine. [Instructions for Windows](https://dev.to/skaytech/how-to-install-node-version-manager-nvm-for-windows-10-4nbi)\
We use Long Term Support (LTS) [versions](https://nodejs.org/en/about/releases/) of Node so that our apps are stable\
Starting point of a Nodejs project is `./package.json`

- [Typescript](https://www.typescriptlang.org/) - The programming language of choice, compiles down to JavaScript. Refer to `./tsconfig.json` for the compilation options
- [Yarn](https://yarnpkg.com/) - We use Yarn (over npm) as the package manager. Windows installation instructions [here](https://classic.yarnpkg.com/lang/en/docs/install/#windows-stable), requires npm installed
- [NestJS](https://nestjs.com/) - This app uses Nest as a (NodeJS) framework.
- [Es-lint](https://eslint.org/) and [prettier](https://prettier.io/) - Code linting and formatting standards
- [Jest](https://jestjs.io/) - Testing framework - TODO remove
- [Mocha](https://mochajs.org/) and [Chai](https://www.chaijs.com/) - Testing and Assertion frameworks for unit testing
- [Supertest](https://github.com/visionmedia/supertest) - Integration/End-to-End (e2e) testing framework for HTTP
- [Swagger](https://swagger.io/) - API documentation

## Structure
Quick overview of the folder structure:
```
github/ - github CI actions
dist/ - the build folder
node_nodules/ - downloadrd 3rd part deps
src/
    accounts/ - example of an entity that has controller, module, service and references a DTO
    services/ - external connectors e.g. DTOs and APIs
    utils/ - common reusable components e.g. Nest validators and interceptors
    app.module.ts - entry point to the Nest app that defines the dependency injections
    interfacts.ts - global file of TS interfaces
    main.ts - nest setup including swagger config
    mocks.ts - mocked external classes used in tests
test/ - contains end to end tests
```

### Modules controllers and services
This is a 3 tier API project\
Controllers are the API endpoints for HTTP requests. They manage input validation and output encoding, agnostic to the business logic. All business logic is handed off to the associated service\
Modules perform the dependency injection of all dependencies required

### DTOs and DAOS - TODO
A specialised type of service that directly interfaces with an external data object e.g. a database or API\
These services are typically mocked when performing unit tests

### Sample Endpoints
This project contains a single entity `accounts` for demo purposes.\
All related files are stored under the `src/accounts` folder. Simply create copies of this folder for other entities you wish to create

// Get all (vault) accounts
> GET accounts

// Get a (vault) account
> GET accounts/:accountId

### Sample external service
This project contains a single external service `EventStore` for demo purposes and is found under `services/EventStore.service.ts`

## Standards
- [Service Oriented Architecture (SoA)](https://www.geeksforgeeks.org/service-oriented-architecture/)
- [Inversion of Control / Dependency Injection](https://martinfowler.com/articles/injection.html)
- Unit and Integration/E2E testing
- Swagger documentation via annotations
- TODO

### Dependency Management
- Dependencies vs dev-dependencies - if it's not used at run-time then add as a dev-dependency
- Major vs minor version upgrades - don't upgrade major versions unless you know what you're doing. There are often breaking changes

## Commands
More details in the scripts section of `./package.json`

### Installation
Download and install all dependencies intothe `./node_modules` folder
> yarn

Build the project and output into the `./dist` folder
> yarn build  

### Linting and formatting
Make sure all line and tab formatting is correct
> yarn format

Review some basic coding styles based on the rules set
> yarn lint

### Running the app
An .env file needs to be placed at the root for the app to work. Copy/swap the sibling _env.development_ file. Use:
> cp .env.development .env

To run the (NestJS) API:
> yarn start:dev

Then browse to `localhost:3000/swagger`

## Testing the app
To run the **unit** tests:
> yarn test

To run the **end-to-end** tests:
> yarn test:e2e

## Deployment
Options available on the [dev-ops repo](https://github.com/dltxio/dev-ops)

### UAT
Replace the values for each key in .env with the token name plus "\_TOKEN". Then make sure there is a Github secret for each of those keys. For example:
> ENV_VAR_1_KEY: ENV_VAR_1_KEY_TOKEN
