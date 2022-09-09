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

    public async verify(
        user: greenid.RegisterVerificationData,
        licence?: greenid.LicenceData
    ): Promise<greenid.VerifyResult> {
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
            if (licence.licenceNumber === "123456789") {
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
    }

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

    private async setFields(
        data: greenid.SetFieldsPayload
    ): Promise<greenid.SetFieldResult> {
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
    }

    private getDriversLicenseeInputs(data: greenid.LicenceData) {
        const state = data.state.toLowerCase();
        const variables = [
            {
                name: `greenid_${state}regodvs_number`,
                value: data.licenceNumber
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
            },
            {
                name: `greenid_${state}regodvs_cardnumber`,
                value: data.cardNumber
            }
        ];

        if (data.name.middleNames) {
            variables.push({
                name: `greenid_${state}regodvs_middlename`,
                value: data.name.middleNames
            });
        }

        return variables;
    }

    private getMedicareInputs(data: greenid.medicareData) {
        const variables = [
            {
                name: `greenid_medicaredvs_cardColour`,
                value: data.colour
            },
            {
                name: `greenid_medicaredvs_number`,
                value: data.number
            },
            {
                name: `greenid_medicaredvs_individualReferenceNumber`,
                value: data.individualReferenceNumber
            },
            {
                name: `greenid_medicaredvs_nameOnCard`,
                value: data.name
            },
            {
                name: `greenid_medicaredvs_dob`,
                value: `${data.dob.day}/${data.dob.month}/${data.dob.year}`
            },
            {
                name: `greenid_medicaredvs_expiry`,
                value: data.expiry
            },
            {
                name: `greenid_medicaredvs_tandc`,
                value: "on"
            }
        ];

        if (data.name2) {
            variables.push({
                name: `greenid_medicaredvs_nameLine2`,
                value: data.name2
            });
        }

        if (data.name3) {
            variables.push({
                name: `greenid_medicaredvs_nameLine3`,
                value: data.name3
            });
        }

        if (data.name4) {
            variables.push({
                name: `greenid_medicaredvs_nameLine4`,
                value: data.name4
            });
        }
    }

    private getPassportInputs(data: greenid.PassportData) {
        const variables = [
            {
                name: `greenid_passportdvs_number`,
                value: data.number
            },
            {
                name: `greenid_passportdvs_givenname`,
                value: data.name.givenName
            },
            {
                name: `greenid_passportdvs_surname`,
                value: data.name.surname
            },
            {
                name: `greenid_passportdvs_dob`,
                value: `${data.dob.day}/${data.dob.month}/${data.dob.year}`
            },
            {
                name: `greenid_passportdvs_tandc`,
                value: "on"
            }
        ];

        if (data.name.middleNames) {
            variables.push({
                name: `greenid_passportdvs_middlename`,
                value: data.name.middleNames
            });
        }
    }

    private getBirthCertificateInputs(data: greenid.BirthCertificateData) {
        const variables = [
            {
                name: `greenid_birthcertificatedvs_registration_number`,
                value: data.number
            },
            {
                name: `greenid_birthcertificatedvs_registration_state`,
                value: data.state
            },
            {
                name: `greenid_birthcertificatedvs_givenname`,
                value: data.name.givenName
            },
            {
                name: `greenid_birthcertificatedvs_surname`,
                value: data.name.surname
            },
            {
                name: `greenid_birthcertificatedvs_dob`,
                value: `${data.dob.day}/${data.dob.month}/${data.dob.year}`
            },
            {
                name: `greenid_birthcertificatedvs_tandc`,
                value: "on"
            }
        ];

        if (data.registrationYear) {
            variables.push({
                name: `greenid_birthcertificatedvs_registration_year`,
                value: data.registrationYear
            });
        }
        if (data.registrationDate) {
            variables.push({
                name: `greenid_birthcertificatedvs_registration_date`,
                value: data.registrationDate
            });
        }
        if (data.certificateNumber) {
            variables.push({
                name: `greenid_birthcertificatedvs_certificate_number`,
                value: data.certificateNumber
            });
        }
        if (data.certificatePrintedDate) {
            variables.push({
                name: `greenid_birthcertificatedvs_certificate_printed_date`,
                value: data.certificatePrintedDate
            });
        }
        if (data.name.middleNames) {
            variables.push({
                name: `greenid_birthcertificatedvs_middlename`,
                value: data.name.middleNames
            });
        }
    }
}
