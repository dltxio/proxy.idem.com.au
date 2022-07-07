import {
    RequestType,
    UserDetailRequest,
    UserSignupRequest,
    VendorEnum
} from "./../interfaces";
import { ConfigService } from "@nestjs/config";
import { Inject, Injectable, Logger } from "@nestjs/common";
import axios, { AxiosError } from "axios";
import {
    ConfigSettings,
    GPIBVerifyRequest,
    UserVerifyRequestBody,
    IThirdPartyService
} from "../interfaces";
import { Repository } from "typeorm";
import { Request } from "../data/entities/request.entity";
import { getVendorName } from "../utils/vendor";
import moment from "moment";

@Injectable()
export class ThirdPartyService implements IThirdPartyService {
    private readonly logger = new Logger("ThirdPartyService");

    constructor(
        private config: ConfigService,
        @Inject("REQUEST_REPOSITORY")
        private requestRepository: Repository<Request>
    ) {}

    public async verifyGPIB(
        userInfo: UserVerifyRequestBody,
        ip: string
    ): Promise<boolean> {
        try {
            const requestBody: GPIBVerifyRequest = {
                userID: userInfo.userId,
                phoneNumber: "0420552255", //TODO: get phone number from user
                email: userInfo.email,
                phoneNumberVerified: true, //Hardcoded for now
                emailVerified: true, //Hardcoded for now
                idVerified: true //Hardcoded for now
            };
            const endPoint = this.config.get(ConfigSettings.GPIB_API_ENDPOINT);
            await axios.post(`${endPoint}/user/idem/verify`, requestBody, {
                headers: {
                    "Content-Type": "application/json"
                }
            });

            this.logger.verbose(`Verified GPIB for user ${userInfo.userId}`);

            //Save the verify request
            await this.requestRepository.save({
                from: "IDEM",
                to: getVendorName(VendorEnum.GPIB),
                ipAddress: ip,
                requestType: RequestType.Verify
            });
            return true;
        } catch (error) {
            this.logger.error(error.message);
            throw new Error(error);
        }
    }

    public async signup(
        signupInfo: UserSignupRequest,
        ip: string
    ): Promise<string> {
        let requestBody = {};
        let endPoint: string;

        if (signupInfo.source === VendorEnum.GPIB) {
            endPoint = `${this.config.get(
                ConfigSettings.GPIB_API_ENDPOINT
            )}/user`;
            requestBody = {
                firstName: signupInfo?.firstName,
                lastName: signupInfo?.lastName,
                email: signupInfo.email,
                password: signupInfo.password,
                referralCode: "",
                trackAddress: true,
                createAddress: true
            };
        }
        if (signupInfo.source === VendorEnum.CoinStash) {
            endPoint = this.config.get(
                ConfigSettings.COINSTASH_SIGNUP_ENDPOINT
            );
            requestBody = {
                email: signupInfo.email,
                password: signupInfo.password,
                displayName: `${signupInfo?.firstName} ${signupInfo?.lastName}`,
                country: "Australia",
                token: this.config.get(ConfigSettings.COINSTASH_TOKEN),
                acceptMarketing: false
            };
        }

        if (signupInfo.source === VendorEnum.EasyCrypto) {
            endPoint = this.config.get(ConfigSettings.EC_SIGNUP_ENDPOINT);
            requestBody = {
                email: signupInfo.email,
                password: signupInfo.password,
                returnSecureToken: true
            };
        }
        try {
            const response = await axios.post(
                endPoint,
                JSON.stringify(requestBody),
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
            this.logger.verbose(
                `New user signup for ${signupInfo.source}, userId: ${response.data}`
            );
            //Save the signup request
            await this.requestRepository.save({
                from: "IDEM",
                to: getVendorName(signupInfo.source),
                ipAddress: ip,
                requestType: RequestType.Signup
            });
            return response.data;
        } catch (error) {
            this.logger.error(error.response.data);
            throw new Error(error.response.data);
        }
    }

    public async syncDetail(userDetail: UserDetailRequest): Promise<void> {
        let endPoint: string;
        if (userDetail.source === VendorEnum.GPIB) {
            endPoint = this.config.get(ConfigSettings.GPIB_API_ENDPOINT);

            const authentication = await axios
                .post(
                    `${endPoint}/user/authenticate`,
                    JSON.stringify({
                        username: userDetail.email,
                        password: userDetail.password
                    }),
                    {
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                )
                .catch((error: AxiosError) => {
                    this.logger.error(error);
                    throw new Error(error.message);
                });
            if (authentication.status === 200) {
                const token = authentication.data.token;

                await axios
                    .put(
                        `${endPoint}/accountInfoes`,
                        JSON.stringify({
                            firstName: userDetail.firstName,
                            lastName: userDetail.lastName,
                            yob: moment(userDetail.dob, "DD/MM/YYYY").year()
                        }),
                        {
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`
                            }
                        }
                    )
                    .catch((error: AxiosError) => {
                        this.logger.error(error);
                        throw new Error(error.message);
                    });
            }
        }
        return;
    }
}
