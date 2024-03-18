import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosInstance } from "axios";
import { IVendor, UserSignupRequest } from "../../interfaces";

export class Syla implements IVendor {
    name = "GPIB";
    private readonly logger = new Logger("Syla");
    private baseUrl: string;

    constructor(
        private config: ConfigService,
        private axiosInstance: AxiosInstance
    ) {
        this.baseUrl = "https://api.syla.com.au";
    }

    public async signUp(signupInfo: UserSignupRequest) {
        const { email, password } = signupInfo;
        const endPoint = `${this.baseUrl}/user`;
        const requestBody = {
            accountType: "individual",
            accountSubType: "investor",
            email,
            password
        };

        const response = await axios.request({
            method: "POST",
            url: endPoint,
            data: requestBody,
            headers: {
                "Content-Type": "application/json"
            }
        });

        const userId = response.data;
        return { userId };
    }
}
