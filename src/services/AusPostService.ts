import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosInstance } from "axios";
import {
    ConfigSettings,
    IAusPostService,
    KycResult,
    UserVerifyRequestBody
} from "../interfaces";

@Injectable()
export class AusPostService implements IAusPostService {
    private client: AxiosInstance;
    private readonly logger = new Logger("AusPostService");
    constructor(private config: ConfigService) {
        this.client = axios.create({
            baseURL: this.config.get(ConfigSettings.AUS_POST_URL),
            headers: {
                "Content-Type": "application/json",
                Authorization:
                    "Basic " +
                    Buffer.from(
                        this.config.get(ConfigSettings.AUS_POST_CLIENT_ID) +
                            ":" +
                            this.config.get(
                                ConfigSettings.AUS_POST_CLIENT_SECRET
                            )
                    ).toString("base64")
            }
        });
    }

    public async verify(userInfo: UserVerifyRequestBody): Promise<KycResult> {
        try {
            //TODO: comment out code until we have live Aus Post account so we can test with really info
            // const requestBody: AusPostRequest = {
            //     given_name: userInfo.firstName,
            //     middle_name: userInfo.middleName ? userInfo.middleName : "",
            //     family_name: userInfo.lastName,
            //     dob: userInfo.dob,
            //     address: {
            //         unit_number: userInfo.houseNumber
            //             ? userInfo.houseNumber
            //             : "",
            //         street_number: userInfo.street,
            //         street_name: userInfo.street,
            //         street_type: userInfo.streetType,
            //         locality: userInfo.suburb,
            //         region: userInfo.state,
            //         postal_code: userInfo.postcode,
            //         country: userInfo.country
            //     },
            //     consent: "true"
            // };
            // // const response = (await this.client.post(
            // //     "verification",
            // //     requestBody
            // // )) as AusPostResponse;
            // console.log(requestBody);

            // if (response.verification_status === "completed") {
            //     //TODO: Implement user creation
            //     //Save: request
            //     return response;
            // }
            // if (response.verification_status === "failed") {
            //     this.logger.verbose(
            //         `User ${userInfo.email} failed verification`
            //     );
            //     throw new Error("Verification failed");
            // }
            // if (response.verification_status === "in_progress") {
            //     //TODO: maybe return need more info to app
            //     return response;
            // }
            return KycResult.Completed; // Hardcoded for now
        } catch (error) {
            this.logger.error(error.message);
            throw new Error(error);
        }
    }
}
