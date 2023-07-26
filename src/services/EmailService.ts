import { ConfigService } from "@nestjs/config";
import { Injectable, Logger } from "@nestjs/common";
import mailJet, { Client } from "node-mailjet";
import { IEmailService } from "./../interfaces";
import * as openpgp from "openpgp";
import { ConfigSettings } from "../types/general";
import { RawEmailParams, SimpleEmailParams } from "../types/email";

@Injectable()
export class EmailService implements IEmailService {
    private readonly emailClient: Client;
    private readonly logger = new Logger("EmailService");

    constructor(private config: ConfigService) {
        this.emailClient = mailJet.apiConnect(
            this.config.get(ConfigSettings.MAILJET_API_KEY),
            this.config.get(ConfigSettings.MAILJET_SECRET)
        );
    }

    public sendEmailVerification = async (
        email: string,
        verificationCode: string
    ): Promise<void> => {
        const subject = `IDEM email verification`;
        this.logger.log(`${email} Verification code email sent`);
        const opt = {
            to: email,
            toName: email,
            subject,
            text: `Your confirmation code is ${verificationCode}.
             Enter the code in the IDEM mobile app to verify your email.`
        };
        return this.sendRawEmail(opt);
    };

    private getMailJetBasePayload = (params: SimpleEmailParams) => {
        return {
            From: {
                Email: this.config.get(ConfigSettings.FROM_EMAIL_ADDRESS),
                Name: "IDEM"
            },
            To: [
                {
                    Email: params.to,
                    Name: params.toName
                }
            ],
            Subject: params.subject,
            TextPart: "",
            CustomID: ""
        };
    };

    private sendRawEmail = async (params: RawEmailParams) => {
        try {
            const unsignedMessage = await openpgp.createCleartextMessage({
                text: params.text
            });

            const privateKeyArmored = this.config.get(
                ConfigSettings.PGP_PRIVATE_KEY
            );

            if (!privateKeyArmored) throw new Error("Idem PGP key not found");

            const privateKeys = await openpgp.readPrivateKeys({
                armoredKeys: privateKeyArmored
            });

            const passphrase = this.config.get(
                ConfigSettings.PGP_PASSPHRASE
            ) as string;

            const privateKey = await openpgp.decryptKey({
                privateKey: privateKeys[0],
                passphrase
            });

            const cleartextMessage = await openpgp.sign({
                message: unsignedMessage,
                signingKeys: privateKey
            });

            this.emailClient.post("send", { version: "v3.1" }).request({
                messages: [
                    {
                        ...this.getMailJetBasePayload(params),
                        TextPart: cleartextMessage
                    }
                ]
            });
        } catch (error) {
            this.logger.error(error);
            throw new Error(error);
        }
    };
}
