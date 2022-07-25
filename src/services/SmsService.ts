import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Messagebird, { MessageBird } from "messagebird";
import { ConfigSettings, ISmsService } from "src/interfaces";

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
        return new Promise<void>((resolve, reject) => {
            this.client.messages.create(
                {
                    originator: "+61456619631", //TODO: IDEM number
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
