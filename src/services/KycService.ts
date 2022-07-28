import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosInstance } from "axios";
import {
    ClaimResponsePayload,
    VerifiableCredential
} from "../types/verification";
import {
    ConfigSettings,
    IKycService,
    KycResponse,
    KycResult
} from "../interfaces";
import { signMessage } from "../utils/wallet";

@Injectable()
export class KycService implements IKycService {
    private client: AxiosInstance;
    private readonly logger = new Logger("KycService");
    constructor(private config: ConfigService) {
        this.client = axios.create({
            baseURL: this.config.get(ConfigSettings.KYC_URL),
            headers: {
                "Content-Type": "application/json",
                Authorization:
                    "Basic " +
                    Buffer.from(
                        this.config.get(ConfigSettings.KYC_CLIENT_ID) +
                            ":" +
                            this.config.get(ConfigSettings.KYC_CLIENT_SECRET)
                    ).toString("base64")
            }
        });
    }

    public async verify(): Promise<KycResponse> {
        try {
            //TODO: hardcoded responsePayload
            const credentials = {
                "@context": ["https://www.w3.org/2018/credentials/v1"],
                type: ["VerifiableCredential", "BirthCredential"],
                issuer: this.config.get(ConfigSettings.IDEM_URL),
                issuanceDate: new Date(),
                expirationDate: new Date(),
                credentialSubject: "BirthCredential", // each claim type has it own value type. todo - make generic;
                proof: {
                    type: "EcdsaSecp256k1Signature2019",
                    created: new Date(),
                    proofPurpose: "assertionMethod",
                    verificationMethod: `${this.config.get(
                        ConfigSettings.IDEM_URL
                    )}keys/${this.config.get(ConfigSettings.WALLET_ADDRESS)}` //Test ETH address, need to change to IDEM eth address
                    // jws: "eyJhbGciOiJSUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..TCYt5XsITJX1CxPCT8yAV-TVkIEq_PbChOMqsLfRoPsnsgw5WEuts01mq-pQy7UJiN5mgRxD-WUcX16dUEMGlv50aqzpqh4Qktb3rk-BuQy72IFLOqV0G_zS245-kronKb78cPN25DGlcTwLtjPAYuNzVBAh4vGHSrQyHUdBBPM";
                }
            } as VerifiableCredential;

            const claimPayload = {
                "@context": [
                    "https://www.w3.org/2018/credentials/v1",
                    "https://schema.org"
                ],
                type: "VerifiablePresentation",
                proof: {
                    type: "EcdsaSecp256k1Signature2019",
                    created: new Date(),
                    proofPurpose: "authentication",
                    verificationMethod: `did:idem:${this.config.get(
                        ConfigSettings.WALLET_ADDRESS
                    )}`,
                    //challenge: "8b5c66c0-bceb-40b4-b099-d31b127bf7b3";
                    domain: this.config.get(ConfigSettings.IDEM_URL)
                    //jws: "eyJhbGciOiJSUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..kTCYt5XsITJX1CxPCT8yAV-TVIw5WEuts01mq-pQy7UJiN5mgREEMGlv50aqzpqh4Qq_PbChOMqsLfRoPsnsgxD-WUcX16dUOqV0G_zS245-kronKb78cPktb3rk-BuQy72IFLN25DYuNzVBAh4vGHSrQyHUGlcTwLtjPAnKb78";
                },
                verifiableCredential: [credentials]
            } as ClaimResponsePayload;
            return {
                result: KycResult.Completed,
                message: await signMessage(
                    JSON.stringify(claimPayload),
                    this.config,
                    this.logger
                ),
                thirdPartyVerified: false,
                userId: "",
                claimPayload
            };
        } catch (error) {
            this.logger.error(error.message);
            throw new Error(error);
        }
    }
}
