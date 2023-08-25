# Idem Proxy Service

Web service for proxying requests to exchange services.

## Docs

[Architecture](./docs/ARCHITECTURE.md)

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
node_nodules/ - downloaded 3rd part deps
src/
    accounts/ - example of an entity that has controller, module, service and references a DTO
    services/ - external connectors e.g. DTOs and APIs
    utils/ - common reusable components e.g. Nest validators and interceptors
    app.module.ts - entry point to the Nest app that defines the dependency injections
    interfaces.ts - global file of TS interfaces
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

### Dependency Management

-   Dependencies vs dev-dependencies - if it's not used at run-time then add as a dev-dependency.
-   Major vs minor version upgrades - don't upgrade major versions unless you know what you're doing. There are often breaking changes.

## Commands

More details in the scripts section of `./package.json`

### Installation

Download and install all dependencies into the `./node_modules` folder

> yarn

Build the project and output into the `./dist` folder

> yarn build

### Linting and formatting

Make sure all line and tab formatting is correct

> yarn format

Review some basic coding styles based on the rules set

> yarn lint

### Running the app

An .env file needs to be placed at the root for the app to work. Copy/swap the sibling _.env.development_ file. Use:

> cp .env.development .env

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

The test PGP key is submitted to MIT, OpenPGP and Ubuntu.  Live will be from support@idem.com.au.

* test@idem.com.au
* Test1234

```text
-----BEGIN PGP PUBLIC KEY BLOCK-----

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
PzH2+OC2
=MWk4
-----END PGP PUBLIC KEY BLOCK-----

```

### Xero

1. Go to [this link](https://login.xero.com/identity/connect/authorize?response_type=code&client_id=873C683D0CA5428F8DB12E1D0CC24185&redirect_uri=http://localhost/&scope=openid profile email accounting.transactions accounting.contacts offline_access&state=DLTXisTheBest)

2. Get the code from the redirect URL (After “code=”)

3. Within 5 minutes of receiving code, go to the endpoint `Request Xero Token` endpoint found in the DLTX https://hoppscotch.io/ collection, adding the code you got in the previous step into the "code" value in the body (otherwise it will expire). Click send. The response will be the Xero token set. The generated token set is valid for 30 minutes.
    - Example token set:

    ```
    {
        "id_token": "<TOKEN>",
        "access_token": "<TOKEN>",
        "expires_in": 1800,
        "token_type": "Bearer",
        "refresh_token": "<TOKEN>",
        "scope": "openid profile email accounting.transactions accounting.contacts offline_access"
    }
    ```

4. Then find the `Send Invoices` endpoint in the DLTx https://hoppscotch.io/ collection and add the Xero token set along with the Xero client ID.

NOTE: The access_token will be valid for 30 mins.

### Demo Company Reset Instructions

Every 28 days the Demo Company resets, so when this happens run the following to get back up and running.

1. Get a new tenant id for the demo company by making a GET request to https://api.xero.com/connections
2. Update the `.env` file with the new tenant id
4. Push the changes to github, and wait for deployment
5. Verify Idem is working as normal