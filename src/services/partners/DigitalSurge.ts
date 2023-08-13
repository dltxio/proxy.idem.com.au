import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AxiosInstance } from "axios";
import { IVendor, UserSignupRequest } from "../../interfaces";
import { ConfigSettings } from "../../types/general";

export class DigitalSurgeVendor implements IVendor {
    name = "DigitalSurge";
    private readonly logger = new Logger("DigitalSurgeVendor");
    private signUpEndpoint: string;

    constructor(private config: ConfigService, private axios: AxiosInstance) {
        this.signUpEndpoint = this.config.get(
            ConfigSettings.DIGITALSURGE_SIGNUP_ENDPOINT
        );
    }

    public async signUp(signupInfo: UserSignupRequest) {
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
                if (error.response) {
                    this.logger.error(error.response.data.message);
                    throw new Error(error.response.data.message);
                }
                this.logger.error(error.message);
                throw error;
            });
        const { token, password } = response.data;
        return { userId: token, password: password };
    }
}
