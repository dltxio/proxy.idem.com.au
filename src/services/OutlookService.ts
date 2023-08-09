import { ConfigService } from "@nestjs/config";
import { Injectable, Logger } from "@nestjs/common";
import { Client } from "node-mailjet";
import { IEmailService, IOauthService } from "./../interfaces";
import * as openpgp from "openpgp";
import { ConfigSettings, RawEmailParams } from "../types/general";

@Injectable()
export class OutlookService implements IEmailService, IOauthService {
    private readonly emailClient: Client;
    private readonly logger = new Logger("OutlookService");

    constructor(private config: ConfigService) {}

    public async refreshTokens(): Promise<void> {
        throw new Error("Method not implemented.");
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

            throw new Error("Method not implemented.");
        } catch (error) {
            this.logger.error(error);
            throw new Error(error);
        }
    };
}
