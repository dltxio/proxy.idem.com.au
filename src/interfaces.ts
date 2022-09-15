import {
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsString,
    ValidateNested
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "./data/entities/user.entity";
import { Tester } from "./data/entities/tester.entity";
import { ClaimResponsePayload } from "./types/verification";
import { Type } from "class-transformer";

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
    GPIB = 1,
    CoinStash = 2,
    DigitalSurge = 5,
    EasyCrypto = 6
}

export enum ConfigSettings {
    EXPO_ACCESS_TOKEN = "EXPO_ACCESS_TOKEN",
    KYC_URL = "KYC_URL",
    KYC_CLIENT_ID = "KYC_CLIENT_ID",
    KYC_CLIENT_SECRET = "KYC_CLIENT_SECRET",
    GPIB_API_ENDPOINT = "GPIB_API_ENDPOINT",
    COINSTASH_SIGNUP_ENDPOINT = "COINSTASH_SIGNUP_ENDPOINT",
    COINSTASH_TOKEN = "COINSTASH_TOKEN",
    APP_DEEPLINK_URL = "APP_DEEPLINK_URL",
    EC_SIGNUP_ENDPOINT = "EC_SIGNUP_ENDPOINT",
    DIGITALSURGE_SIGNUP_ENDPOINT = "DIGITALSURGE_SIGNUP_ENDPOINT",
    DIGITALSURGE_PARTNER_TOKEN = "DIGITALSURGE_PARTNER_TOKEN",
    WALLET_PRIVATE_KEY = "WALLET_PRIVATE_KEY",
    WALLET_ADDRESS = "WALLET_ADDRESS",
    IDEM_URL = "IDEM_URL",
    OTP_HASHING_SECRET = "OTP_HASHING_SECRET",
    OTP_HASHING_SALT = "OTP_HASHING_SALT",
    OTP_EXPIRY_TIME = "OTP_EXPIRY_TIME",
    MESSAGEBIRD_API_KEY = "MESSAGEBIRD_API_KEY",
    HTTPS_PROXY_HOST = "HTTPS_PROXY_HOST",
    HTTPS_PROXY_PORT = "HTTPS_PROXY_PORT",
    HTTPS_PROXY_PASSWORD = "HTTPS_PROXY_PASSWORD",
    HTTPS_PROXY_USERNAME = "HTTPS_PROXY_USERNAME",
    MAILJET_API_KEY = "MAILJET_API_KEY",
    MAILJET_SECRET = "MAILJET_SECRET",
    FROM_EMAIL_ADDRESS = "FROM_EMAIL_ADDRESS",
    WEBSITE_URL = "WEBSITE_URL",
    JWT_SECRET = "JWT_SECRET",
    JWT_EXPIRATION_SECONDS = "JWT_EXPIRATION_SECONDS",
    PGP_PASSPHRASE = "PGP_PASSPHRASE",
    PGP_PRIVATE_KEY = "PGP_PRIVATE_KEY",
    XERO_CLIENT_ID = "XERO_CLIENT_ID",
    XERO_CLIENT_SECRET = "XERO_CLIENT_SECRET",
    XERO_TENANT_ID = "XERO_TENANT_ID",
    XERO_SALES_CODE = "XERO_SALES_CODE",
    XERO_PRICE = "XERO_PRICE",
    XERO_GPIB_ID = "XERO_GPIB_ID",
    GREENID_URL = "GREENID_URL",
    GREENID_ACCOUNT_ID = "GREENID_ACCOUNT_ID",
    GREENID_PASSWORD = "GREENID_PASSWORD",
    REALLY_VERIFY_IDENTITY = "REALLY_VERIFY_IDENTITY"
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

export interface IGreenIdService {
    verify(
        user: greenid.RegisterVerificationData,
        licence?: greenid.LicenceData
    ): Promise<greenid.VerifyReturnData>;
}

export interface IKycService {
    verify(): Promise<KycResponse>;
}

export interface ISmsService {
    send(phoneNumber: string, message: string): Promise<void>;
}

export interface IUserService {
    requestToBeTester(body: TestFlightRequest): Promise<Tester>;
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
    requestOtp(body: RequestOtpRequest): Promise<RequestOtpResponse>;
    verifyOtp(body: VerifyOtpRequest): Promise<boolean>;
    addPublicKey(body: PublicKeyDto): Promise<boolean>;
    verifyEmail(email: string, token: string): Promise<boolean>;
    decodeEmailFromToken(token: string): Promise<string>;
    sendInvoices(authToken: XeroTokenSet, vendor: VendorEnum): Promise<string>;
}

export interface IEmailService {
    sendEmailVerification(email: string, token: string): Promise<void>;
}

export interface IThirdPartyService {
    signUp(signupInfo: UserSignupRequest, ip: string): Promise<SignupResponse>;
}

export interface IVendor {
    name: string;
    signUp(signupInfo: UserSignupRequest): Promise<{
        userId: string;
        password?: string;
    }>;
}

export interface IXeroService {
    sendInvoices(authToken: XeroTokenSet, vendor: VendorEnum): Promise<string>;
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
    hashEmail: string;
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
    emailVerified: boolean;
};

export type KycResponse = {
    result: KycResult;
    userId: string;
    thirdPartyVerified: boolean;
    signature: string; //signed claim response
    message: ClaimResponsePayload;
    hashedPayload: string;
};

export type GPIBVerifyRequest = {
    phoneNumber: string;
    email: string;
    userID: string;
    phoneNumberVerified: boolean;
    emailVerified: boolean;
    idVerified: boolean;
};

export type RequestOtpResponse = {
    hash: string;
    expiryTimestamp: number;
};

export type SignupResponse = {
    userId: string;
    password?: string;
};

// all optional params as documented by Xero
export type XeroTokenSet = {
    access_token?: string;
    token_type?: string;
    id_token?: string;
    refresh_token?: string;
    expires_in?: number;
    session_state?: string;
    scope?: string;
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

class Verification implements KycResponse {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    signature: string; //signed claim response
    @ApiProperty()
    @IsNotEmpty()
    @IsObject()
    message: ClaimResponsePayload;
    @ApiProperty()
    @IsNotEmpty()
    @IsEnum(KycResult)
    result: KycResult;
    @ApiProperty()
    @IsString()
    userId: string;
    @ApiProperty()
    @IsNotEmpty()
    @IsBoolean()
    thirdPartyVerified: boolean;
    @ApiProperty()
    @IsNotEmpty()
    hashedPayload: string;
}
export class UserSignupRequest {
    @ApiProperty({
        example: ["1", "2"]
    })
    @IsNotEmpty()
    source: number;
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
    email: string;
    @ApiProperty()
    @IsOptional()
    mobile: string;
    @ApiProperty()
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => Verification)
    verification: Verification;
    @ApiProperty()
    @IsOptional()
    dob: string;
}

export class UserDetailRequest {
    @ApiProperty()
    @IsNotEmpty()
    source: number;
    @ApiProperty()
    @IsNotEmpty()
    email: string;
    @ApiProperty()
    @IsNotEmpty()
    password: string;
    @ApiProperty()
    @IsNotEmpty()
    firstName: string;
    @ApiProperty()
    @IsNotEmpty()
    lastName: string;
    @ApiProperty()
    @IsNotEmpty()
    dob: string;
}

export class TestFlightRequest {
    @ApiProperty()
    @IsNotEmpty()
    email: string;
    @ApiProperty()
    @IsNotEmpty()
    firstName: string;
    @ApiProperty()
    @IsNotEmpty()
    lastName: string;
}

export class RequestOtpRequest {
    @ApiProperty()
    @IsNotEmpty()
    mobileNumber: string;
}

export class VerifyOtpRequest {
    @ApiProperty()
    @IsNotEmpty()
    code: string;
    @ApiProperty()
    @IsNotEmpty()
    expiryTimestamp: number;
    @ApiProperty()
    @IsNotEmpty()
    mobileNumber: string;
    @ApiProperty()
    @IsNotEmpty()
    hash: string;
}

export class PublicKeyDto {
    @ApiProperty()
    @IsNotEmpty()
    publicKeyArmored: string;
    @ApiProperty()
    @IsNotEmpty()
    hashEmail: string;
}
