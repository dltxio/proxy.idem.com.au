import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosInstance } from "axios";
import { IVendor, UserSignupRequest } from "../../interfaces";
import { ConfigSettings } from "../../types/general";
import moment from "moment";
import crypto from "crypto";

export class GPIBVendor implements IVendor {
    name = "GPIB";
    private readonly logger = new Logger("GPIBVendor");
    private baseUrl: string;

    constructor(
        private config: ConfigService,
        private axiosInstance: AxiosInstance
    ) {
        this.baseUrl = this.config.get(ConfigSettings.GPIB_API_ENDPOINT);
    }

    public async signUp(signupInfo: UserSignupRequest) {
        const { firstName, lastName, email, password, verification, mobile } =
            signupInfo;

        const endPoint = `${this.baseUrl}/User/idem`;
        const referralCode = this.config.get(ConfigSettings.GPIB_REFERRAL_CODE);

        // GPIB C# needs capitalised keys
        const requestBody = {
            FirstName: firstName,
            LastName: lastName,
            Email: email,
            Password: password,
            ReferralCode: referralCode ?? "",
            Mobile: mobile.trim(),
            YOB: moment(signupInfo.dob, "DD/MM/YYYY").year(),
            TrackHDAddress: true,
            CreateHDAddress: true,
            HashedPayload: "", //verification.hashedPayload,
            Signature: "", // verification.signature
            Nonce: crypto.randomUUID()
        };

        console.log("GPIB Signup Request", requestBody);

        const response = await axios.request({
            method: "POST",
            url: "https://testapi.getpaidinbitcoin.com.au/User/idem",
            data: requestBody,
            headers: {
                "Content-Type": "application/json"
            }
        });

        // const response = await this.axiosInstance
        //     .post<SignupResponse>(endPoint, JSON.stringify(requestBody), config)
        //     .catch(error => {
        //         if (error.response) {
        //             this.logger.error(error.response.data);
        //             throw new Error(error.response.data);
        //         }
        //         this.logger.error(error.message);
        //         throw error;
        //     });

        const userId = response.data;
        return { userId };
    }
}
