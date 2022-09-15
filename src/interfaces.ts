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
import { ClaimResponsePayload } from "./types/verification";
import { Type } from "class-transformer";
import {
    EntityNames,
    KycResponse,
    KycResult,
    RequestOtpResponse,
    SignupResponse,
    UsersResponse,
    VendorEnum,
    XeroTokenSet
} from "./types/general";

export interface IExampleService {
    getById(id: string): string;
    getAll(): string[];
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
    verify(_props: greenid.verifyProps): Promise<greenid.VerifyReturnData>;
}

export interface IKycService {
    verify(): Promise<KycResponse>;
}

export interface ISmsService {
    send(phoneNumber: string, message: string): Promise<void>;
}

export interface IUserService {
    verify(body: VerifyUserRequest): Promise<string>;
    findOne(email: string): Promise<User>;
    findAll(): Promise<UsersResponse[]>;
    create(newUser: UserDto): Promise<void>;
    update(userId: string, requestBody: UserDto): Promise<User>;

    pushNotifications(message: string): Promise<void>;
    verifyEmail(token: string): Promise<boolean>;
    decodeEmailFromToken(token: string): Promise<string>;
    sendInvoices(body: SendInvoicesRequestBody): Promise<string>;
    resendEmailVerification(hashedEmail: string): Promise<boolean>;
}

export interface IOtpService {
    requestOtp(body: RequestOtp): Promise<RequestOtpResponse>;
    verifyOtp(body: VerifyOtp): Promise<boolean>;
}
export interface IEmailService {
    sendEmailVerification(email: string, token: string): Promise<void>;
}

export interface IThirdPartyService {
    signUp(signupInfo: UserSignupRequest, ip: string): Promise<SignupResponse>;
}

export interface IExchangeService {
    pushSignupNotification(
        signupRequest: ExchangeSignupCallBack,
        ip: string
    ): Promise<void>;
}

export interface IVendor {
    name: string;
    signUp(signupInfo: UserSignupRequest): Promise<{
        userId: string;
        password?: string;
    }>;
}

export interface IXeroService {
    sendInvoices(body: SendInvoicesRequestBody): Promise<string>;
}

export class UserDto {
    @ApiProperty()
    @IsNotEmpty()
    email: string;
    @ApiProperty()
    @IsOptional()
    expoToken: string;
    @ApiProperty()
    @IsOptional()
    pgpPublicKey: string;
}

export class VerifyUserRequest {
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

export class ExchangeSignupCallBack {
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

export class RequestOtp {
    @ApiProperty()
    @IsNotEmpty()
    mobileNumber: string;
}

export class VerifyOtp {
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

export class NotificationRequest {
    @ApiProperty()
    @IsNotEmpty()
    message: string;
}

export class ResendEmailRequestBody {
    @ApiProperty()
    @IsNotEmpty()
    hashedEmail: string;
}

export class SendInvoicesRequestBody {
    @ApiProperty()
    @IsNotEmpty()
    authToken: XeroTokenSet;
    @ApiProperty()
    @IsNotEmpty()
    vendor: VendorEnum;
}
