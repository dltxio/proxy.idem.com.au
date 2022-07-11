export type ClaimType =
    | "AdultCredential"
    | "BirthCredential"
    | "NameCredential"
    | "EmailCredential"
    | "MobileCredential"
    | "AddressCredential"
    | "TaxCredential"
    | "ProfileImageCredential";

export type VerifiableCredential = {
    "@context": [string];
    type: [string, ClaimType];
    issuer: string;
    issuanceDate: Date;
    expirationDate: Date;
    credentialSubject: string; // each claim type has it own value type. todo - make generic;
    proof: {
        type: string;
        created: Date;
        proofPurpose: string;
        verificationMethod: string; //Test ETH address, need to change to IDEM eth address
        // jws: "eyJhbGciOiJSUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..TCYt5XsITJX1CxPCT8yAV-TVkIEq_PbChOMqsLfRoPsnsgw5WEuts01mq-pQy7UJiN5mgRxD-WUcX16dUEMGlv50aqzpqh4Qktb3rk-BuQy72IFLOqV0G_zS245-kronKb78cPN25DGlcTwLtjPAYuNzVBAh4vGHSrQyHUdBBPM";
    };
};

export type ClaimResponsePayload = {
    "@context": [string, string];
    type: string;
    proof: {
        type: string;
        created: Date;
        proofPurpose: string;
        verificationMethod: string;
        //challenge: "8b5c66c0-bceb-40b4-b099-d31b127bf7b3";
        domain: string;
        //jws: "eyJhbGciOiJSUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..kTCYt5XsITJX1CxPCT8yAV-TVIw5WEuts01mq-pQy7UJiN5mgREEMGlv50aqzpqh4Qq_PbChOMqsLfRoPsnsgxD-WUcX16dUOqV0G_zS245-kronKb78cPktb3rk-BuQy72IFLN25DYuNzVBAh4vGHSrQyHUGlcTwLtjPAnKb78";
    };
    verifiableCredential: VerifiableCredential[];
};
