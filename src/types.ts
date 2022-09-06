import { ClaimResponsePayload } from "./types/verification";

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
    PGP_PRIVATE_KEY = "PGP_PRIVATE_KEY"
}

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
