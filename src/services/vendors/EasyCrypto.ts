import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AxiosInstance } from "axios";
import { ConfigSettings, UserSignupRequest, Vendor } from "../../interfaces";

export class EasyCryptoVendor implements Vendor {
    private readonly logger = new Logger("EasyCryptoVendor");

    constructor(private config: ConfigService, private axios: AxiosInstance) {}
    async signUp(signupInfo: UserSignupRequest) {
        const { email, password } = signupInfo;

        const endPoint = this.config.get(ConfigSettings.EC_SIGNUP_ENDPOINT);
        const requestBody = {
            email,
            password,
            returnSecureToken: true
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
