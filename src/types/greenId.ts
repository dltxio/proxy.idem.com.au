import { ClaimType } from "./verification";

export type SetFieldsPayload = {
    sourceId: string;
    verificationId: string;
    inputFields: { input: SetFieldInput[] };
};

export type SetFieldInput = { name: string; value: string };

export type GetSourcesResult = {
    return: {
        registrationDetails: RegistrationDetails;
        sourceList: Source[];
        verificationResult: VerificationResult;
    };
};

export type VerifyProps = {
    user: RegisterVerificationData;
    licence?: LicenceData;
    medicare?: MedicareData;
};

export type Source = {
    available: boolean;
    name: string;
    notRequired: boolean;
    oneSourceLeft: boolean;
    order: number;
    passed: boolean;
    state: string;
    version: number;
};

export type RegistrationDetails = {
    currentResidentialAddress: object;
    dateCreated: Date;
    dob: object;
    email: string;
    name: object;
};

export type VerificationResult = {
    dateVerifed: Date;
    individualResult: [];
    overallVerificationStatus: string;
    ruleId: string;
    verificationId: string;
};

export type RegisterVerificationData = {
    ruleId: "default";
    name: Fullname;
    email?: string;
    currentResidentialAddress?: Address;
    previousResidentialAddress?: Address;
    dob: DOB;
    homePhone?: string;
    workPhone?: string;
    mobilePhone?: string;
};

export type Address = {
    country: string;
    flatNumber?: string;
    postcode: string;
    state: string;
    streetName: string;
    streetNumber: string;
    streetType: string;
    suburb: string;
};

export type RegisterVerificationResult = {
    return: {
        verificationResult: {
            overallVerificationStatus: "IN_PROGRESS";
            verificationId: string;
        };
    };
};

export type SetFieldResult = {
    return: {
        checkResult: { state: "VERIFIED" | "IN_PROGRESS" };
    };
};

export type State = "QLD" | "NSW" | "ACT" | "VIC" | "NT" | "SA" | "WA" | "TAS";

export type LicenceData = {
    state: State;
    licenceNumber: string;
    cardNumber: string;
    name: Fullname;
    dob: DOB;
};

export type VerifyResult =
    | {
          success: true;
          verificationId: string;
      }
    | { success: false };

export type Fullname = {
    givenName: string;
    middleNames?: string;
    surname: string;
};

export type DOB = {
    day: number;
    month: number;
    year: number;
};

export type MedicareData = {
    colour: "Green" | "Blue" | "Yellow";
    number: string;
    individualReferenceNumber: string;
    name: string;
    dob: DOB;
    expiry: string;
    name2?: string;
    name3?: string;
    name4?: string;
};

export type PassportData = {
    number: string;
    name: Fullname;
    dob: DOB;
};

export type BirthCertificateData = {
    number: string;
    state: State;
    name: Fullname;
    dob: DOB;
    registrationYear?: string;
    registrationDate?: string;
    certificateNumber?: string;
    certificatePrintedDate?: string;
};

export type GetVerificationResult = {
    return: {
        verificationResult: {
            overallVerificationStatus: "VERIFIED" | "IN_PROGRESS";
        };
    };
};

export type VerifyReturnData = {
    success: boolean;
    didJWTCredentials?: string[];
    didPGPCredentials?: PGPVerifiableCredential[];
};

export type UnverifiableCredential = {
    "@context": [string];
    type: [string, ClaimType];
    issuer: string;
    issuanceDate: string;
    expirationDate: string;
    credentialSubject: object;
};

export type PGPVerifiableCredential = {
    "@context": [string];
    type: [string, ClaimType];
    issuer: string;
    issuanceDate: string;
    expirationDate: string;
    credentialSubject: object;
    proof: {
        type: string;
        created: string;
        proofPurpose: string;
        verificationMethod: string;
        signatureValue: string;
    };
};
