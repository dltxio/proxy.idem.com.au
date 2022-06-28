import { UserSignupRequest, VenderEnum } from "./../interfaces";
import { ConfigService } from "@nestjs/config";
import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";
import {
    ConfigSettings,
    GPIBVerifyRequest,
    UserVerifyRequestBody,
    IThirdPartyService
} from "../interfaces";

@Injectable()
export class ThirdPartyService implements IThirdPartyService {
    private readonly logger = new Logger("ThirdPartyService");

    constructor(private config: ConfigService) {}

    public async verifyGPIB(userInfo: UserVerifyRequestBody): Promise<boolean> {
        try {
            const requestBody: GPIBVerifyRequest = {
                userID: userInfo.userId,
                phoneNumber: "0420552255", //TODO: get phone number from user
                email: userInfo.email,
                phoneNumberVerified: true, //Hardcoded for now
                emailVerified: true, //Hardcoded for now
                idVerified: true //Hardcoded for now
            };
            const endPoint = this.config.get(
                ConfigSettings.GPIB_VERIFY_ENDPOINT
            );
            await axios.post(endPoint, requestBody, {
                headers: {
                    "Content-Type": "application/json"
                }
            });

            this.logger.verbose(`Verified GPIB for user ${userInfo.userId}`);
            return true;
        } catch (error) {
            this.logger.error(error.message);
            throw new Error(error);
        }
    }

    public async signup(signupInfo: UserSignupRequest): Promise<string> {
        const requestBody = JSON.stringify({
            firstName: signupInfo?.firstName,
            lastName: signupInfo?.lastName,
            email: signupInfo.email,
            password: signupInfo.password,
            referralCode: "",
            trackAddress: true,
            CreateAddress: true
        });

        let endPoint: string;
        if (signupInfo.source === VenderEnum.GPIB) {
            endPoint = this.config.get(ConfigSettings.GPIB_SIGNUP_ENDPOINT);
        }

        try {
            const response = await axios.post(endPoint, requestBody, {
                headers: {
                    "Content-Type": "application/json"
                }
            });
            this.logger.verbose(
                `New user signup for ${signupInfo.source}, userId: ${response.data}`
            );
            return response.data;
        } catch (error) {
            this.logger.error(error.response.data);
            throw new Error(error.response.data);
        }
    }
}
