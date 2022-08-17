import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AxiosInstance } from "axios";
import { ConfigSettings, IVendor, UserSignupRequest } from "../../interfaces";

export class EasyCryptoVendor implements IVendor {
    private readonly logger = new Logger("EasyCryptoVendor");
    private signUpEndpoint: string;

    constructor(private config: ConfigService, private axios: AxiosInstance) {
        this.signUpEndpoint = this.config.get(
            ConfigSettings.EC_SIGNUP_ENDPOINT
        );
    }
    async signUp(signupInfo: UserSignupRequest) {
        const { email, password } = signupInfo;

        const requestBody = {
            email,
            password,
            returnSecureToken: true
        };
        const response = await this.axios
            .post(this.signUpEndpoint, JSON.stringify(requestBody))
            .catch(error => {
                this.logger.error(error.response.data);
                throw new Error(error.response.data);
            });
        const userId = response.data;
        return { userId };
    }
}
