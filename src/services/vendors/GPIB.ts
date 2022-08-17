import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AxiosInstance } from "axios";
import { ConfigSettings, IVendor, UserSignupRequest } from "../../interfaces";

export class GPIBVendor implements IVendor {
    private readonly logger = new Logger("GPIBVendor");

    constructor(private config: ConfigService, private axios: AxiosInstance) {}
    async signUp(signupInfo: UserSignupRequest) {
        const { firstName, lastName, email, password } = signupInfo;

        const endPoint = `${this.config.get(
            ConfigSettings.GPIB_API_ENDPOINT
        )}/user`;
        const requestBody = {
            firstName,
            lastName,
            email,
            password,
            referralCode: "",
            trackAddress: true,
            createAddress: true
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
