import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AxiosInstance } from "axios";
import { ConfigSettings, IVendor, UserSignupRequest } from "../../interfaces";

export class DigitalSurgeVendor implements IVendor {
    private readonly logger = new Logger("DigitalSurgeVendor");
    private signUpEndpoint: string;

    constructor(private config: ConfigService, private axios: AxiosInstance) {
        this.signUpEndpoint = this.config.get(
            ConfigSettings.DIGITALSURGE_SIGNUP_ENDPOINT
        );
    }
    async signUp(signupInfo: UserSignupRequest) {
        const { email, firstName, lastName, mobile } = signupInfo;

        const requestBody = {
            first_name: firstName,
            last_name: lastName,
            email,
            phone_number: mobile
        };

        const response = await this.axios
            .post(this.signUpEndpoint, JSON.stringify(requestBody), {
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
