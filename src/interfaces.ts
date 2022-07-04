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

export enum KycResult {
    InProgress = "in_progress",
    Completed = "completed",
    Failed = "failed"
}

export enum RequestType {
    Signup = "Signup",
    Verify = "Verify"
}

//Add more venders
export enum VendorEnum {
    GPIB = "GPIB",
    CoinStash = "CoinStash",
    EasyCrypto = "EasyCrypto"
}

export enum ConfigSettings {
    EXPO_ACCESS_TOKEN = "EXPO_ACCESS_TOKEN",
    AUS_POST_URL = "AUS_POST_URL",
    AUS_POST_CLIENT_ID = "AUS_POST_CLIENT_ID",
    AUS_POST_CLIENT_SECRET = "AUS_POST_CLIENT_SECRET",
    GPIB_VERIFY_ENDPOINT = "GPIB_VERIFY_ENDPOINT",
    GPIB_SIGNUP_ENDPOINT = "GPIB_SIGNUP_ENDPOINT",
    COINSTASH_SIGNUP_ENDPOINT = "COINSTASH_SIGNUP_ENDPOINT",
    COINSTASH_TOKEN = "COINSTASH_TOKEN",
    APP_DEEPLINK_URL = "APP_DEEPLINK_URL"
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

export interface IAusPostService {
    verify(userInfo: UserVerifyRequestBody): Promise<KycResult>;
}

export interface IUserService {
    verify(body: UserVerifyRequestBody): Promise<string>;
    findOne(email: string): Promise<User>;
    findAll(): Promise<UsersResponse[]>;
    create(newUser: NewUser): Promise<User>;
    putToken(
        userId: string,
        token: UserExpoPushTokenRequestBody
    ): Promise<User>;

    pushNotifications(message: string): Promise<void>;
    pushSignupNotification(
        signupRequest: SignupNotificationRequest,
        ip: string
    ): Promise<void>;
}

export interface IThirdPartyService {
    verifyGPIB(body: UserVerifyRequestBody, ip: string): Promise<boolean>;
    signup(signupInfo: UserSignupRequest, ip: string): Promise<string>;
}

export class NewUser {
    @ApiProperty()
    @IsNotEmpty()
    email: string;
}

export class UserVerifyRequestBody {
    @ApiProperty()
    @IsNotEmpty()
    firstName: string;
    @ApiProperty()
    middleName: string;
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
    houseNumber: string;
    @ApiProperty()
    @IsNotEmpty()
    street: string;
    @ApiProperty()
    @IsNotEmpty()
    suburb: string;
    @ApiProperty()
    @IsNotEmpty()
    postcode: string;
    @ApiProperty()
    @IsNotEmpty()
    state: string;
    @ApiProperty()
    @IsNotEmpty()
    country: string;
    @ApiProperty()
    @IsNotEmpty()
    userId: string;
}

export class UserExpoPushTokenRequestBody {
    @ApiProperty()
    @IsNotEmpty()
    token: string;
}

export type AusPostRequest = {
    given_name: string;
    middle_name: string | null;
    family_name: string;
    dob: string;
    address: {
        unit_number: string | null;
        street_number: string;
        street_name: string;
        street_type: string;
        locality: string;
        region: string;
        postal_code: string;
        country: string;
    };
    consent: string;
};

//Can have more than below such as "watchlist" and "found_sources" and "sources_category" but will need live account
export type AusPostResponse = {
    verification_status: "in_progress" | "completed" | "failed";
    verification_session_token: string;
    data_source_events: string[];
    transaction_id: string;
    //sources_category: string;
    //found_sources: {
    //     name:string;
    //     category:string;
    // }[];
    // watchlist:{
    //     "check_performed": boolean,
    //     "check_performed_date": string,
    //     "found": boolean,
    // }
};

export type UsersResponse = {
    userId: string;
    email: string;
    createdAt: Date;
};
export type KycResponse = {
    result: KycResult;
    userId: string;
    thirdPartyVerified: boolean;
};

export type GPIBVerifyRequest = {
    phoneNumber: string;
    email: string;
    userID: string;
    phoneNumberVerified: boolean;
    emailVerified: boolean;
    idVerified: boolean;
};

export class SignupNotificationRequest {
    @ApiProperty()
    @IsNotEmpty()
    source: string;
    @ApiProperty({
        example: "message with deep link"
    })
    @IsNotEmpty()
    message: string;
    @ApiProperty({
        example: "hashed email address"
    })
    @IsNotEmpty()
    email: string; //need to passing hashed email address
}

export class UserSignupRequest {
    @ApiProperty({
        example: ["GPIB", "CoinStash"]
    })
    @IsNotEmpty()
    source: string;
    @ApiProperty()
    @IsNotEmpty()
    firstName: string;
    @ApiProperty()
    @IsNotEmpty()
    lastName: string;
    @ApiProperty()
    @IsNotEmpty()
    password: string;
    @ApiProperty()
    @IsNotEmpty()
    email: string; //need to passing hashed email address
}
