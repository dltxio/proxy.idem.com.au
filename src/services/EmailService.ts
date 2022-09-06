import { ConfigService } from "@nestjs/config";
import { Injectable, Logger } from "@nestjs/common";
import mailJet, { Client } from "node-mailjet";
import { IEmailService } from "./../interfaces";
import * as openpgp from "openpgp";
import { ConfigSettings } from "../types";

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
        token: string
    ): Promise<void> => {
        const subject = `PGP key email verification`;
        const link = `${this.config.get(
            ConfigSettings.WEBSITE_URL
        )}/verify-email?token=${token}`;
        this.logger.log(`${email} Verification email sent`);

        return this.sendRawEmail({
            to: email,
            toName: email,
            subject,
            text: `Please click here ${link} to verify your email.`
        });
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

type SimpleEmailParams = {
    to: string;
    toName: string;
    subject: string;
};

type RawEmailParams = SimpleEmailParams & {
    text: string;
};
