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
    "@context": ["https://www.w3.org/2018/credentials/v1"];
    type: ["VerifiableCredential", ClaimType];
    issuer: "https://idem.com.au/";
    issuanceDate: Date;
    expirationDate: Date;
    credentialSubject: string; // each claim type has it own value type. todo - make generic;
    proof: {
        type: "EcdsaSecp256k1Signature2019";
        created: Date;
        proofPurpose: "assertionMethod";
        verificationMethod: "https://idem.com.au/keys/0x90494cA0a639Bf52E65511afF6458b9AB5eA77De"; //Test ETH address, need to change to IDEM eth address
        // jws: "eyJhbGciOiJSUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..TCYt5XsITJX1CxPCT8yAV-TVkIEq_PbChOMqsLfRoPsnsgw5WEuts01mq-pQy7UJiN5mgRxD-WUcX16dUEMGlv50aqzpqh4Qktb3rk-BuQy72IFLOqV0G_zS245-kronKb78cPN25DGlcTwLtjPAYuNzVBAh4vGHSrQyHUdBBPM";
    };
};

export type ClaimResponsePayload = {
    "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://schema.org"
    ];
    type: "VerifiablePresentation";
    proof: {
        type: "EcdsaSecp256k1Signature2019";
        created: Date;
        proofPurpose: "authentication";
        verificationMethod: "did:idem:0x90494cA0a639Bf52E65511afF6458b9AB5eA77De";
        //challenge: "8b5c66c0-bceb-40b4-b099-d31b127bf7b3";
        domain: "https://demo.idem.com.au";
        //jws: "eyJhbGciOiJSUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..kTCYt5XsITJX1CxPCT8yAV-TVIw5WEuts01mq-pQy7UJiN5mgREEMGlv50aqzpqh4Qq_PbChOMqsLfRoPsnsgxD-WUcX16dUOqV0G_zS245-kronKb78cPktb3rk-BuQy72IFLN25DYuNzVBAh4vGHSrQyHUGlcTwLtjPAnKb78";
    };
    verifiableCredential: VerifiableCredential[];
};
