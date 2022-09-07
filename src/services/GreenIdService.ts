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
    private greenIdAccountId: string;
    private greenIdPassword: string;

    constructor(private config: ConfigService) {
        this.initialiseGreenIdClient(config.get(ConfigSettings.GREENID_URL));
        this.greenIdAccountId = this.config.get(
            ConfigSettings.GREENID_ACCOUNT_ID
        );
        this.greenIdPassword = this.config.get(ConfigSettings.GREENID_PASSWORD);
    }

    public verify = async (
        user: greenid.RegisterVerificationData,
        licence?: greenid.LicenceData
    ): Promise<greenid.VerifyResult> => {
        if (!user.mobilePhone) {
            const message = "User doesn't have a phone number";
            const error = new Error(message);
            this.logger.error(message, error);
            throw error;
        }

        if (
            this.config.get(ConfigSettings.REALLY_VERIFY_IDENTITY) === "false"
        ) {
            this.logger.debug("Mocking verification response to save money!");
            if (licence.number === "123456789") {
                return {
                    success: true,
                    verificationId: "DebugId"
                };
            }

            return { success: false };
        }

        const {
            return: {
                verificationResult: { verificationId }
            }
        } = await this.registerVerification(user);

        console.log("test");

        const result = await this.setFields({
            verificationId,
            sourceId: `${licence.state.toLowerCase()}regodvs`,
            inputFields: {
                input: this.getDriversLicenseeInputs(licence)
            }
        });

        if (result.return.checkResult.state === "VERIFIED") {
            return {
                success: true,
                verificationId
            };
        }

        return {
            success: false
        };
    };

    private async initialiseGreenIdClient(baseURL: string): Promise<void> {
        this.greenId = await new Promise<soap.Client>((resolve): void => {
            this.logger.log("Establishing GreenId connection");
            soapImport.createClient(
                baseURL,
                (error: unknown, client: soap.Client) => {
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

    public async getSources(verificationId: string): Promise<greenid.Source[]> {
        return new Promise<greenid.Source[]>((resolve, reject) => {
            this.greenId.getSources(
                {
                    verificationId: verificationId,
                    accountId: this.greenIdAccountId,
                    password: this.greenIdPassword
                },
                (error: unknown, result: greenid.GetSourcesResult) => {
                    if (error) {
                        reject(error);
                    }

                    resolve(result?.return?.sourceList ?? []);
                }
            );
        });
    }

    private async registerVerification(
        data: greenid.RegisterVerificationData
    ): Promise<greenid.RegisterVerificationResult> {
        console.log(data);
        return new Promise<greenid.RegisterVerificationResult>(
            (resolve, reject) => {
                this.greenId.registerVerification(
                    {
                        ...data,
                        accountId: this.greenIdAccountId,
                        password: this.greenIdPassword
                    },
                    (
                        error: unknown,
                        result: greenid.RegisterVerificationResult
                    ) => {
                        if (error) {
                            reject(error);
                        }

                        resolve(result);
                    }
                );
            }
        );
    }

    private setFields = async (
        data: greenid.SetFieldsPayload
    ): Promise<greenid.SetFieldResult> => {
        return new Promise<greenid.SetFieldResult>((resolve, reject) => {
            this.greenId.setFields(
                {
                    ...data,
                    accountId: this.greenIdAccountId,
                    password: this.greenIdPassword
                },
                (error: unknown, result: greenid.SetFieldResult) => {
                    if (error) {
                        reject(error);
                    }

                    resolve(result);
                }
            );
        });
    };

    private getDriversLicenseeInputs = (data: greenid.LicenceData) => {
        const state = data.state.toLowerCase();
        const variables = [
            {
                name: `greenid_${state}regodvs_number`,
                value: data.number
            },
            {
                name: `greenid_${state}regodvs_givenname`,
                value: data.name.givenName
            },
            {
                name: `greenid_${state}regodvs_surname`,
                value: data.name.surname
            },
            {
                name: `greenid_${state}regodvs_dob`,
                value: `${data.dob.day}/${data.dob.month}/${data.dob.year}`
            },
            {
                name: `greenid_${state}regodvs_tandc`,
                value: "on"
            }
        ];

        if (data.name.middleNames) {
            variables.push({
                name: `greenid_${state}regodvs_middlename`,
                value: data.name.middleNames
            });
        }

        return variables;
    };
}
