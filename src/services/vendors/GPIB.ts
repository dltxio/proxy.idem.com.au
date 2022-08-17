import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AxiosInstance } from "axios";
import { ConfigSettings, IVendor, UserSignupRequest } from "../../interfaces";

type SignupResponse = string;
export class GPIBVendor implements IVendor {
    name = "GPIB";
    private readonly logger = new Logger("GPIBVendor");
    private baseUrl: string;

    constructor(private config: ConfigService, private axios: AxiosInstance) {
        this.baseUrl = this.config.get(ConfigSettings.GPIB_API_ENDPOINT);
    }
    async signUp(signupInfo: UserSignupRequest) {
        const { firstName, lastName, email, password } = signupInfo;

        const endPoint = `${this.baseUrl}/user`;
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
            .post<SignupResponse>(endPoint, JSON.stringify(requestBody))
            .catch(error => {
                if (error.response) {
                    this.logger.error(error.response.data);
                    throw new Error(error.response.data);
                } else {
                    this.logger.error(error.message);
                    throw error;
                }
            });
        const userId = response.data;
        return { userId };
    }
}
