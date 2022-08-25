import { ConfigService } from "@nestjs/config";
import { Injectable, Logger } from "@nestjs/common";
import fsPromise from "fs/promises";
import Handlebars from "handlebars";
import mailJet, { Client } from "node-mailjet";
import { join } from "path";
import { ConfigSettings, IEmailService } from "./../interfaces";

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
            ConfigSettings.PROXY_API_URL
        )}/verifyEmail?email=${email}&token=${token}`;
        this.logger.log(`${email} Verification email sent`);
        const source = await fsPromise.readFile(
            join(__dirname, "../..", "/views/verifyEmailLink.hbs"),
            "utf8"
        );
        const template = Handlebars.compile(source);

        return this.sendRawEmail({
            to: email,
            toName: email,
            subject,
            html: template({ link })
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
        const request = this.emailClient
            .post("send", { version: "v3.1" })
            .request({
                messages: [
                    {
                        ...this.getMailJetBasePayload(params),
                        HtmlPart: params.html
                    }
                ]
            });
        request
            .then(result => {
                this.logger.log(result);
            })
            .catch(error => {
                this.logger.log(error);
            });
    };
}

type SimpleEmailParams = {
    to: string;
    toName: string;
    subject: string;
};

type RawEmailParams = SimpleEmailParams & {
    html: string;
};
