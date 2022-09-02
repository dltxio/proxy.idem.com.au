import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ConfigSettings, IGreenIdService } from "../interfaces";
import soap from "soap";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const soapImport = require("soap");

@Injectable()
export class GreenIdService implements IGreenIdService {
    private greenId: soap.Client;
    private readonly logger = new Logger("GreenIdService");

    constructor(private config: ConfigService) {
        this.initialiseGreenIdClient(config.get(ConfigSettings.GREENID_URL));
    }

    private async initialiseGreenIdClient(baseURL: string): Promise<void> {
        this.greenId = await new Promise<soap.Client>((resolve): void => {
            this.logger.log("Establishing GreenId connection");
            soapImport.createClient(
                baseURL,
                (error: any, client: soap.Client) => {
                    if (error || !client) {
                        this.logger.debug(
                            "Error establishing Green ID connection. Retrying...",
                            error
                        );
                        setTimeout(
                            () => this.initialiseGreenIdClient(baseURL),
                            5000
                        );
                    } else {
                        resolve(client);
                    }
                }
            );
        });
    }

    public async getSources(verificationId: string): Promise<Source[]> {
        return new Promise<Source[]>((resolve, reject) => {
            this.greenId.getSources(
                {
                    verificationId: verificationId,
                    accountId: this.config.get(
                        ConfigSettings.GREENID_ACCOUNT_ID
                    ),
                    password: this.config.get(ConfigSettings.GREENID_PASSWORD)
                },
                (error: any, result: GetSourcesResult) => {
                    if (error) {
                        reject(error);
                    }

                    resolve(result?.return?.sourceList ?? error);
                }
            );
        });
    }
}

export type GetSourcesResult = {
    return: {
        registrationDetails: registrationDetails;
        sourceList: Source[];
        verificationResult: verificationResult;
    };
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

export type registrationDetails = {
    currentResidentialAddress: object;
    dateCreated: Date;
    dob: object;
    email: string;
    name: object;
};

export type verificationResult = {
    dateVerifed: Date;
    individualResult: [];
    overallVerificationStatus: string;
    ruleId: string;
    verificationId: string;
};
