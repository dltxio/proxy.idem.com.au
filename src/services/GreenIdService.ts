import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
    ConfigSettings,
    IGreenIdService,
    testSoapResponse
} from "../interfaces";
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
            this.logger.debug("Establishing GreenId connection");
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

    public async testSoap(): Promise<void> {
        this.greenId.getSources(
            {
                verifcationId: "Fw8xLbae",
                accountId: this.config.get(ConfigSettings.GREENID_ACCOUNT_ID),
                password: this.config.get(ConfigSettings.GREENID_PASSWORD)
            },
            (error: any, result: GetSourcesResult) => {
                console.log(error);
                console.log(result);
            }
        );
    }
}

export type GetSourcesResult = {
    return: {
        checkResult: { state: "VERIFIED" | "IN_PROGRESS" };
    };
};
