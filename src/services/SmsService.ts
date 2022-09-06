import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Messagebird, { MessageBird } from "messagebird";
import { ConfigSettings } from "../types";
import { ISmsService } from "../interfaces";

@Injectable()
export class SmsService implements ISmsService {
    private client: MessageBird;
    private readonly logger = new Logger("SmsService");
    constructor(private config: ConfigService) {
        this.client = Messagebird(
            this.config.get(ConfigSettings.MESSAGEBIRD_API_KEY)
        );
    }
    public async send(phoneNumber: string, message: string) {
        if (phoneNumber.startsWith("0")) {
            const [, ...rest] = phoneNumber.split("");
            phoneNumber = "+61" + rest.join("");
        }
        return new Promise<void>((resolve, reject) => {
            this.client.messages.create(
                {
                    originator: "IDEM",
                    recipients: [phoneNumber],
                    body: message
                },
                (error, response) => {
                    if (error) {
                        this.logger.error("Error sending SMS via MessageBird", {
                            phoneNumber,
                            error
                        });
                        return reject(error);
                    }

                    this.logger.log("SMS sent via MessageBird", {
                        ref: response.href
                    });
                    resolve();
                }
            );
        });
    }
}
