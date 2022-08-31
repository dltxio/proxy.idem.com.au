import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AxiosInstance } from "axios";
import { createRandomPassword } from "src/utils/randomPassword-utils";
import { ConfigSettings, IVendor, UserSignupRequest } from "../../interfaces";

export class CoinStashVendor implements IVendor {
    name = "CoinStash";
    private readonly logger = new Logger("CoinStashVendor");
    private signUpEndpoint: string;

    constructor(private config: ConfigService, private axios: AxiosInstance) {
        this.signUpEndpoint = this.config.get(
            ConfigSettings.COINSTASH_SIGNUP_ENDPOINT
        );
    }
    async signUp(signupInfo: UserSignupRequest) {
        const { firstName, lastName, email } = signupInfo;
        const tempPassword = createRandomPassword();

        const requestBody = {
            email,
            password: tempPassword,
            displayName: `${firstName} ${lastName}`,
            country: "Australia",
            token: this.config.get(ConfigSettings.COINSTASH_TOKEN),
            acceptMarketing: false
        };
        const response = await this.axios
            .post(this.signUpEndpoint, JSON.stringify(requestBody))
            .catch(error => {
                if (error.response) {
                    this.logger.error(error.response.data);
                    throw new Error(error.response.data);
                }
                this.logger.error(error.message);
                throw error;
            });
        const userId = response.data;
        return { userId, tempPassword };
    }
}
