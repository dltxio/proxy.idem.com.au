declare namespace greenid {
    type SetFieldsPayload = {
        sourceId: string;
        verificationId: string;
        inputFields: { input: SetFieldInput[] };
    };

    type SetFieldInput = { name: string; value: string };

    type GetSourcesResult = {
        return: {
            registrationDetails: registrationDetails;
            sourceList: Source[];
            verificationResult: verificationResult;
        };
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

    type registrationDetails = {
        currentResidentialAddress: object;
        dateCreated: Date;
        dob: object;
        email: string;
        name: object;
    };

    type verificationResult = {
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
        currentResidentialAddress: Address;
        previousResidentialAddress?: Address;
        dob: DOB;
        homePhone?: string;
        workPhone?: string;
        mobilePhone: string;
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

    type medicareData = {
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
}
