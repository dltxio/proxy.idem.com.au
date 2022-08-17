import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AxiosInstance } from "axios";
import { ConfigSettings, UserSignupRequest, Vendor } from "src/interfaces";

export class CoinStashVendor implements Vendor {
    private readonly logger = new Logger("CoinStashVendor");

    constructor(private config: ConfigService, private axios: AxiosInstance) {}
    async signUp(signupInfo: UserSignupRequest) {
        const { firstName, lastName, email, password } = signupInfo;

        const endPoint = this.config.get(
            ConfigSettings.COINSTASH_SIGNUP_ENDPOINT
        );
        const requestBody = {
            email,
            password,
            displayName: `${firstName} ${lastName}`,
            country: "Australia",
            token: this.config.get(ConfigSettings.COINSTASH_TOKEN),
            acceptMarketing: false
        };
        const response = await this.axios
            .post(endPoint, JSON.stringify(requestBody))
            .catch(error => {
                this.logger.error(error.response.data);
                throw new Error(error.response.data);
            });
        const userId = response.data;
        return { userId };
    }
}
