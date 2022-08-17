import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AxiosInstance } from "axios";
import { ConfigSettings, UserSignupRequest, Vendor } from "../../interfaces";

export class DigitalSurgeVendor implements Vendor {
    private readonly logger = new Logger("DigitalSurgeVendor");

    constructor(private config: ConfigService, private axios: AxiosInstance) {}
    async signUp(signupInfo: UserSignupRequest) {
        const { email, firstName, lastName, mobile } = signupInfo;

        const endPoint = this.config.get(
            ConfigSettings.DIGITALSURGE_SIGNUP_ENDPOINT
        );
        const requestBody = {
            first_name: firstName,
            last_name: lastName,
            email,
            phone_number: mobile
        };

        const response = await this.axios
            .post(endPoint, JSON.stringify(requestBody), {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.config.get(
                        ConfigSettings.DIGITALSURGE_PARTNER_TOKEN
                    )}`
                }
            })
            .catch(error => {
                this.logger.error(error.response.data);
                throw new Error(error.response.data);
            });
        const userId = response.data;
        return { userId };
    }
}
