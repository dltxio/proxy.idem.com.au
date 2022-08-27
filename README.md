# Idem Proxy Service

Web service for proxying requests to exchange services.

## Architecture

![Diagram](/images/architecture.png)

## Technology

-   [NodeJs](https://nodejs.org/en/) -\
    Recommend installing Node Version Manager (NVM) to allow using multiple versions of Node on your machine. [Instructions for Windows](https://dev.to/skaytech/how-to-install-node-version-manager-nvm-for-windows-10-4nbi)\
    We use Long Term Support (LTS) [versions](https://nodejs.org/en/about/releases/) of Node so that our apps are stable\
    Starting point of a Nodejs project is `./package.json`

-   [Typescript](https://www.typescriptlang.org/) - The programming language of choice, compiles down to JavaScript. Refer to `./tsconfig.json` for the compilation options
-   [Yarn](https://yarnpkg.com/) - We use Yarn (over npm) as the package manager. Windows installation instructions [here](https://classic.yarnpkg.com/lang/en/docs/install/#windows-stable), requires npm installed
-   [NestJS](https://nestjs.com/) - This app uses Nest as a (NodeJS) framework.
-   [Es-lint](https://eslint.org/) and [prettier](https://prettier.io/) - Code linting and formatting standards
-   [Jest](https://jestjs.io/) - Testing framework - TODO remove
-   [Mocha](https://mochajs.org/) and [Chai](https://www.chaijs.com/) - Testing and Assertion frameworks for unit testing
-   [Supertest](https://github.com/visionmedia/supertest) - Integration/End-to-End (e2e) testing framework for HTTP
-   [Swagger](https://swagger.io/) - API documentation
-   [TypeORM](https://typeorm.io/) - TypeORM documentation

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

-   [Service Oriented Architecture (SoA)](https://www.geeksforgeeks.org/service-oriented-architecture/)
-   [Inversion of Control / Dependency Injection](https://martinfowler.com/articles/injection.html)
-   Unit and Integration/E2E testing
-   Swagger documentation via annotations
-   TODO

### Dependency Management

-   Dependencies vs dev-dependencies - if it's not used at run-time then add as a dev-dependency.
-   Major vs minor version upgrades - don't upgrade major versions unless you know what you're doing. There are often breaking changes.

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

An .env file needs to be placed at the root for the app to work. Copy/swap the sibling \_env.example file. Use:

> cp .env.example .env

To run the (NestJS) API:

> docker-compose down && docker-compose up

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

### Test PGP Key

The test PGP key is submmited to MIT, OpenPGP and Ubuntu.

* test@idem.com.au
* Test1234

```text
-----BEGIN PGP PUBLIC KEY BLOCK-----

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
=0ktQ
-----END PGP PUBLIC KEY BLOCK-----
```