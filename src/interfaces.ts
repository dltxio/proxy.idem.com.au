import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "./data/entities/user.entity";

export interface IExampleService {
    getById(id: string): string;
    getAll(): string[];
}

// String values used in user-facing error messages
export enum EntityNames {
    Account = "Account"
}

export enum ConfigSettings {
    EXPO_ACCESS_TOKEN = "EXPO_ACCESS_TOKEN"
}

//=== Abstract Error classes
export abstract class EntityMissingIdError extends Error {
    constructor(entity: string) {
        super(`${entity} ID is missing`);
    }
}

export abstract class EntityCannotGetError extends Error {
    constructor(entity: string, id: string, msg: string) {
        super(`Cannot get ${entity} ${id}: ${msg}`);
    }
}

export class EntityNotFoundError extends EntityCannotGetError {
    constructor(entity: string, entityId: string) {
        super(entity, entityId, `No ${entity} with ID "${entityId}"`);
    }
}

export class EntityCannotUpdateError extends Error {
    constructor(entity: string, entityId: string, msg: string) {
        super(`Cannot update ${entity} ${entityId}: ${msg}`);
    }
}

export class EntityCannotCreateError extends Error {
    constructor(entity: string, msg: string) {
        super(`Cannot create ${entity}: ${msg}`);
    }
}

//=== Account errors
export class AccountCannotGetError extends EntityCannotGetError {
    constructor(id: string, msg: string) {
        super(EntityNames.Account, id, msg);
    }
}

export class AccountNotFoundError extends EntityNotFoundError {
    constructor(accountId: string) {
        super(EntityNames.Account, accountId);
    }
}

export class AccountMissingIdError extends EntityMissingIdError {
    constructor() {
        super(EntityNames.Account);
    }
}

export interface IUserService {
    verify(body: UserVerifyRequestBody): Promise<string>;
    findAll(): Promise<User[]>;
    create(newUser: UserVerifyRequestBody): Promise<User>;
    putToken(
        userId: string,
        token: UserExpoPushTokenRequestBody
    ): Promise<User>;

    pushNotification(message: string): Promise<void>;
}

export class UserVerifyRequestBody {
    @ApiProperty()
    @IsNotEmpty()
    firstName: string;
    @ApiProperty()
    @IsNotEmpty()
    lastName: string;
    @ApiProperty()
    @IsNotEmpty()
    dob: string;
    @ApiProperty()
    @IsNotEmpty()
    email: string;
    @ApiProperty()
    @IsNotEmpty()
    address: string;
}

export class UserExpoPushTokenRequestBody {
    @ApiProperty()
    @IsNotEmpty()
    token: string;
}
