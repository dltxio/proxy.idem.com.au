declare namespace greenid {
    type SetFieldsPayload = {
        sourceId: string;
        verificationId: string;
        inputFields: { input: SetFieldInput[] };
    };

    type SetFieldInput = { name: string; value: string };

    type GetSourcesResult = {
        return: {
            registrationDetails: RegistrationDetails;
            sourceList: Source[];
            verificationResult: VerificationResult;
        };
    };

    type VerifyProps = {
        user: greenid.RegisterVerificationData;
        licence?: greenid.LicenceData;
        medicare?: greenid.MedicareData;
    };

    type Source = {
        available: boolean;
        name: string;
        notRequired: boolean;
        oneSourceLeft: boolean;
        order: number;
        passed: boolean;
        state: string;
        version: number;
    };

    type RegistrationDetails = {
        currentResidentialAddress: object;
        dateCreated: Date;
        dob: object;
        email: string;
        name: object;
    };

    type VerificationResult = {
        dateVerifed: Date;
        individualResult: [];
        overallVerificationStatus: string;
        ruleId: string;
        verificationId: string;
    };

    type RegisterVerificationData = {
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

    type Address = {
        country: string;
        flatNumber?: string;
        postcode: string;
        state: string;
        streetName: string;
        streetNumber: string;
        streetType: string;
        suburb: string;
    };

    type RegisterVerificationResult = {
        return: {
            verificationResult: {
                overallVerificationStatus: "IN_PROGRESS";
                verificationId: string;
            };
        };
    };

    type SetFieldResult = {
        return: {
            checkResult: { state: "VERIFIED" | "IN_PROGRESS" };
        };
    };

    type State = "QLD" | "NSW" | "ACT" | "VIC" | "NT" | "SA" | "WA" | "TAS";

    type LicenceData = {
        state: greenid.State;
        licenceNumber: string;
        cardNumber: string;
        name: Fullname;
        dob: DOB;
    };

    type VerifyResult =
        | {
              success: true;
              verificationId: string;
          }
        | { success: false };

    type Fullname = {
        givenName: string;
        middleNames?: string;
        surname: string;
    };

    type DOB = {
        day: number;
        month: number;
        year: number;
    };

    type MedicareData = {
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

    type PassportData = {
        number: string;
        name: Fullname;
        dob: DOB;
    };

    type BirthCertificateData = {
        number: string;
        state: State;
        name: Fullname;
        dob: DOB;
        registrationYear?: string;
        registrationDate?: string;
        certificateNumber?: string;
        certificatePrintedDate?: string;
    };

    type GetVerificationResult = {
        return: {
            verificationResult: {
                overallVerificationStatus: "VERIFIED" | "IN_PROGRESS";
            };
        };
    };

    type VerifyReturnData = {
        success: boolean;
        didJWTCredentials?: string[];
        didPGPCredentials?: VerifiableCredential[];
    };

    type UnverifiableCredential = {
        "@context": [string];
        type: [string, ClaimType];
        issuer: string;
        issuanceDate: string;
        expirationDate: string;
        credentialSubject: object;
    };

    type VerifiableCredential = {
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
}
