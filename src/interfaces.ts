import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { IdResponse } from "./utils";

export enum EcAssetType {
    BASE_ASSET = "BASE_ASSET",
    ETH_CONTRACT = "ETH_CONTRACT",
    FIAT = "FIAT"
}

export class EcVaultAccountName {
    @ApiProperty()
    @IsNotEmpty()
    name: string;
}

export class EcVaultAccount {
    id: string;
    @ApiProperty()
    @IsNotEmpty()
    name: string;
}

export type EcAsset = {
    contractAddress: string;
    decimals?: number;
    id: string;
    nativeAsset: string;
    name: string;
    type: EcAssetType;
};

export type EcAssetWallet = {
    assetId: string;
    accountId: string;
    address: string;
};

export interface IAccountsService {
    getAll: () => Promise<EcVaultAccount[]>;
    getById(id: string): () => Promise<EcVaultAccount>;
    getDepositAddress(vaultAccountId: string, assetId: string): Promise<string>;
    create(EcVaultAccount): Promise<EcVaultAccount>;
    createAssetWallet(accountId, assetId): Promise<IdResponse>;
}

export interface IExampleService {
    getById(id: string): string;
    getAll(): string[];
}

export interface IEventStoreEvent {
    data: unknown;
    type: string;
    revision: bigint;
    streamName: string;
    created: number;
}

export interface IEvent {
    data: Record<string, unknown>;
    metadata: Record<string, unknown>;
    type: string;
}

// String values used in user-facing error messages
export enum EntityNames {
    Account = "Account"
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
